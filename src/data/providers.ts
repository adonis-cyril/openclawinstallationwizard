export interface Provider {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  cost: string;
  quality: string;
  recommended: boolean;
  models: ProviderModel[];
  keyInstructions: string;
  keyPlaceholder: string;
}

export interface ProviderModel {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Industry-leading AI models known for safety and helpfulness',
    bestFor: 'General use, safety',
    cost: '~$3-10/mo typical',
    quality: 'Excellent',
    recommended: true,
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'Best balance of speed and quality. Recommended for most users.',
        recommended: true,
      },
      {
        id: 'claude-haiku-3-5-20241022',
        name: 'Claude Haiku 3.5',
        description: 'Cheaper and faster. Good for simple tasks. Costs ~1/5th of Sonnet.',
        recommended: false,
      },
    ],
    keyInstructions: 'Go to console.anthropic.com > API Keys > Create Key. Copy the key that starts with "sk-ant-".',
    keyPlaceholder: 'sk-ant-...',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT)',
    description: 'Popular AI models with broad plugin ecosystem',
    bestFor: 'Code, plugins',
    cost: '~$3-10/mo typical',
    quality: 'Excellent',
    recommended: false,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable model. Great for complex reasoning and code.',
        recommended: true,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Faster and cheaper. Good for simple tasks.',
        recommended: false,
      },
    ],
    keyInstructions: 'Go to platform.openai.com > API keys > Create new secret key. Copy the key that starts with "sk-".',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Google\'s AI models with free tier available',
    bestFor: 'Budget, free tier',
    cost: 'Free tier available',
    quality: 'Good',
    recommended: false,
    models: [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and capable. Good free tier for getting started.',
        recommended: true,
      },
    ],
    keyInstructions: 'Go to aistudio.google.com > Get API Key > Create API key. Copy the generated key.',
    keyPlaceholder: 'AIza...',
  },
  {
    id: 'ollama',
    name: 'Local (Ollama)',
    description: 'Run AI models locally on your own machine',
    bestFor: 'Privacy, offline',
    cost: 'Free (uses your CPU)',
    quality: 'Varies by model',
    recommended: false,
    models: [
      {
        id: 'llama3.2',
        name: 'Llama 3.2',
        description: 'Good general-purpose local model.',
        recommended: true,
      },
    ],
    keyInstructions: 'Install Ollama from ollama.com, then run "ollama pull llama3.2" in your terminal. No API key needed.',
    keyPlaceholder: 'No key needed',
  },
];
