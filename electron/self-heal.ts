import { runCommand, runCommandWithArgs, streamCommand } from './commands';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

type LogFn = (text: string) => void;

export async function attemptSelfHeal(
  failedCmd: string,
  error: Error,
  log: LogFn
): Promise<boolean> {
  const errorMsg = error.message.toLowerCase();

  // PATH resolution: command not found
  if (errorMsg.includes('not found') || errorMsg.includes('enoent')) {
    log('Command not found. Attempting to fix PATH...');
    const fixed = await fixPath(failedCmd, log);
    if (fixed) return true;
  }

  // Homebrew missing on macOS
  if (failedCmd.includes('brew') && errorMsg.includes('not found') && os.platform() === 'darwin') {
    log('Homebrew not found. Installing Homebrew...');
    return installHomebrew(log);
  }

  // Node.js missing
  if ((failedCmd.includes('node') || failedCmd.includes('npm')) && errorMsg.includes('not found')) {
    log('Node.js not found. Attempting to install...');
    return installNode(log);
  }

  // Permission errors
  if (errorMsg.includes('eacces') || errorMsg.includes('permission denied')) {
    log('Permission error detected. Attempting to fix npm permissions...');
    return fixNpmPermissions(log);
  }

  // Port conflict
  if (errorMsg.includes('eaddrinuse') || errorMsg.includes('address already in use')) {
    log('Port conflict detected. Attempting to resolve...');
    return resolvePortConflict(log);
  }

  return false;
}

async function fixPath(cmd: string, log: LogFn): Promise<boolean> {
  // Extract the binary name from the command and validate it
  const binary = cmd.split(' ')[0];
  if (!/^[a-zA-Z0-9._-]+$/.test(binary)) {
    log(`Invalid binary name: ${binary}`);
    return false;
  }

  // Common locations to search
  const searchPaths = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    `${os.homedir()}/.npm-global/bin`,
    '/usr/local/share/npm/bin',
    `${os.homedir()}/.nvm/versions/node`,
  ];

  for (const searchPath of searchPaths) {
    try {
      const fullPath = path.join(searchPath, binary);
      if (fs.existsSync(fullPath)) {
        log(`Found ${binary} at ${searchPath}. Adding to PATH.`);
        process.env.PATH = `${searchPath}:${process.env.PATH}`;
        return true;
      }
    } catch {
      continue;
    }
  }

  // Try to find via `which` — use execFile to avoid shell injection
  try {
    const result = await runCommandWithArgs('/usr/bin/which', [binary]);
    if (result.exitCode === 0 && result.stdout.trim()) {
      const binDir = path.dirname(result.stdout.trim());
      log(`Found ${binary} at ${binDir}. Adding to PATH.`);
      process.env.PATH = `${binDir}:${process.env.PATH}`;
      return true;
    }
  } catch {
    // Fall through
  }

  log(`Could not locate ${binary} on this system.`);
  return false;
}

async function installHomebrew(log: LogFn): Promise<boolean> {
  try {
    log('Downloading and installing Homebrew...');
    await streamCommand(
      '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
      (_stream, text) => log(text)
    );
    // Add Homebrew to PATH
    if (os.arch() === 'arm64') {
      process.env.PATH = `/opt/homebrew/bin:${process.env.PATH}`;
    } else {
      process.env.PATH = `/usr/local/bin:${process.env.PATH}`;
    }
    log('Homebrew installed successfully.');
    return true;
  } catch {
    log('Failed to install Homebrew automatically.');
    return false;
  }
}

async function installNode(log: LogFn): Promise<boolean> {
  const platform = os.platform();

  if (platform === 'darwin') {
    // Try Homebrew first
    try {
      log('Installing Node.js via Homebrew...');
      await streamCommand('brew install node', (_stream, text) => log(text));
      log('Node.js installed successfully.');
      return true;
    } catch {
      log('Homebrew install failed, trying alternative method...');
    }
  }

  // Try nvm
  try {
    log('Installing Node.js via nvm...');
    await streamCommand(
      'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm install --lts',
      (_stream, text) => log(text)
    );
    log('Node.js installed successfully via nvm.');
    return true;
  } catch {
    log('Failed to install Node.js automatically.');
    return false;
  }
}

async function fixNpmPermissions(log: LogFn): Promise<boolean> {
  try {
    const npmPrefix = path.join(os.homedir(), '.npm-global');
    log(`Setting npm prefix to ${npmPrefix}...`);
    await runCommand(`npm config set prefix "${npmPrefix}"`);
    process.env.PATH = `${npmPrefix}/bin:${process.env.PATH}`;
    log('npm permissions fixed. Retrying...');
    return true;
  } catch {
    log('Failed to fix npm permissions.');
    return false;
  }
}

async function resolvePortConflict(log: LogFn): Promise<boolean> {
  try {
    // Find what's using port 18789
    const result = await runCommand('lsof -i :18789 -t');
    if (result.stdout.trim()) {
      const pids = result.stdout.trim().split('\n');
      log(`Found ${pids.length} process(es) using port 18789.`);

      for (const pid of pids) {
        const safePid = pid.trim();
        if (!/^\d+$/.test(safePid)) continue;
        const processInfo = await runCommandWithArgs('ps', ['-p', safePid, '-o', 'comm=']);
        log(`Process ${safePid}: ${processInfo.stdout.trim()}`);
      }

      // Kill the processes
      for (const pid of pids) {
        const safePid = pid.trim();
        if (!/^\d+$/.test(safePid)) continue;
        await runCommandWithArgs('kill', [safePid]);
      }
      log('Port 18789 freed. Retrying...');

      // Wait briefly for port to be released
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return true;
    }
    return false;
  } catch {
    log('Failed to resolve port conflict.');
    return false;
  }
}
