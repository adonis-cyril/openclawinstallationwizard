import { create } from 'zustand';
import { STEPS } from '@/data/steps';

export interface ChannelConfig {
  enabled: boolean;
  token?: string;
}

export interface WizardState {
  // Navigation
  currentStep: number;
  completedSteps: Set<number>;
  installType: 'fresh' | 'existing' | null;

  // Platform info
  detectedOS: { name: string; version: string; arch: string } | null;

  // Use cases
  selectedUseCases: string[];

  // System check results
  systemCheckResults: Record<string, { status: 'pending' | 'checking' | 'pass' | 'fail'; detail?: string }>;

  // Provider
  selectedProvider: string | null;
  apiKey: string;
  apiKeyValid: boolean;
  selectedModel: string | null;

  // Channels
  selectedChannels: Record<string, ChannelConfig>;

  // Skills
  selectedSkills: string[];

  // Hooks
  selectedHooks: string[];

  // Gateway
  gatewayPort: number;
  gatewayStarted: boolean;

  // Terminal output
  terminalOutput: string[];

  // Actions
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  setInstallType: (type: 'fresh' | 'existing') => void;
  setDetectedOS: (os: { name: string; version: string; arch: string }) => void;
  toggleUseCase: (id: string) => void;
  setSystemCheckResult: (key: string, status: 'pending' | 'checking' | 'pass' | 'fail', detail?: string) => void;
  setSelectedProvider: (provider: string) => void;
  setApiKey: (key: string) => void;
  setApiKeyValid: (valid: boolean) => void;
  setSelectedModel: (model: string) => void;
  setChannelConfig: (channelId: string, config: ChannelConfig) => void;
  toggleSkill: (id: string) => void;
  setSelectedSkills: (skills: string[]) => void;
  toggleHook: (id: string) => void;
  setSelectedHooks: (hooks: string[]) => void;
  setGatewayPort: (port: number) => void;
  setGatewayStarted: (started: boolean) => void;
  appendTerminalOutput: (text: string) => void;
  clearTerminalOutput: () => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
  hydrateFromSaved: (state: Record<string, unknown>) => void;
  getSerializableState: () => Record<string, unknown>;
}

const initialState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
  installType: null as 'fresh' | 'existing' | null,
  detectedOS: null,
  selectedUseCases: [] as string[],
  systemCheckResults: {} as Record<string, { status: 'pending' | 'checking' | 'pass' | 'fail'; detail?: string }>,
  selectedProvider: null as string | null,
  apiKey: '',
  apiKeyValid: false,
  selectedModel: null as string | null,
  selectedChannels: {} as Record<string, ChannelConfig>,
  selectedSkills: [] as string[],
  selectedHooks: [] as string[],
  gatewayPort: 18789,
  gatewayStarted: false,
  terminalOutput: [] as string[],
};

export const useWizardStore = create<WizardState>((set, get) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    })),

  setInstallType: (type) => set({ installType: type }),

  setDetectedOS: (os) => set({ detectedOS: os }),

  toggleUseCase: (id) =>
    set((state) => {
      const selected = state.selectedUseCases.includes(id)
        ? state.selectedUseCases.filter((uc) => uc !== id)
        : [...state.selectedUseCases, id];
      return { selectedUseCases: selected };
    }),

  setSystemCheckResult: (key, status, detail) =>
    set((state) => ({
      systemCheckResults: {
        ...state.systemCheckResults,
        [key]: { status, detail },
      },
    })),

  setSelectedProvider: (provider) => set({ selectedProvider: provider, apiKey: '', apiKeyValid: false, selectedModel: null }),

  setApiKey: (key) => set({ apiKey: key, apiKeyValid: false }),

  setApiKeyValid: (valid) => set({ apiKeyValid: valid }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  setChannelConfig: (channelId, config) =>
    set((state) => ({
      selectedChannels: { ...state.selectedChannels, [channelId]: config },
    })),

  toggleSkill: (id) =>
    set((state) => {
      const selected = state.selectedSkills.includes(id)
        ? state.selectedSkills.filter((s) => s !== id)
        : [...state.selectedSkills, id];
      return { selectedSkills: selected };
    }),

  setSelectedSkills: (skills) => set({ selectedSkills: skills }),

  toggleHook: (id) =>
    set((state) => {
      const selected = state.selectedHooks.includes(id)
        ? state.selectedHooks.filter((h) => h !== id)
        : [...state.selectedHooks, id];
      return { selectedHooks: selected };
    }),

  setSelectedHooks: (hooks) => set({ selectedHooks: hooks }),

  setGatewayPort: (port) => set({ gatewayPort: port }),

  setGatewayStarted: (started) => set({ gatewayStarted: started }),

  appendTerminalOutput: (text) =>
    set((state) => ({
      terminalOutput: [...state.terminalOutput, text],
    })),

  clearTerminalOutput: () => set({ terminalOutput: [] }),

  goToStep: (step) => {
    if (step >= 0 && step < STEPS.length) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < STEPS.length - 1) {
      get().completeStep(currentStep);
      set({ currentStep: currentStep + 1 });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  resetWizard: () => set({ ...initialState, completedSteps: new Set() }),

  hydrateFromSaved: (saved) => {
    set({
      currentStep: (saved.currentStep as number) ?? 0,
      completedSteps: new Set((saved.completedSteps as number[]) ?? []),
      installType: (saved.installType as 'fresh' | 'existing') ?? null,
      selectedUseCases: (saved.selectedUseCases as string[]) ?? [],
      selectedProvider: (saved.selectedProvider as string) ?? null,
      apiKey: (saved.apiKey as string) ?? '',
      apiKeyValid: (saved.apiKeyValid as boolean) ?? false,
      selectedModel: (saved.selectedModel as string) ?? null,
      selectedChannels: (saved.selectedChannels as Record<string, ChannelConfig>) ?? {},
      selectedSkills: (saved.selectedSkills as string[]) ?? [],
      selectedHooks: (saved.selectedHooks as string[]) ?? [],
      gatewayPort: (saved.gatewayPort as number) ?? 18789,
      gatewayStarted: (saved.gatewayStarted as boolean) ?? false,
    });
  },

  getSerializableState: () => {
    const state = get();
    return {
      currentStep: state.currentStep,
      completedSteps: [...state.completedSteps],
      installType: state.installType,
      selectedUseCases: state.selectedUseCases,
      selectedProvider: state.selectedProvider,
      apiKey: state.apiKey,
      apiKeyValid: state.apiKeyValid,
      selectedModel: state.selectedModel,
      selectedChannels: state.selectedChannels,
      selectedSkills: state.selectedSkills,
      selectedHooks: state.selectedHooks,
      gatewayPort: state.gatewayPort,
      gatewayStarted: state.gatewayStarted,
    };
  },
}));
