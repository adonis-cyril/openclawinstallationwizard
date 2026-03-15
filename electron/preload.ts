import { contextBridge, ipcRenderer } from 'electron';

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

contextBridge.exposeInMainWorld('electronAPI', {
  systemCheck: () => ipcRenderer.invoke('system-check'),
  runInstall: () => ipcRenderer.invoke('run-install'),
  validateKey: (provider: string, key: string) => ipcRenderer.invoke('validate-key', provider, key),
  configure: (config: Record<string, unknown>) => ipcRenderer.invoke('configure', config),
  startGateway: () => ipcRenderer.invoke('start-gateway'),
  healthCheck: () => ipcRenderer.invoke('health-check'),
  saveState: (state: Record<string, unknown>) => ipcRenderer.invoke('save-state', state),
  loadState: () => ipcRenderer.invoke('load-state'),
  onCommandOutput: (callback: (data: { stream: string; text: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { stream: string; text: string }) => callback(data);
    ipcRenderer.on('command-output', handler);
    return () => ipcRenderer.removeListener('command-output', handler);
  },
  onInstallProgress: (callback: (data: { step: string; status: string }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: { step: string; status: string }) => callback(data);
    ipcRenderer.on('install-progress', handler);
    return () => ipcRenderer.removeListener('install-progress', handler);
  },
  getPlatform: () => ipcRenderer.invoke('get-platform'),
} satisfies ElectronAPI);
