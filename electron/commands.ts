import { spawn, exec, execFile } from 'child_process';
import * as os from 'os';

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Validate that a string contains only safe characters (alphanumeric, hyphens, underscores, dots).
 * Use this before interpolating user input into shell commands.
 */
export function sanitizeIdentifier(input: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(input)) {
    throw new Error(`Invalid identifier: "${input}" contains unsafe characters`);
  }
  return input;
}

/**
 * Validate that a value is a safe port number.
 */
export function sanitizePort(port: unknown): number {
  const num = typeof port === 'number' ? port : parseInt(String(port), 10);
  if (!Number.isInteger(num) || num < 1 || num > 65535) {
    throw new Error(`Invalid port number: ${port}`);
  }
  return num;
}

/**
 * Run a command via shell. Only use for trusted, hardcoded commands.
 * NEVER interpolate user input into cmd — use runCommandWithArgs instead.
 */
export function runCommand(cmd: string): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    exec(cmd, { shell: getShell(), timeout: 120000, env: getEnhancedEnv() }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject(new Error('Command timed out'));
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

/**
 * Run a command safely without shell interpolation.
 * Arguments are passed as an array, preventing injection.
 */
export function runCommandWithArgs(binary: string, args: string[]): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    execFile(binary, args, { timeout: 120000, env: getEnhancedEnv() }, (error, stdout, stderr) => {
      if (error && error.killed) {
        reject(new Error('Command timed out'));
        return;
      }
      const code = error?.code;
      resolve({
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: error ? (typeof code === 'number' ? code : 1) : 0,
      });
    });
  });
}

export function streamCommand(
  cmd: string,
  onData: (stream: 'stdout' | 'stderr', text: string) => void
): Promise<number> {
  return new Promise((resolve, reject) => {
    const shell = getShell();
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
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

function getShell(): string {
  return process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
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
