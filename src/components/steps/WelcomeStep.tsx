'use client';

import { useEffect, useState } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { Rocket, RefreshCw } from 'lucide-react';

export default function WelcomeStep() {
  const { setInstallType, setDetectedOS, detectedOS, nextStep, installType } = useWizardStore();
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    detectOS();
  }, []);

  async function detectOS() {
    setDetecting(true);
    try {
      const api = getAPI();
      const result = await api.systemCheck();
      setDetectedOS(result.os);
    } catch {
      // Fallback
      setDetectedOS({ name: 'Unknown', version: '', arch: '' });
    }
    setDetecting(false);
  }

  function handleFreshInstall() {
    setInstallType('fresh');
    nextStep();
  }

  function handleExistingInstall() {
    setInstallType('existing');
    nextStep();
  }

  return (
    <StepContainer
      title=""
      showBack={false}
      showNext={false}
    >
      <div className="text-center mt-8 mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-accent/10 mb-6">
          <Rocket className="w-10 h-10 text-brand-accent" />
        </div>
        <h1 className="text-4xl font-bold text-brand-text mb-4">
          Set up your AI assistant in 10 minutes
        </h1>
        <p className="text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed">
          OpenClaw is an open-source AI assistant that lives in your messaging apps
          (WhatsApp, Telegram, Discord). It can manage your calendar, draft emails,
          automate tasks, and more. This wizard will install and configure everything for you.
        </p>

        {/* OS Badge */}
        {detectedOS && !detecting && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-sm">
            <span className="text-brand-muted">Detected:</span>
            <span className="text-brand-text font-medium">
              {detectedOS.name} {detectedOS.version} {detectedOS.arch ? `(${detectedOS.arch})` : ''}
            </span>
          </div>
        )}
        {detecting && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-sm text-brand-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Detecting your system...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <button
          onClick={handleFreshInstall}
          className={`p-6 rounded-xl border-2 transition-all text-left
            ${installType === 'fresh'
              ? 'border-brand-accent bg-brand-accent/5'
              : 'border-brand-border hover:border-brand-accent/50 bg-brand-surface'
            }
          `}
        >
          <h3 className="font-semibold text-brand-text text-lg mb-2">Fresh Install</h3>
          <p className="text-sm text-brand-muted">
            New machine, nothing installed yet. We&apos;ll set up everything from scratch.
          </p>
        </button>

        <button
          onClick={handleExistingInstall}
          className={`p-6 rounded-xl border-2 transition-all text-left
            ${installType === 'existing'
              ? 'border-brand-accent bg-brand-accent/5'
              : 'border-brand-border hover:border-brand-accent/50 bg-brand-surface'
            }
          `}
        >
          <h3 className="font-semibold text-brand-text text-lg mb-2">Already Installed</h3>
          <p className="text-sm text-brand-muted">
            I have OpenClaw installed already. Skip to configuration.
          </p>
        </button>
      </div>
    </StepContainer>
  );
}
