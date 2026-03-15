'use client';

import { useWizardStore } from '@/lib/store';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';

interface StepContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
  helpContent?: React.ReactNode;
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
  helpContent,
}: StepContainerProps) {
  const { currentStep, prevStep, nextStep } = useWizardStore();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-8 pb-24">
        <div className="max-w-3xl mx-auto animate-slide-up">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-text">{title}</h2>
              {subtitle && (
                <p className="text-brand-muted mt-1">{subtitle}</p>
              )}
            </div>
            {helpContent && (
              <button
                className="p-2 rounded-lg hover:bg-white/5 text-brand-muted hover:text-brand-text transition-colors"
                title="Help"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}
          </div>

          {children}
        </div>
      </div>

      <div className="border-t border-brand-border bg-brand-surface px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-between">
          {showBack && currentStep > 0 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}
          {showNext && (
            <button
              onClick={handleNext}
              disabled={nextDisabled}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all
                ${nextDisabled
                  ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                  : 'bg-brand-accent hover:bg-brand-accent/90 text-white'
                }
              `}
            >
              {nextLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
