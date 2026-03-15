export interface StepDefinition {
  id: string;
  label: string;
  icon: string; // Lucide icon name
}

export const STEPS: StepDefinition[] = [
  { id: 'welcome', label: 'Welcome', icon: 'Rocket' },
  { id: 'use-cases', label: 'Use Cases', icon: 'Lightbulb' },
  { id: 'system-check', label: 'System Check', icon: 'Monitor' },
  { id: 'install', label: 'Install OpenClaw', icon: 'Download' },
  { id: 'provider', label: 'AI Provider', icon: 'Brain' },
  { id: 'channels', label: 'Channels', icon: 'MessageSquare' },
  { id: 'skills', label: 'Skills', icon: 'Wrench' },
  { id: 'hooks', label: 'Hooks', icon: 'Zap' },
  { id: 'gateway', label: 'Start Gateway', icon: 'Server' },
  { id: 'best-practices', label: 'Best Practices', icon: 'BookOpen' },
  { id: 'complete', label: 'Complete', icon: 'PartyPopper' },
];
