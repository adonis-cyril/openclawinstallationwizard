'use client';

import { useState, useEffect } from 'react';
import StepContainer from '@/components/StepContainer';
import StatusCheck from '@/components/StatusCheck';
import TerminalOutput from '@/components/TerminalOutput';
import ErrorPanel from '@/components/ErrorPanel';
import ProgressBar from '@/components/ProgressBar';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';

interface InstallStatus {
  step: string;
  status: 'pending' | 'running' | 'complete' | 'error';
}

export default function InstallStep() {
  const { appendTerminalOutput, clearTerminalOutput, nextStep } = useWizardStore();
  const [installSteps, setInstallSteps] = useState<InstallStatus[]>([
    { step: 'Downloading OpenClaw package', status: 'pending' },
    { step: 'Installing globally', status: 'pending' },
    { step: 'Verifying installation', status: 'pending' },
  ]);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startInstall();
  }, []);

  async function startInstall() {
    setInstalling(true);
    setError(null);
    clearTerminalOutput();

    const api = getAPI();

    // Listen for progress updates
    const removeProgress = api.onInstallProgress((data) => {
      setInstallSteps((prev) =>
        prev.map((s) => {
          if (data.step.toLowerCase().includes(s.step.toLowerCase().split(' ')[0])) {
            const status = data.status === 'running' ? 'running' : data.status === 'complete' ? 'complete' : data.status === 'error' ? 'error' : s.status;
            return { step: data.step || s.step, status: status as InstallStatus['status'] };
          }
          return s;
        })
      );
    });

    const removeOutput = api.onCommandOutput((data) => {
      appendTerminalOutput(data.text);
    });

    try {
      // Simulate step progression for mock API
      setInstallSteps((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: 'running' } : s)));
      await api.runInstall();
      setInstallSteps((prev) => prev.map((s) => ({ ...s, status: 'complete' })));
      setInstalled(true);
    } catch (err) {
      setError((err as Error).message);
      setInstallSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error' } : s))
      );
    }

    removeProgress();
    removeOutput();
    setInstalling(false);
  }

  const progress = installSteps.filter((s) => s.status === 'complete').length / installSteps.length * 100;

  return (
    <StepContainer
      title="Installing OpenClaw"
      subtitle="This should only take a minute"
      nextDisabled={installing || !installed}
      onNext={nextStep}
    >
      <ProgressBar progress={progress} label={installing ? 'Installing...' : installed ? 'Complete!' : 'Waiting...'} />

      <div className="mt-6 space-y-1">
        {installSteps.map((step) => (
          <StatusCheck
            key={step.step}
            label={step.step}
            status={step.status === 'running' ? 'checking' : step.status === 'complete' ? 'pass' : step.status === 'error' ? 'fail' : 'pending'}
          />
        ))}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorPanel
            title="Installation failed"
            message={error}
            suggestion="Check your internet connection and try again. If the problem persists, try running 'npm install -g openclaw@latest' in your terminal."
            onRetry={startInstall}
          />
        </div>
      )}

      <TerminalOutput title="Installation Output" />
    </StepContainer>
  );
}
