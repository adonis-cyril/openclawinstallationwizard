import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const STATE_DIR = path.join(os.homedir(), '.openclaw-wizard');
const STATE_FILE = path.join(STATE_DIR, 'state.json');

export async function saveWizardState(state: Record<string, unknown>): Promise<void> {
  try {
    if (!fs.existsSync(STATE_DIR)) {
      fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), { encoding: 'utf-8', mode: 0o600 });
  } catch (error) {
    console.error('Failed to save wizard state:', error);
  }
}

export async function loadWizardState(): Promise<Record<string, unknown> | null> {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}
