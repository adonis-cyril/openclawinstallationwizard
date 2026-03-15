export interface UseCase {
  id: string;
  name: string;
  description: string;
  example: string;
  icon: string;
  requiredSkills: string[];
  recommendedSkills: string[];
  requiredHooks: string[];
  recommendedHooks: string[];
  requiresChannel: boolean;
  requiresOAuth: string[];
  requiresCron: boolean;
}

export const USE_CASES: UseCase[] = [
  {
    id: 'personal-chat',
    name: 'Personal Chat Assistant',
    description: 'A smart companion you can text on WhatsApp or Telegram',
    example: 'Hey, what\'s a good restaurant near me tonight?',
    icon: 'MessageCircle',
    requiredSkills: [],
    recommendedSkills: ['weather', 'web-search'],
    requiredHooks: [],
    recommendedHooks: [],
    requiresChannel: true,
    requiresOAuth: [],
    requiresCron: false,
  },
  {
    id: 'calendar-email',
    name: 'Calendar & Email Manager',
    description: 'Manage your Google Calendar and Gmail through chat',
    example: 'What\'s on my calendar tomorrow?',
    icon: 'Calendar',
    requiredSkills: ['gog'],
    recommendedSkills: ['web-search', 'session-logs'],
    requiredHooks: [],
    recommendedHooks: ['session-memory'],
    requiresChannel: true,
    requiresOAuth: ['google'],
    requiresCron: false,
  },
  {
    id: 'lead-tracker',
    name: 'Business Lead Tracker',
    description: 'Track contacts, follow up with leads, manage your CRM',
    example: 'Remind me to follow up with Sarah in 3 days',
    icon: 'Users',
    requiredSkills: ['memory-tools', 'cron'],
    recommendedSkills: ['web-search'],
    requiredHooks: ['session-memory'],
    recommendedHooks: [],
    requiresChannel: true,
    requiresOAuth: [],
    requiresCron: true,
  },
  {
    id: 'developer',
    name: 'Developer Companion',
    description: 'Code review, GitHub integration, deployment help',
    example: 'Review my latest PR on the main repo',
    icon: 'Code',
    requiredSkills: ['github', 'browser'],
    recommendedSkills: ['web-search'],
    requiredHooks: [],
    recommendedHooks: ['session-memory'],
    requiresChannel: true,
    requiresOAuth: [],
    requiresCron: false,
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    description: 'Draft tweets, blog posts, social media content',
    example: 'Write a Twitter thread about my latest project',
    icon: 'PenTool',
    requiredSkills: [],
    recommendedSkills: ['web-search', 'browser', 'humanizer'],
    requiredHooks: [],
    recommendedHooks: [],
    requiresChannel: true,
    requiresOAuth: [],
    requiresCron: false,
  },
  {
    id: 'home-automation',
    name: 'Home Automation',
    description: 'Control smart home devices, set reminders, daily briefings',
    example: 'Turn off the lights and set my alarm for 7am',
    icon: 'Home',
    requiredSkills: ['cron', 'weather'],
    recommendedSkills: [],
    requiredHooks: [],
    recommendedHooks: ['boot-greeting', 'session-memory'],
    requiresChannel: true,
    requiresOAuth: [],
    requiresCron: true,
  },
];
