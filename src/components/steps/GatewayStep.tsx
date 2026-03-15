'use client';

import { useState, useEffect } from 'react';
import StepContainer from '@/components/StepContainer';
import StatusCheck from '@/components/StatusCheck';
import TerminalOutput from '@/components/TerminalOutput';
import ErrorPanel from '@/components/ErrorPanel';
import ExplainerBox from '@/components/ExplainerBox';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { Server } from 'lucide-react';

interface GatewayStatus {
  label: string;
  status: 'pending' | 'checking' | 'pass' | 'fail';
}

export default function GatewayStep() {
  const { appendTerminalOutput, clearTerminalOutput, setGatewayStarted, setGatewayToken, nextStep } = useWizardStore();
  const [steps, setSteps] = useState<GatewayStatus[]>([
    { label: 'Setting up security token...', status: 'pending' },
    { label: 'Configuring gateway on port 18789...', status: 'pending' },
    { label: 'Installing background service...', status: 'pending' },
    { label: 'Starting your assistant...', status: 'pending' },
    { label: 'Running health check...', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyRunning, setAlreadyRunning] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    checkExistingGateway();
  }, []);

  // Track elapsed time so user knows it's not frozen
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  async function checkExistingGateway() {
    setChecking(true);
    try {
      const api = getAPI();
      const health = await api.healthCheck();
      if (health.healthy) {
        setAlreadyRunning(true);
        setSuccess(true);
        setGatewayStarted(true);
        setSteps((prev) => prev.map((s) => ({ ...s, status: 'pass' })));
      } else {
        startGateway();
      }
    } catch {
      startGateway();
    }
    setChecking(false);
  }

  async function startGateway() {
    setRunning(true);
    setElapsed(0);
    setError(null);
    setAlreadyRunning(false);
    clearTerminalOutput();

    const api = getAPI();

    const removeOutput = api.onCommandOutput((data) => {
      appendTerminalOutput(data.text);
    });

    const removeProgress = api.onInstallProgress((data) => {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.label.toLowerCase().includes(data.step.toLowerCase().split(' ')[0])) {
            return {
              ...s,
              status: data.status === 'running' ? 'checking' : data.status === 'complete' ? 'pass' : data.status === 'error' ? 'fail' : s.status,
            };
          }
          return s;
        })
      );
    });

    try {
      // Configure and start
      const configResult = await api.configure(useWizardStore.getState().getSerializableState());
      if (!configResult.success) {
        throw new Error(configResult.error || 'Configuration failed');
      }

      // Start gateway
      setSteps((prev) => prev.map((s, i) => (i === 0 ? { ...s, status: 'checking' } : s)));
      const result = await api.startGateway();

      if (result.success) {
        // Store the gateway token if returned
        if (result.token) setGatewayToken(result.token);

        // Mark all steps complete
        setSteps((prev) => prev.map((s, i) => (i < 4 ? { ...s, status: 'pass' } : s)));

        // Health check — retry a few times since gateway may need a moment
        setSteps((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: 'checking' } : s)));
        let healthy = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((r) => setTimeout(r, 1500));
          const health = await api.healthCheck();
          if (health.healthy) {
            healthy = true;
            break;
          }
        }

        if (healthy) {
          setSteps((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: 'pass' } : s)));
          setGatewayStarted(true);
          setSuccess(true);
        } else {
          setSteps((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: 'fail' } : s)));
          setError('Gateway started but health check failed. It may need a moment to initialize.');
        }
      } else {
        throw new Error(result.error || 'Gateway failed to start');
      }
    } catch (err) {
      setError((err as Error).message);
      setSteps((prev) =>
        prev.map((s) => (s.status === 'checking' ? { ...s, status: 'fail' } : s))
      );
    }

    removeOutput();
    removeProgress();
    setRunning(false);
  }

  return (
    <StepContainer
      title="Start your assistant"
      subtitle={alreadyRunning ? 'Your gateway is already running' : 'Setting up the gateway and background service'}
      nextDisabled={checking}
      onNext={nextStep}
      nextLabel={success ? 'Continue' : 'Skip for Now'}
    >
      {/* Already running banner */}
      {alreadyRunning && (
        <div className="rounded-xl border border-brand-success/30 bg-brand-success/[0.06] p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-success/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-brand-success" />
            </div>
            <div>
              <h3 className="text-[15px] font-medium text-brand-text">Gateway is already running</h3>
              <p className="text-[13px] text-brand-muted mt-0.5">
                Health check passed on port 18789. You can continue to the next step.
              </p>
            </div>
          </div>
          <button
            onClick={startGateway}
            className="mt-4 text-[12px] text-brand-accent hover:underline"
          >
            Restart gateway anyway
          </button>
        </div>
      )}

      {!alreadyRunning && (
        <>
          {/* Animation */}
          <div className="flex justify-center mb-8">
            <div className={`p-6 rounded-2xl ${success ? 'bg-brand-success/10' : running ? 'bg-brand-accent/10 animate-pulse-glow' : 'bg-brand-surface'}`}>
              <Server className={`w-12 h-12 ${success ? 'text-brand-success' : 'text-brand-accent'}`} />
            </div>
          </div>

          <div className="space-y-1 mb-6">
            {steps.map((step) => (
              <StatusCheck
                key={step.label}
                label={step.label}
                status={step.status}
              />
            ))}
          </div>

          {running && elapsed > 5 && (
            <p className="text-[12px] text-brand-muted text-center mb-4">
              Running for {elapsed}s...
            </p>
          )}

          {error && (
            <ErrorPanel
              title="Gateway setup issue"
              message={error}
              suggestion="This sometimes takes a minute. Try again or check the terminal output for details."
              onRetry={startGateway}
            />
          )}

          <TerminalOutput title="Gateway Output" />
        </>
      )}

      <div className="mt-6">
        <ExplainerBox title="What is the daemon?">
          <p>
            The daemon keeps your assistant running in the background, even after you close
            this wizard. It starts automatically when you restart your computer. Without it,
            you&apos;d have to manually start OpenClaw every time.
          </p>
        </ExplainerBox>
      </div>
    </StepContainer>
  );
}
