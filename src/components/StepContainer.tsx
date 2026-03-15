'use client';

import { useEffect, useState } from 'react';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface StepContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
}

export default function StepContainer({
  title,
  subtitle,
  children,
  showBack = true,
  showNext = true,
  nextLabel = 'Continue',
  nextDisabled = false,
  onNext,
}: StepContainerProps) {
  const { currentStep, prevStep, nextStep, resetCurrentStep, resetWizard } = useWizardStore();
  const [showResetMenu, setShowResetMenu] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isElectronRuntime, setIsElectronRuntime] = useState(true);

  useEffect(() => {
    setIsElectronRuntime(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);

  const handleNext = () => {
    if (onNext) onNext();
    else nextStep();
  };

  const handleResetPage = () => {
    resetCurrentStep();
    setShowResetMenu(false);
  };

  const handleFullReset = async () => {
    setResetting(true);
    setShowResetMenu(false);
    try {
      const api = getAPI();
      await api.fullReset();
    } catch {
      // Even if uninstall fails, reset the wizard state
    }
    resetWizard();
    setResetting(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-brand-bg">
      {/* Resetting overlay */}
      {resetting && (
        <div className="fixed inset-0 z-50 bg-brand-bg/90 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-brand-accent/30 border-t-brand-accent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[15px] font-medium text-brand-text">Resetting installation...</p>
            <p className="text-[13px] text-brand-muted mt-1">Removing OpenClaw and clearing configuration</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-10 py-12 pb-28">
        <div className="max-w-2xl mx-auto animate-slide-up">
          {!isElectronRuntime && (
            <div className="mb-6 rounded-xl border border-brand-warning/30 bg-brand-warning/10 px-4 py-3">
              <p className="text-[13px] font-medium text-brand-text">Browser preview mode</p>
              <p className="text-[12px] text-brand-muted mt-1">
                Electron is not connected, so setup actions use mock responses. Open Dashboard token links will not fully work here.
              </p>
            </div>
          )}
          {title && (
            <div className="mb-10">
              <h2 className="text-2xl font-serif font-semibold text-brand-text tracking-tight leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-brand-muted text-[15px] mt-2.5 leading-relaxed">{subtitle}</p>
              )}
            </div>
          )}
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      <div className="border-t border-brand-border bg-brand-surface px-10 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1">
            {showBack && currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-brand-muted hover:text-brand-text transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Reset menu */}
            <div className="relative">
              <button
                onClick={() => setShowResetMenu(!showResetMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-md text-[12px] text-brand-muted hover:text-brand-text transition-colors"
                title="Reset options"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {showResetMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowResetMenu(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-xl border border-brand-border bg-brand-surface shadow-elevated overflow-hidden animate-slide-up">
                    <div className="p-1.5">
                      <button
                        onClick={handleResetPage}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] hover:bg-brand-bg transition-colors"
                      >
                        <span className="font-medium text-brand-text block">Reset this page</span>
                        <span className="text-[11px] text-brand-muted">Clear your choices on the current step</span>
                      </button>
                      <button
                        onClick={handleFullReset}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-[13px] hover:bg-brand-error/5 transition-colors"
                      >
                        <span className="font-medium text-brand-error block">Full reset</span>
                        <span className="text-[11px] text-brand-muted">Uninstall OpenClaw, clear everything, start over</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {showNext && (
            <button
              onClick={handleNext}
              disabled={nextDisabled}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                ${nextDisabled
                  ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                  : 'btn-primary'
                }
              `}
            >
              {nextLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
