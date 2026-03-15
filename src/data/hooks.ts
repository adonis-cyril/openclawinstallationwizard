export interface Hook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  whatItDoes: string;
  example: string;
}

export const HOOKS: Hook[] = [
  {
    id: 'session-memory',
    name: 'Session Memory',
    description: 'Saves conversation context to memory when you start a new session',
    trigger: 'Runs when you issue /new',
    whatItDoes: 'Without this, your assistant forgets everything when you start a new chat. Session memory saves key context so your assistant remembers what you talked about before.',
    example: 'You discussed a project deadline yesterday. Today, you start a new session and ask "What was that deadline?" — your assistant remembers because session-memory saved the context.',
  },
  {
    id: 'boot-greeting',
    name: 'Boot Greeting',
    description: 'Runs a startup script when the gateway starts',
    trigger: 'Runs when the gateway boots up',
    whatItDoes: 'Use this for daily briefings or welcome messages. When your assistant starts, it can automatically check your calendar, weather, and news to give you a morning summary.',
    example: 'Your assistant starts and says: "Good morning! You have 3 meetings today. The weather is sunny, 72F. Here are your top tasks..."',
  },
  {
    id: 'audit-log',
    name: 'Audit Log',
    description: 'Logs all commands to a file for review',
    trigger: 'Runs on every command execution',
    whatItDoes: 'Creates a log of everything your assistant does. Useful for tracking activity, debugging issues, or compliance.',
    example: 'You can review what your assistant did while you were away by checking the audit log file.',
  },
];
