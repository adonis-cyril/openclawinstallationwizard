'use client';

import { useEffect, useState } from 'react';
import StepContainer from '@/components/StepContainer';
import StatusCheck from '@/components/StatusCheck';
import ExplainerBox from '@/components/ExplainerBox';
import ErrorPanel from '@/components/ErrorPanel';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';

type CheckStatus = 'pending' | 'checking' | 'pass' | 'fail';

interface CheckItem {
  key: string;
  label: string;
  status: CheckStatus;
  detail?: string;
}

export default function SystemCheckStep() {
  const { setSystemCheckResult, systemCheckResults, installType, nextStep } = useWizardStore();
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    runChecks();
  }, []);

  async function runChecks() {
    setRunning(true);
    setError(null);

    const checkList: CheckItem[] = [
      { key: 'os', label: 'Operating System', status: 'checking' },
      { key: 'node', label: 'Node.js', status: 'pending' },
      { key: 'homebrew', label: 'Homebrew', status: 'pending' },
      { key: 'disk', label: 'Disk Space', status: 'pending' },
      { key: 'network', label: 'Network', status: 'pending' },
    ];

    // If existing install, also check for OpenClaw
    if (installType === 'existing') {
      checkList.push({ key: 'openclaw', label: 'OpenClaw', status: 'pending' });
    }

    setChecks([...checkList]);

    try {
      const api = getAPI();

      // Start checking - update each one sequentially for visual effect
      const updateCheck = (key: string, status: CheckStatus, detail?: string) => {
        setChecks((prev) =>
          prev.map((c) => (c.key === key ? { ...c, status, detail } : c))
        );
        setSystemCheckResult(key, status, detail);
      };

      // Run the full system check
      const result = await api.systemCheck();

      // OS
      updateCheck('os', 'pass', `${result.os.name} ${result.os.version} (${result.os.arch})`);

      // Small delay between each for visual feedback
      await delay(300);

      // Node.js
      updateCheck('node', 'checking');
      await delay(200);
      if (result.nodeInstalled) {
        updateCheck('node', 'pass', result.nodeVersion || 'Installed');
      } else {
        updateCheck('node', 'fail', 'Not found. Will install automatically.');
      }

      await delay(300);

      // Homebrew (macOS only)
      if (result.os.name === 'macOS') {
        updateCheck('homebrew', 'checking');
        await delay(200);
        if (result.homebrewInstalled) {
          updateCheck('homebrew', 'pass', 'Installed');
        } else {
          updateCheck('homebrew', 'fail', 'Not found. Will install automatically.');
        }
      } else {
        updateCheck('homebrew', 'pass', 'Not needed on this OS');
      }

      await delay(300);

      // Disk space
      updateCheck('disk', 'checking');
      await delay(200);
      if (result.diskSpaceGB >= 1) {
        updateCheck('disk', 'pass', `${result.diskSpaceGB} GB available`);
      } else {
        updateCheck('disk', 'fail', `Only ${result.diskSpaceGB} GB available. Need at least 1 GB.`);
      }

      await delay(300);

      // Network
      updateCheck('network', 'checking');
      await delay(200);
      if (result.networkConnected) {
        updateCheck('network', 'pass', 'Connected');
      } else {
        updateCheck('network', 'fail', 'No internet connection detected');
      }

      // OpenClaw (if checking existing)
      if (installType === 'existing') {
        await delay(300);
        updateCheck('openclaw', 'checking');
        await delay(200);
        if (result.openclawInstalled) {
          updateCheck('openclaw', 'pass', result.openclawVersion || 'Installed');
        } else {
          updateCheck('openclaw', 'fail', 'Not found');
        }
      }
    } catch (err) {
      setError((err as Error).message);
    }

    setRunning(false);
  }

  const allPassed = checks.length > 0 && checks.every((c) => c.status === 'pass');
  const hasCriticalFail = checks.some(
    (c) => c.status === 'fail' && (c.key === 'network' || c.key === 'disk')
  );

  return (
    <StepContainer
      title="Checking your system"
      subtitle="Making sure everything is ready for installation"
      nextDisabled={running || hasCriticalFail}
      onNext={() => {
        if (installType === 'existing') {
          // Skip install step, go to provider
          useWizardStore.getState().completeStep(useWizardStore.getState().currentStep);
          useWizardStore.getState().setCurrentStep(4);
        } else {
          nextStep();
        }
      }}
      nextLabel={allPassed ? 'Continue' : 'Continue Anyway'}
    >
      <div className="space-y-1 mb-6">
        {checks.map((check) => (
          <StatusCheck
            key={check.key}
            label={check.label}
            status={check.status}
            detail={check.detail}
          />
        ))}
      </div>

      {error && (
        <ErrorPanel
          title="System check failed"
          message={error}
          suggestion="Make sure you have an internet connection and try again."
          onRetry={runChecks}
        />
      )}

      <div className="space-y-3 mt-6">
        <ExplainerBox title="What is Node.js?">
          <p>Node.js is a runtime that OpenClaw needs to function. Think of it as the engine that powers the assistant. If it&apos;s not installed, we&apos;ll install it for you automatically.</p>
        </ExplainerBox>
        <ExplainerBox title="What is Homebrew?">
          <p>Homebrew is a package manager for macOS that makes installing software easy. It&apos;s like an app store for developer tools. Only needed on macOS.</p>
        </ExplainerBox>
      </div>
    </StepContainer>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
