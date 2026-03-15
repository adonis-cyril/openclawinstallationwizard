'use client';

import { useState, useEffect } from 'react';
import StepContainer from '@/components/StepContainer';
import StatusCheck from '@/components/StatusCheck';
import TerminalOutput from '@/components/TerminalOutput';
import ErrorPanel from '@/components/ErrorPanel';
import ProgressBar from '@/components/ProgressBar';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { Check } from 'lucide-react';

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
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [installedVersion, setInstalledVersion] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingInstall();
  }, []);

  async function checkExistingInstall() {
    setChecking(true);
    try {
      const api = getAPI();
      const result = await api.systemCheck();
      if (result.openclawInstalled && result.openclawVersion) {
        setAlreadyInstalled(true);
        setInstalled(true);
        setInstalledVersion(result.openclawVersion);
        setInstallSteps((prev) => prev.map((s) => ({ ...s, status: 'complete' })));
      } else {
        // Not installed — start installation automatically
        startInstall();
      }
    } catch {
      // Can't check — just start installing
      startInstall();
    }
    setChecking(false);
  }

  async function startInstall() {
    setInstalling(true);
    setError(null);
    setAlreadyInstalled(false);
    clearTerminalOutput();

    const api = getAPI();

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
      subtitle={alreadyInstalled ? 'OpenClaw is already installed on your system' : 'This should only take a minute'}
      nextDisabled={checking || installing || !installed}
      onNext={nextStep}
    >
      {/* Already installed — show green success state */}
      {alreadyInstalled && (
        <div className="rounded-xl border border-brand-success/30 bg-brand-success/[0.06] p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-success/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-brand-success" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-brand-text">OpenClaw is already installed</h3>
              <p className="text-[13px] text-brand-muted mt-0.5">
                Version {installedVersion} detected. You can continue to the next step.
              </p>
            </div>
          </div>
          <button
            onClick={startInstall}
            className="mt-4 text-[12px] text-brand-accent hover:underline"
          >
            Reinstall anyway
          </button>
        </div>
      )}

      {/* Installing or checking — show progress */}
      {!alreadyInstalled && (
        <>
          <ProgressBar progress={progress} label={checking ? 'Checking...' : installing ? 'Installing...' : installed ? 'Complete!' : 'Waiting...'} />

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
        </>
      )}
    </StepContainer>
  );
}
