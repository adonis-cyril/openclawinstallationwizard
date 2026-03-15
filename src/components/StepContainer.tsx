'use client';

import { useWizardStore } from '@/lib/store';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
}: StepContainerProps) {
  const { currentStep, prevStep, nextStep } = useWizardStore();

  const handleNext = () => {
    if (onNext) onNext();
    else nextStep();
  };

  return (
    <div className="flex-1 flex flex-col h-screen ambient-glow">
      <div className="flex-1 overflow-y-auto px-10 py-10 pb-28">
        <div className="max-w-2xl mx-auto animate-slide-up">
          {title && (
            <div className="mb-8">
              <h2 className="text-[22px] font-semibold text-brand-text tracking-tight leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-brand-muted text-[15px] mt-2 leading-relaxed">{subtitle}</p>
              )}
            </div>
          )}
          <div className="relative z-10">{children}</div>
        </div>
      </div>

      <div className="border-t border-brand-border/30 bg-brand-surface/80 backdrop-blur-sm px-10 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
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
          {showNext && (
            <button
              onClick={handleNext}
              disabled={nextDisabled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200
                ${nextDisabled
                  ? 'bg-brand-border text-brand-muted/50 cursor-not-allowed'
                  : 'btn-gradient text-white'
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
