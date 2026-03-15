import { runCommand, streamCommand } from './commands';

export function buildConfigCommand(config: Record<string, unknown>): string {
  const provider = config.provider as string;
  const apiKey = config.apiKey as string;
  const model = config.model as string;
  const port = (config.gatewayPort as number) || 18789;

  const parts = [
    'openclaw onboard --non-interactive',
    '--mode local',
    '--auth-choice apiKey',
    `--gateway-port ${port}`,
    '--gateway-bind loopback',
    '--install-daemon',
    '--daemon-runtime node',
  ];

  if (provider === 'anthropic') {
    parts.push(`--anthropic-api-key "${apiKey}"`);
    if (model) parts.push(`--model "${model}"`);
  } else if (provider === 'openai') {
    parts.push(`--openai-api-key "${apiKey}"`);
    if (model) parts.push(`--model "${model}"`);
  } else if (provider === 'google') {
    parts.push(`--google-api-key "${apiKey}"`);
    if (model) parts.push(`--model "${model}"`);
  }

  return parts.join(' \\\n  ');
}

export async function installSkills(
  skills: string[],
  log: (text: string) => void
): Promise<void> {
  for (const skill of skills) {
    log(`Installing skill: ${skill}...\n`);
    try {
      await runCommand(`openclaw skills install ${skill}`);
      log(`Skill "${skill}" installed successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to install skill "${skill}": ${(error as Error).message}\n`);
    }
  }
}

export async function configureChannels(
  channels: Record<string, Record<string, string>>,
  log: (text: string) => void
): Promise<void> {
  for (const [channel, settings] of Object.entries(channels)) {
    log(`Configuring channel: ${channel}...\n`);
    try {
      const setFlags = Object.entries(settings)
        .map(([key, value]) => `--set ${key}="${value}"`)
        .join(' ');
      await runCommand(`openclaw configure --section channels.${channel} ${setFlags} --set enabled=true`);
      log(`Channel "${channel}" configured successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to configure channel "${channel}": ${(error as Error).message}\n`);
    }
  }
}

export async function configureHooks(
  hooks: string[],
  log: (text: string) => void
): Promise<void> {
  for (const hook of hooks) {
    log(`Enabling hook: ${hook}...\n`);
    try {
      await runCommand(`openclaw hooks enable ${hook}`);
      log(`Hook "${hook}" enabled successfully.\n`);
    } catch (error) {
      log(`Warning: Failed to enable hook "${hook}": ${(error as Error).message}\n`);
    }
  }
}
