import { ipcMain, BrowserWindow } from 'electron';
import { runSystemCheck } from './detection';
import { runCommand, runCommandWithArgs, streamCommand, sanitizeIdentifier, sanitizePort } from './commands';
import { saveWizardState, loadWizardState } from './state';
import { buildConfigCommand, installSkills, configureChannels, configureHooks } from './config';
import { attemptSelfHeal } from './self-heal';
import * as os from 'os';

function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows();
  return windows.length > 0 ? windows[0] : null;
}

export function registerIpcHandlers(): void {
  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  ipcMain.handle('system-check', async () => {
    return runSystemCheck();
  });

  ipcMain.handle('run-install', async () => {
    const win = getMainWindow();
    if (!win) throw new Error('No window available');

    const steps = [
      { id: 'download', label: 'Downloading OpenClaw package', cmd: 'npm install -g openclaw@latest' },
    ];

    for (const step of steps) {
      win.webContents.send('install-progress', { step: step.label, status: 'running' });
      try {
        await streamCommand(step.cmd, (stream, text) => {
          win.webContents.send('command-output', { stream, text });
        });
        win.webContents.send('install-progress', { step: step.label, status: 'complete' });
      } catch (error) {
        // Attempt self-heal before failing
        const healed = await attemptSelfHeal(step.cmd, error as Error, (text) => {
          win.webContents.send('command-output', { stream: 'stderr', text: `[Self-heal] ${text}\n` });
        });
        if (healed) {
          // Retry after self-heal
          await streamCommand(step.cmd, (stream, text) => {
            win.webContents.send('command-output', { stream, text });
          });
          win.webContents.send('install-progress', { step: step.label, status: 'complete' });
        } else {
          win.webContents.send('install-progress', { step: step.label, status: 'error' });
          throw error;
        }
      }
    }

    // Verify installation
    win.webContents.send('install-progress', { step: 'Verifying installation', status: 'running' });
    try {
      const result = await runCommand('openclaw --version');
      win.webContents.send('install-progress', { step: `OpenClaw ${result.stdout.trim()} installed`, status: 'complete' });
    } catch {
      const healed = await attemptSelfHeal('openclaw --version', new Error('command not found'), (text) => {
        win.webContents.send('command-output', { stream: 'stderr', text: `[Self-heal] ${text}\n` });
      });
      if (healed) {
        const result = await runCommand('openclaw --version');
        win.webContents.send('install-progress', { step: `OpenClaw ${result.stdout.trim()} installed`, status: 'complete' });
      } else {
        win.webContents.send('install-progress', { step: 'Verifying installation', status: 'error' });
        throw new Error('OpenClaw installation could not be verified');
      }
    }
  });

  ipcMain.handle('validate-key', async (_event, provider: string, key: string) => {
    // Validate provider is a known value
    const validProviders = ['anthropic', 'openai', 'google', 'ollama'];
    if (!validProviders.includes(provider)) {
      return { valid: false, error: `Unknown provider: ${provider}` };
    }

    try {
      let args: string[];
      switch (provider) {
        case 'anthropic':
          // Use /v1/models endpoint — no tokens consumed, just validates the key
          args = [
            '-s', '-o', '/dev/null', '-w', '%{http_code}',
            '-H', `x-api-key: ${key}`,
            '-H', 'anthropic-version: 2023-06-01',
            'https://api.anthropic.com/v1/models',
          ];
          break;
        case 'openai':
          args = [
            '-s', '-o', '/dev/null', '-w', '%{http_code}',
            '-H', `Authorization: Bearer ${key}`,
            'https://api.openai.com/v1/models',
          ];
          break;
        case 'google':
          args = [
            '-s', '-o', '/dev/null', '-w', '%{http_code}',
            '-H', `x-goog-api-key: ${key}`,
            'https://generativelanguage.googleapis.com/v1/models',
          ];
          break;
        case 'ollama':
          args = [
            '-s', '-o', '/dev/null', '-w', '%{http_code}',
            'http://localhost:11434/api/tags',
          ];
          break;
        default:
          return { valid: false, error: `Unknown provider: ${provider}` };
      }

      // Use execFile (no shell) — prevents command injection via API keys
      const result = await runCommandWithArgs('curl', args);
      const status = parseInt(result.stdout.trim(), 10);
      if (status >= 200 && status < 300) {
        return { valid: true };
      }
      return { valid: false, error: `API returned status ${status}. Check your key and try again.` };
    } catch (error) {
      return { valid: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('configure', async (_event, config: Record<string, unknown>) => {
    const win = getMainWindow();
    try {
      // Build and run the openclaw onboard command
      const onboardCmd = buildConfigCommand(config);
      if (win) {
        await streamCommand(onboardCmd, (stream, text) => {
          win.webContents.send('command-output', { stream, text });
        }, { timeoutMs: 60000 });
      } else {
        await runCommand(onboardCmd);
      }

      // Install skills
      const skills = config.skills as string[] | undefined;
      if (skills && skills.length > 0) {
        await installSkills(skills, (text) => {
          if (win) win.webContents.send('command-output', { stream: 'stdout', text });
        });
      }

      // Configure channels
      const channels = config.channels as Record<string, Record<string, string>> | undefined;
      if (channels) {
        await configureChannels(channels, (text) => {
          if (win) win.webContents.send('command-output', { stream: 'stdout', text });
        });
      }

      // Configure hooks
      const hooks = config.hooks as string[] | undefined;
      if (hooks && hooks.length > 0) {
        await configureHooks(hooks, (text) => {
          if (win) win.webContents.send('command-output', { stream: 'stdout', text });
        });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('start-gateway', async () => {
    const win = getMainWindow();
    try {
      // Check if gateway is already running
      try {
        const healthResult = await runCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:18789/health');
        const status = parseInt(healthResult.stdout.trim(), 10);
        if (status >= 200 && status < 300) {
          // Gateway already running — report all steps complete
          const labels = [
            'Setting up security token',
            'Configuring gateway on port 18789',
            'Installing background service',
            'Starting your assistant',
          ];
          for (const label of labels) {
            if (win) win.webContents.send('install-progress', { step: label, status: 'complete' });
          }
          // Restart to pick up any new config (channels, hooks, etc.)
          // Try restart first, fall back to stop+start
          try {
            await streamCommand('openclaw gateway restart', (stream, text) => {
              if (win) win.webContents.send('command-output', { stream, text });
            }, { timeoutMs: 15000 });
          } catch {
            try {
              await runCommand('openclaw gateway stop');
              await streamCommand('openclaw gateway start', (stream, text) => {
                if (win) win.webContents.send('command-output', { stream, text });
              }, { timeoutMs: 15000, detached: true });
            } catch {
              // Best-effort — gateway may still be running with old config
            }
          }

          // Retrieve existing token
          let token: string | undefined;
          try {
            const tokenResult = await runCommand('openclaw gateway token show');
            token = tokenResult.stdout.trim() || undefined;
          } catch { /* token retrieval is best-effort */ }
          return { success: true, token };
        }
      } catch {
        // Not running, proceed with setup
      }

      const steps = [
        { label: 'Setting up security token', cmd: 'openclaw gateway token generate', timeout: 30000 },
        { label: 'Configuring gateway on port 18789', cmd: 'openclaw configure --section gateway --set port=18789 --set bind=loopback', timeout: 30000 },
        { label: 'Installing background service', cmd: 'openclaw daemon install', timeout: 60000 },
        { label: 'Starting your assistant', cmd: 'openclaw gateway start', timeout: 15000, detached: true },
      ];

      for (const step of steps) {
        if (win) {
          win.webContents.send('install-progress', { step: step.label, status: 'running' });
        }
        try {
          await streamCommand(step.cmd, (stream, text) => {
            if (win) win.webContents.send('command-output', { stream, text });
          }, { timeoutMs: step.timeout, detached: (step as { detached?: boolean }).detached });
          if (win) {
            win.webContents.send('install-progress', { step: step.label, status: 'complete' });
          }
        } catch (error) {
          const errMsg = (error as Error).message || '';
          // For detached/daemon commands, a timeout is expected — the process is running in the background
          if ((step as { detached?: boolean }).detached && errMsg.includes('timed out')) {
            if (win) win.webContents.send('install-progress', { step: step.label, status: 'complete' });
            continue;
          }

          const healed = await attemptSelfHeal(step.cmd, error as Error, (text) => {
            if (win) win.webContents.send('command-output', { stream: 'stderr', text: `[Self-heal] ${text}\n` });
          });
          if (healed) {
            await streamCommand(step.cmd, (stream, text) => {
              if (win) win.webContents.send('command-output', { stream, text });
            }, { timeoutMs: step.timeout });
            if (win) win.webContents.send('install-progress', { step: step.label, status: 'complete' });
          } else {
            if (win) win.webContents.send('install-progress', { step: step.label, status: 'error' });
            throw error;
          }
        }
      }

      // Retrieve the generated token
      let token: string | undefined;
      try {
        const tokenResult = await runCommand('openclaw gateway token show');
        token = tokenResult.stdout.trim() || undefined;
      } catch { /* token retrieval is best-effort */ }

      return { success: true, token };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('health-check', async () => {
    try {
      const result = await runCommand('curl -s -o /dev/null -w "%{http_code}" http://localhost:18789/health');
      const status = parseInt(result.stdout.trim(), 10);
      return { healthy: status >= 200 && status < 300 };
    } catch {
      return { healthy: false, error: 'Gateway is not responding' };
    }
  });

  ipcMain.handle('get-gateway-token', async () => {
    try {
      const result = await runCommand('openclaw gateway token show');
      const token = result.stdout.trim();
      if (token) return { token };
      return { token: null, error: 'No token found' };
    } catch (error) {
      return { token: null, error: (error as Error).message };
    }
  });

  ipcMain.handle('full-reset', async () => {
    const win = getMainWindow();
    try {
      // Stop the gateway if running
      try {
        if (win) win.webContents.send('command-output', { stream: 'stdout', text: 'Stopping gateway...\n' });
        await runCommand('openclaw gateway stop');
      } catch { /* may not be running */ }

      // Remove the daemon
      try {
        if (win) win.webContents.send('command-output', { stream: 'stdout', text: 'Removing daemon...\n' });
        await runCommand('openclaw daemon uninstall');
      } catch { /* may not be installed */ }

      // Uninstall OpenClaw globally
      if (win) win.webContents.send('command-output', { stream: 'stdout', text: 'Uninstalling OpenClaw...\n' });
      await streamCommand('npm uninstall -g openclaw', (stream, text) => {
        if (win) win.webContents.send('command-output', { stream, text });
      }, { timeoutMs: 60000 });

      // Clear OpenClaw config directory
      try {
        const homeDir = os.homedir();
        const configDir = `${homeDir}/.openclaw`;
        await runCommand(`rm -rf "${configDir}"`);
        if (win) win.webContents.send('command-output', { stream: 'stdout', text: 'Cleared OpenClaw configuration.\n' });
      } catch { /* config dir may not exist */ }

      // Clear wizard state
      try {
        const homeDir = os.homedir();
        await runCommand(`rm -rf "${homeDir}/.openclaw-wizard"`);
      } catch { /* state dir may not exist */ }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('restart-gateway', async () => {
    const win = getMainWindow();
    try {
      await streamCommand('openclaw gateway restart', (stream, text) => {
        if (win) win.webContents.send('command-output', { stream, text });
      }, { timeoutMs: 15000 });
      return { success: true };
    } catch (error) {
      const errMsg = (error as Error).message || '';
      // Timeout is acceptable for a daemon restart
      if (errMsg.includes('timed out')) return { success: true };
      return { success: false, error: errMsg };
    }
  });

  ipcMain.handle('save-state', async (_event, state: Record<string, unknown>) => {
    await saveWizardState(state);
  });

  ipcMain.handle('load-state', async () => {
    return loadWizardState();
  });
}
