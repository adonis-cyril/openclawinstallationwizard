'use client';

import { STEPS } from '@/data/steps';
import { useWizardStore } from '@/lib/store';
import {
  Rocket, Lightbulb, Monitor, Download, Brain,
  MessageSquare, Wrench, Zap, Server, BookOpen,
  PartyPopper, Check,
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Rocket, Lightbulb, Monitor, Download, Brain,
  MessageSquare, Wrench, Zap, Server, BookOpen, PartyPopper,
};

export default function Stepper() {
  const { currentStep, completedSteps, goToStep } = useWizardStore();

  return (
    <nav className="w-60 min-h-screen bg-brand-surface/50 border-r border-brand-border/50 flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-purple flex items-center justify-center">
            <span className="text-white text-sm font-bold">OC</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-brand-text tracking-tight">OpenClaw</h1>
            <p className="text-[11px] text-brand-muted -mt-0.5">Setup Wizard</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 px-3 relative">
        {/* Connecting line */}
        <div className="absolute left-[27px] top-0 bottom-0 w-px bg-brand-border/40" />

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
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-md text-[13px] transition-all duration-200 text-left group
                    ${isCurrent
                      ? 'text-brand-text bg-white/[0.04]'
                      : isCompleted
                        ? 'text-brand-muted hover:text-brand-text'
                        : 'text-brand-muted/50'
                    }
                    ${isClickable && !isCurrent ? 'hover:bg-white/[0.02] cursor-pointer' : !isClickable ? 'cursor-default' : ''}
                  `}
                >
                  {/* Step indicator */}
                  <span className={`relative z-10 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200
                    ${isCurrent
                      ? 'bg-brand-accent shadow-glow'
                      : isCompleted
                        ? 'bg-brand-success/20'
                        : 'bg-brand-border/60'
                    }
                  `}>
                    {isCompleted ? (
                      <Check className="w-3 h-3 text-brand-success" strokeWidth={2.5} />
                    ) : isCurrent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-brand-muted/40" />
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
      <div className="px-5 py-4 border-t border-brand-border/30">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-brand-muted/60">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <div className="flex gap-0.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= currentStep ? 'w-2 bg-brand-accent' : 'w-1 bg-brand-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
