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
          args = [
            '-s', '-o', '/dev/null', '-w', '%{http_code}',
            '-H', `x-api-key: ${key}`,
            '-H', 'content-type: application/json',
            '-H', 'anthropic-version: 2023-06-01',
            '-d', '{"model":"claude-3-haiku-20240307","max_tokens":1,"messages":[{"role":"user","content":"hi"}]}',
            'https://api.anthropic.com/v1/messages',
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
        });
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
      const steps = [
        { label: 'Setting up security token', cmd: 'openclaw gateway token generate' },
        { label: 'Configuring gateway on port 18789', cmd: 'openclaw configure --section gateway --set port=18789 --set bind=loopback' },
        { label: 'Installing background service', cmd: 'openclaw daemon install' },
        { label: 'Starting your assistant', cmd: 'openclaw gateway start' },
      ];

      for (const step of steps) {
        if (win) {
          win.webContents.send('install-progress', { step: step.label, status: 'running' });
        }
        try {
          await streamCommand(step.cmd, (stream, text) => {
            if (win) win.webContents.send('command-output', { stream, text });
          });
          if (win) {
            win.webContents.send('install-progress', { step: step.label, status: 'complete' });
          }
        } catch (error) {
          const healed = await attemptSelfHeal(step.cmd, error as Error, (text) => {
            if (win) win.webContents.send('command-output', { stream: 'stderr', text: `[Self-heal] ${text}\n` });
          });
          if (healed) {
            await streamCommand(step.cmd, (stream, text) => {
              if (win) win.webContents.send('command-output', { stream, text });
            });
            if (win) win.webContents.send('install-progress', { step: step.label, status: 'complete' });
          } else {
            if (win) win.webContents.send('install-progress', { step: step.label, status: 'error' });
            throw error;
          }
        }
      }

      return { success: true };
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

  ipcMain.handle('save-state', async (_event, state: Record<string, unknown>) => {
    await saveWizardState(state);
  });

  ipcMain.handle('load-state', async () => {
    return loadWizardState();
  });
}
