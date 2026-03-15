export interface Skill {
  id: string;
  name: string;
  description: string;
  whyNeeded: string;
  category: 'bundled' | 'api-required' | 'community';
  requiresApiKey?: string;
  requiresOAuth?: string;
  dependencies?: string[];
}

export const SKILLS: Skill[] = [
  {
    id: 'weather',
    name: 'Weather',
    description: 'Get weather forecasts for any location',
    whyNeeded: 'Used in daily briefings and when you ask about the weather. Example: "What\'s the weather like this weekend?"',
    category: 'bundled',
  },
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for current information',
    whyNeeded: 'Allows your assistant to look up real-time information. Example: "What\'s the latest news about AI?"',
    category: 'bundled',
    dependencies: ['Brave Search API key'],
  },
  {
    id: 'session-logs',
    name: 'Session Logs',
    description: 'Search past conversations',
    whyNeeded: 'Lets your assistant reference things you\'ve discussed before. Example: "What did I ask you about yesterday?"',
    category: 'bundled',
  },
  {
    id: 'summarize',
    name: 'Summarize',
    description: 'Summarize long texts and documents',
    whyNeeded: 'Condenses long articles or documents into key points. Example: "Summarize this PDF for me."',
    category: 'bundled',
  },
  {
    id: 'humanizer',
    name: 'Humanizer',
    description: 'Make AI-written text sound more natural',
    whyNeeded: 'Rewrites AI-generated text to sound more human. Useful for social media and emails.',
    category: 'bundled',
  },
  {
    id: 'gog',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, Drive, Docs integration',
    whyNeeded: 'Lets your assistant read and manage your email, calendar, and Google Drive files. Example: "What meetings do I have tomorrow?"',
    category: 'api-required',
    requiresOAuth: 'google',
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Manage repos, PRs, issues',
    whyNeeded: 'Integrates with your GitHub repositories for code review and issue tracking. Example: "Review my latest PR."',
    category: 'api-required',
    requiresApiKey: 'GitHub Personal Access Token',
  },
  {
    id: 'browser',
    name: 'Browser',
    description: 'Browse and extract content from web pages',
    whyNeeded: 'Lets your assistant read and interact with web pages. Useful for research and data extraction.',
    category: 'bundled',
  },
  {
    id: 'memory-tools',
    name: 'Memory Tools',
    description: 'Persistent memory for contacts, notes, and reminders',
    whyNeeded: 'Gives your assistant long-term memory for tracking people, notes, and follow-ups.',
    category: 'bundled',
  },
  {
    id: 'cron',
    name: 'Cron',
    description: 'Schedule recurring tasks and reminders',
    whyNeeded: 'Enables scheduled tasks like daily briefings or follow-up reminders. Example: "Remind me every Monday at 9am."',
    category: 'bundled',
  },
];
