import { runCommandWithArgs } from './commands';
import { sanitizeIdentifier, sanitizePort } from './commands';

/**
 * Build the openclaw onboard command as an args array.
 * Returns { binary, args } for use with runCommandWithArgs / streamCommandWithArgs.
 * API keys are passed as array elements — never interpolated into a shell string.
 */
export function buildConfigArgs(config: Record<string, unknown>): { binary: string; args: string[] } {
  const provider = sanitizeIdentifier((config.selectedProvider || config.provider) as string);
  const apiKey = config.apiKey as string;
  const model = (config.selectedModel || config.model) as string;
  const port = sanitizePort((config.gatewayPort as number) || 18789);

  const args = [
    'onboard', '--non-interactive', '--accept-risk',
    '--mode', 'local',
    '--auth-choice', 'apiKey',
    '--gateway-port', String(port),
    '--gateway-bind', 'loopback',
    '--install-daemon',
    '--daemon-runtime', 'node',
  ];

  if (provider === 'anthropic') {
    args.push('--anthropic-api-key', apiKey);
    if (model) args.push('--model', sanitizeIdentifier(model));
  } else if (provider === 'openai') {
    args.push('--openai-api-key', apiKey);
    if (model) args.push('--model', sanitizeIdentifier(model));
  } else if (provider === 'google') {
    args.push('--google-api-key', apiKey);
    if (model) args.push('--model', sanitizeIdentifier(model));
  }

  return { binary: 'openclaw', args };
}

export async function installSkills(
  skills: string[],
  log: (text: string) => void
): Promise<void> {
  for (const skill of skills) {
    const safeName = sanitizeIdentifier(skill);
    log(`Installing skill: ${safeName}...\n`);
    try {
      await runCommandWithArgs('openclaw', ['skills', 'install', safeName]);
      log(`Skill "${safeName}" installed successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to install skill "${safeName}": ${(error as Error).message}\n`);
    }
  }
}

export async function configureChannels(
  channels: Record<string, Record<string, string>>,
  log: (text: string) => void
): Promise<void> {
  for (const [channel, settings] of Object.entries(channels)) {
    const safeChannel = sanitizeIdentifier(channel);
    log(`Configuring channel: ${safeChannel}...\n`);
    try {
      const args = ['configure', '--section', `channels.${safeChannel}`];
      for (const [key, value] of Object.entries(settings)) {
        const safeKey = sanitizeIdentifier(key);
        args.push('--set', `${safeKey}=${value}`);
      }
      args.push('--set', 'enabled=true');
      // For Telegram, set groupPolicy to "open" so group messages aren't dropped
      if (safeChannel === 'telegram') {
        args.push('--set', 'groupPolicy=open');
      }
      await runCommandWithArgs('openclaw', args);
      log(`Channel "${safeChannel}" configured successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to configure channel "${safeChannel}": ${(error as Error).message}\n`);
    }
  }
}

export async function configureHooks(
  hooks: string[],
  log: (text: string) => void
): Promise<void> {
  for (const hook of hooks) {
    const safeName = sanitizeIdentifier(hook);
    log(`Enabling hook: ${safeName}...\n`);
    try {
      await runCommandWithArgs('openclaw', ['hooks', 'enable', safeName]);
      log(`Hook "${safeName}" enabled successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to enable hook "${safeName}": ${(error as Error).message}\n`);
    }
  }
}
