'use client';

import { useEffect, useState } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { ArrowRight, RefreshCw } from 'lucide-react';

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
      <div className="text-center mt-6 mb-14">
        <h1 className="font-serif text-5xl font-medium text-brand-text tracking-tight leading-[1.15] mb-6">
          Set up your AI<br />assistant in minutes
        </h1>
        <p className="text-[16px] text-brand-muted max-w-md mx-auto leading-relaxed">
          OpenClaw is an open-source AI assistant that lives in your messaging apps.
          This wizard will install and configure everything for you.
        </p>

        {/* OS Badge */}
        {detectedOS && !detecting && (
          <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-[13px]">
            <span className="text-brand-muted">Detected:</span>
            <span className="text-brand-text font-medium">
              {detectedOS.name} {detectedOS.version} {detectedOS.arch ? `(${detectedOS.arch})` : ''}
            </span>
          </div>
        )}
        {detecting && (
          <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-brand-surface border border-brand-border text-[13px] text-brand-muted">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Detecting your system...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
        <PathButton
          isActive={installType === 'fresh'}
          onClick={handleFreshInstall}
          title="Fresh Install"
          description="New machine, nothing installed yet. We'll set up everything from scratch."
          cta="Get started"
        />
        <PathButton
          isActive={installType === 'existing'}
          onClick={handleExistingInstall}
          title="Already Installed"
          description="I have OpenClaw installed already. Skip to configuration."
          cta="Configure"
        />
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-[11px] text-brand-muted-light tracking-wide uppercase">
          Powered by OpenClaw
        </p>
      </div>
    </StepContainer>
  );
}

function PathButton({ isActive, onClick, title, description, cta }: {
  isActive: boolean;
  onClick: () => void;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`group p-6 rounded-xl border transition-all duration-200 text-left
        ${isActive
          ? 'border-brand-accent bg-brand-surface shadow-card-hover'
          : 'border-brand-border bg-brand-surface hover:border-brand-muted-light hover:shadow-card'
        }
      `}
    >
      <h3 className="font-serif font-semibold text-brand-text text-lg mb-2">{title}</h3>
      <p className="text-[13px] text-brand-muted leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-[12px] text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
        {cta} <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
