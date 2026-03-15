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
    <nav className="w-64 min-h-screen bg-brand-surface border-r border-brand-border p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-brand-text">OpenClaw</h1>
        <p className="text-sm text-brand-muted">Setup Wizard</p>
      </div>

      <ol className="flex-1 space-y-1">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = currentStep === index;
          const isClickable = isCompleted || isCurrent || index === 0;
          const Icon = iconMap[step.icon];

          return (
            <li key={step.id}>
              <button
                onClick={() => isClickable && goToStep(index)}
                disabled={!isClickable}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left
                  ${isCurrent
                    ? 'bg-brand-accent/10 text-brand-accent font-medium'
                    : isCompleted
                      ? 'text-brand-success hover:bg-brand-surface cursor-pointer'
                      : 'text-brand-muted cursor-default'
                  }
                  ${isClickable && !isCurrent ? 'hover:bg-white/5' : ''}
                `}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${isCurrent
                    ? 'bg-brand-accent text-white'
                    : isCompleted
                      ? 'bg-brand-success/20 text-brand-success'
                      : 'bg-brand-border text-brand-muted'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : Icon ? (
                    <Icon className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 pt-4 border-t border-brand-border">
        <p className="text-xs text-brand-muted">
          Step {currentStep + 1} of {STEPS.length}
        </p>
      </div>
    </nav>
  );
}
