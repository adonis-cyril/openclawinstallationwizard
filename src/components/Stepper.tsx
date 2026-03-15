'use client';

import { STEPS } from '@/data/steps';
import { useWizardStore } from '@/lib/store';
import { Check } from 'lucide-react';
import ClawLogo from '@/components/ClawLogo';

export default function Stepper() {
  const { currentStep, completedSteps, goToStep } = useWizardStore();

  return (
    <nav className="w-60 min-h-screen bg-brand-surface border-r border-brand-border flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-8 pb-10">
        <div className="flex items-center gap-3">
          <ClawLogo size={36} />
          <div>
            <h1 className="text-[15px] font-serif font-semibold text-brand-text tracking-tight">OpenClaw</h1>
            <p className="text-[11px] text-brand-muted -mt-0.5">Setup Wizard</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 px-4 relative">
        {/* Connecting line */}
        <div className="absolute left-[29px] top-0 bottom-0 w-px bg-brand-border" />

        <ol className="relative space-y-0.5">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = currentStep === index;
            const isClickable = isCompleted || isCurrent || index === 0;

            return (
              <li key={step.id}>
                <button
                  onClick={() => isClickable && goToStep(index)}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-[13px] transition-all duration-200 text-left group
                    ${isCurrent
                      ? 'text-brand-text bg-brand-bg'
                      : isCompleted
                        ? 'text-brand-muted hover:text-brand-text'
                        : 'text-brand-muted-light'
                    }
                    ${isClickable && !isCurrent ? 'hover:bg-brand-bg/50 cursor-pointer' : !isClickable ? 'cursor-default' : ''}
                  `}
                >
                  {/* Step indicator */}
                  <span className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 border
                    ${isCurrent
                      ? 'border-brand-accent bg-brand-accent'
                      : isCompleted
                        ? 'border-brand-success bg-brand-success/10'
                        : 'border-brand-border bg-brand-surface'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-brand-success" strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-brand-muted-light" />
                    )}
                  </span>

                  <span className={`transition-colors duration-200 ${isCurrent ? 'font-medium' : ''}`}>
                    {step.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-brand-muted">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'w-2.5 bg-brand-accent' : 'w-1 bg-brand-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
