import { spawn, exec } from 'child_process';
import * as os from 'os';

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function runCommand(cmd: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
    const shellFlag = process.platform === 'win32' ? '/c' : '-c';

    exec(cmd, { shell, timeout: 120000, env: getEnhancedEnv() }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject(new Error(`Command timed out: ${cmd}`));
        return;
      }
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error ? (error.code ?? 1) : 0,
      });
    });
  });
}

export function streamCommand(
  cmd: string,
  onData: (stream: 'stdout' | 'stderr', text: string) => void
): Promise<number> {
  return new Promise((resolve, reject) => {
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
    const shellFlag = process.platform === 'win32' ? '/c' : '-c';

    const child = spawn(shell, [shellFlag, cmd], {
      env: getEnhancedEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (data: Buffer) => {
      onData('stdout', data.toString());
    });

    child.stderr.on('data', (data: Buffer) => {
      onData('stderr', data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${cmd}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function getEnhancedEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };

  // Ensure common paths are included
  const extraPaths = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    `${os.homedir()}/.nvm/versions/node/*/bin`,
    `${os.homedir()}/.npm-global/bin`,
    '/usr/local/share/npm/bin',
  ];

  const currentPath = env.PATH || '';
  const pathSep = process.platform === 'win32' ? ';' : ':';
  const missingPaths = extraPaths.filter((p) => !currentPath.includes(p));

  if (missingPaths.length > 0) {
    env.PATH = [...missingPaths, currentPath].join(pathSep);
  }

  return env;
}
