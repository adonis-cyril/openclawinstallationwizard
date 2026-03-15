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
  const { appendTerminalOutput, clearTerminalOutput, setGatewayStarted, nextStep } = useWizardStore();
  const [steps, setSteps] = useState<GatewayStatus[]>([
    { label: 'Setting up security token...', status: 'pending' },
    { label: 'Configuring gateway on port 18789...', status: 'pending' },
    { label: 'Installing background service...', status: 'pending' },
    { label: 'Starting your assistant...', status: 'pending' },
    { label: 'Running health check...', status: 'pending' },
  ]);
  const [running, setRunning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startGateway();
  }, []);

  async function startGateway() {
    setRunning(true);
    setError(null);
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
        // Mark all steps complete
        setSteps((prev) => prev.map((s, i) => (i < 4 ? { ...s, status: 'pass' } : s)));

        // Health check
        setSteps((prev) => prev.map((s, i) => (i === 4 ? { ...s, status: 'checking' } : s)));
        await new Promise((r) => setTimeout(r, 1000));
        const health = await api.healthCheck();

        if (health.healthy) {
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
      subtitle="Setting up the gateway and background service"
      nextDisabled={running}
      onNext={nextStep}
      nextLabel={success ? 'Continue' : 'Continue Anyway'}
    >
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

      {error && (
        <ErrorPanel
          title="Gateway setup issue"
          message={error}
          suggestion="This sometimes takes a minute. Try again or check the terminal output for details."
          onRetry={startGateway}
        />
      )}

      <TerminalOutput title="Gateway Output" />

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
