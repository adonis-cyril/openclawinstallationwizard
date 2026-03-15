'use client';

import { useEffect, useState } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { Rocket, RefreshCw, ArrowRight } from 'lucide-react';

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
      {/* Background dot grid */}
      <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

      <div className="relative text-center mt-8 mb-12">
        {/* Gradient icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-accent/20 to-brand-purple/20 mb-6">
          <Rocket className="w-10 h-10 text-brand-accent" />
        </div>

        <h1 className="text-4xl font-semibold text-gradient tracking-tight mb-4">
          Set up your AI assistant in 10 minutes
        </h1>
        <p className="text-[15px] text-brand-muted max-w-lg mx-auto leading-relaxed">
          OpenClaw is an open-source AI assistant that lives in your messaging apps.
          This wizard will install and configure everything for you.
        </p>

        {/* OS Badge */}
        {detectedOS && !detecting && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-brand-surface/80 border border-brand-border/50 text-[13px]">
            <span className="text-brand-muted/70">Detected:</span>
            <span className="text-brand-text font-medium">
              {detectedOS.name} {detectedOS.version} {detectedOS.arch ? `(${detectedOS.arch})` : ''}
            </span>
          </div>
        )}
        {detecting && (
          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-brand-surface/80 border border-brand-border/50 text-[13px] text-brand-muted">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Detecting your system...
          </div>
        )}
      </div>

      <div className="relative grid grid-cols-2 gap-4 max-w-xl mx-auto">
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
      <div className="relative text-center mt-10">
        <p className="text-[11px] text-brand-muted/40 tracking-wide">
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
      className={`group p-6 rounded-xl border-2 transition-all duration-200 text-left
        ${isActive
          ? 'border-brand-accent/60 bg-brand-accent/[0.06] shadow-glow'
          : 'border-brand-border/60 hover:border-brand-accent/40 hover:scale-[1.01] bg-brand-surface/50'
        }
      `}
    >
      <h3 className="font-semibold text-brand-text text-[15px] mb-2">{title}</h3>
      <p className="text-[13px] text-brand-muted leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-[12px] text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity">
        {cta} <ArrowRight className="w-3 h-3" />
      </div>
    </button>
  );
}
