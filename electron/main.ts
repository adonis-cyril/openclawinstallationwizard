import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { registerIpcHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

// __dirname is electron/dist/ — project root is two levels up
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const isDev = process.env.NODE_ENV === 'development' || !fs.existsSync(path.join(PROJECT_ROOT, 'out', 'index.html'));

async function waitForDevServer(url: string, maxRetries = 30): Promise<boolean> {
  const http = await import('http');
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve();
          res.resume();
        });
        req.on('error', reject);
        req.setTimeout(1000, () => { req.destroy(); reject(new Error('timeout')); });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#F5F0E8',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (isDev) {
    // Wait for Next.js dev server to be ready
    const devUrl = 'http://localhost:3000';
    console.log('Waiting for Next.js dev server...');
    const ready = await waitForDevServer(devUrl);
    if (ready) {
      console.log('Dev server ready, loading...');
      mainWindow.loadURL(devUrl);
    } else {
      console.error('Dev server did not start in time');
      mainWindow.loadURL(`data:text/html,<html><body style="background:#F5F0E8;color:#1A1A1A;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1>Waiting for dev server...</h1><p>Run <code>npm run next:dev</code> first, then restart Electron.</p></div></body></html>`);
    }
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(PROJECT_ROOT, 'out', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
