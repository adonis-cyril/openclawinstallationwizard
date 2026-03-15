export interface Channel {
  id: string;
  name: string;
  description: string;
  popularity: string;
  setupDifficulty: 'Easy' | 'Medium' | 'Advanced';
  icon: string;
  requiresToken: boolean;
  tokenLabel?: string;
  tokenPlaceholder?: string;
  setupInstructions: string[];
  callout?: string;
}

export const CHANNELS: Channel[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Chat with your assistant through WhatsApp',
    popularity: 'Most Popular',
    setupDifficulty: 'Medium',
    icon: 'MessageCircle',
    requiresToken: false,
    setupInstructions: [
      'A QR code will appear during gateway setup',
      'Open WhatsApp on your phone',
      'Go to Settings > Linked Devices > Link a Device',
      'Scan the QR code shown in the wizard',
    ],
    callout: 'We recommend using a separate phone number for your assistant. A prepaid SIM works great.',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Create a Telegram bot and chat with it',
    popularity: 'Easiest Setup',
    setupDifficulty: 'Easy',
    icon: 'Send',
    requiresToken: true,
    tokenLabel: 'Bot Token',
    tokenPlaceholder: '1234567890:ABCDefgh...',
    setupInstructions: [
      'Open Telegram and search for @BotFather',
      'Send /newbot and follow the prompts',
      'Choose a name and username for your bot',
      'Copy the Bot Token that BotFather gives you',
      'Paste the token below',
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Add your assistant as a Discord bot',
    popularity: 'Popular for Teams',
    setupDifficulty: 'Medium',
    icon: 'Hash',
    requiresToken: true,
    tokenLabel: 'Bot Token',
    tokenPlaceholder: 'MTA2...',
    setupInstructions: [
      'Go to discord.com/developers/applications',
      'Click "New Application" and give it a name',
      'Go to the "Bot" tab and click "Add Bot"',
      'Click "Reset Token" and copy the token',
      'Go to OAuth2 > URL Generator, select "bot" scope',
      'Use the generated URL to add the bot to your server',
      'Paste the bot token below',
    ],
  },
  {
    id: 'webchat',
    name: 'Web Chat Only',
    description: 'Chat through the browser dashboard',
    popularity: 'Simplest',
    setupDifficulty: 'Easy',
    icon: 'Globe',
    requiresToken: false,
    setupInstructions: [
      'No setup required!',
      'After completing the wizard, click "Open Dashboard" to start chatting',
      'You can add messaging channels later from the dashboard',
    ],
  },
];
