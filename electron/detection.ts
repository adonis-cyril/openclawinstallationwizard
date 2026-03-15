import * as os from 'os';
import { runCommand } from './commands';

export interface SystemCheckResult {
  os: { name: string; version: string; arch: string };
  nodeInstalled: boolean;
  nodeVersion: string | null;
  homebrewInstalled: boolean;
  diskSpaceGB: number;
  networkConnected: boolean;
  openclawInstalled: boolean;
  openclawVersion: string | null;
}

export async function runSystemCheck(): Promise<SystemCheckResult> {
  const [nodeCheck, brewCheck, diskCheck, netCheck, clawCheck] = await Promise.all([
    checkNode(),
    checkHomebrew(),
    checkDiskSpace(),
    checkNetwork(),
    checkOpenclaw(),
  ]);

  const platform = os.platform();
  let osName = 'Unknown';
  if (platform === 'darwin') osName = 'macOS';
  else if (platform === 'win32') osName = 'Windows';
  else if (platform === 'linux') osName = 'Linux';

  return {
    os: {
      name: osName,
      version: os.release(),
      arch: os.arch() === 'arm64' ? 'Apple Silicon' : os.arch(),
    },
    ...nodeCheck,
    ...brewCheck,
    ...diskCheck,
    ...netCheck,
    ...clawCheck,
  };
}

async function checkNode(): Promise<{ nodeInstalled: boolean; nodeVersion: string | null }> {
  try {
    const result = await runCommand('node --version');
    if (result.exitCode === 0) {
      return { nodeInstalled: true, nodeVersion: result.stdout.trim() };
    }
    return { nodeInstalled: false, nodeVersion: null };
  } catch {
    return { nodeInstalled: false, nodeVersion: null };
  }
}

async function checkHomebrew(): Promise<{ homebrewInstalled: boolean }> {
  if (os.platform() !== 'darwin') {
    return { homebrewInstalled: false };
  }
  try {
    const result = await runCommand('brew --version');
    return { homebrewInstalled: result.exitCode === 0 };
  } catch {
    return { homebrewInstalled: false };
  }
}

async function checkDiskSpace(): Promise<{ diskSpaceGB: number }> {
  try {
    if (os.platform() === 'win32') {
      const result = await runCommand('wmic logicaldisk get freespace /value');
      const match = result.stdout.match(/FreeSpace=(\d+)/);
      if (match) {
        return { diskSpaceGB: Math.round(parseInt(match[1], 10) / 1073741824 * 10) / 10 };
      }
    } else {
      // Use df -k (kilobytes) which works on both macOS and Linux
      const result = await runCommand("df -k ~ | tail -1 | awk '{print $4}'");
      const match = result.stdout.match(/(\d+)/);
      if (match) {
        const kb = parseInt(match[1], 10);
        return { diskSpaceGB: Math.round(kb / 1048576 * 10) / 10 };
      }
    }
    return { diskSpaceGB: 0 };
  } catch {
    return { diskSpaceGB: 0 };
  }
}

async function checkNetwork(): Promise<{ networkConnected: boolean }> {
  try {
    const result = await runCommand('curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://registry.npmjs.org');
    return { networkConnected: result.stdout.trim() === '200' };
  } catch {
    return { networkConnected: false };
  }
}

async function checkOpenclaw(): Promise<{ openclawInstalled: boolean; openclawVersion: string | null }> {
  try {
    const result = await runCommand('openclaw --version');
    if (result.exitCode === 0) {
      return { openclawInstalled: true, openclawVersion: result.stdout.trim() };
    }
    return { openclawInstalled: false, openclawVersion: null };
  } catch {
    return { openclawInstalled: false, openclawVersion: null };
  }
}
