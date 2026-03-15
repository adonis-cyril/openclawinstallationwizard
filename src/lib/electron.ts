export interface SystemCheckResult {
  os: { name: string; version: string; arch: string };
  nodeInstalled: boolean;
  nodeVersion: string | null;
  homebrewInstalled: boolean;
  diskSpaceGB: number;
  networkConnected: boolean;
  openclawInstalled: boolean;
  openclawVersion: string | null;
}

export interface ElectronAPI {
  systemCheck: () => Promise<SystemCheckResult>;
  runInstall: () => Promise<void>;
  validateKey: (provider: string, key: string) => Promise<{ valid: boolean; error?: string }>;
  configure: (config: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  startGateway: () => Promise<{ success: boolean; error?: string }>;
  healthCheck: () => Promise<{ healthy: boolean; error?: string }>;
  saveState: (state: Record<string, unknown>) => Promise<void>;
  loadState: () => Promise<Record<string, unknown> | null>;
  onCommandOutput: (callback: (data: { stream: string; text: string }) => void) => () => void;
  onInstallProgress: (callback: (data: { step: string; status: string }) => void) => () => void;
  getPlatform: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function getElectronAPI(): ElectronAPI | null {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return window.electronAPI;
  }
  return null;
}

// Mock API for development in browser (without Electron)
export function getMockAPI(): ElectronAPI {
  return {
    systemCheck: async () => ({
      os: { name: 'macOS', version: '15.2', arch: 'Apple Silicon' },
      nodeInstalled: true,
      nodeVersion: 'v22.22.0',
      homebrewInstalled: true,
      diskSpaceGB: 45.2,
      networkConnected: true,
      openclawInstalled: false,
      openclawVersion: null,
    }),
    runInstall: async () => {
      await new Promise((r) => setTimeout(r, 2000));
    },
    validateKey: async (_provider: string, key: string) => {
      await new Promise((r) => setTimeout(r, 1000));
      if (key.length > 10) return { valid: true };
      return { valid: false, error: 'Invalid API key format' };
    },
    configure: async () => {
      await new Promise((r) => setTimeout(r, 1500));
      return { success: true };
    },
    startGateway: async () => {
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true };
    },
    healthCheck: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return { healthy: true };
    },
    saveState: async () => {},
    loadState: async () => null,
    onCommandOutput: () => () => {},
    onInstallProgress: () => () => {},
    getPlatform: async () => 'darwin',
  };
}

export function getAPI(): ElectronAPI {
  return getElectronAPI() || getMockAPI();
}
