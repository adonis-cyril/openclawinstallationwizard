'use client';

import { useMemo, useState } from 'react';
import StepContainer from '@/components/StepContainer';
import ExplainerBox from '@/components/ExplainerBox';
import { useWizardStore } from '@/lib/store';
import { HOOKS } from '@/data/hooks';
import { USE_CASES } from '@/data/use-cases';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';

export default function HooksStep() {
  const { selectedHooks, toggleHook, selectedUseCases, nextStep } = useWizardStore();
  const [expandedHook, setExpandedHook] = useState<string | null>(null);

  const hookBadges = useMemo(() => {
    const badges: Record<string, 'Required' | 'Recommended' | 'Optional'> = {};
    const cases = USE_CASES.filter((uc) => selectedUseCases.includes(uc.id));

    for (const hook of HOOKS) {
      const isRequired = cases.some((c) => c.requiredHooks.includes(hook.id));
      const isRecommended = cases.some((c) => c.recommendedHooks.includes(hook.id));
      badges[hook.id] = isRequired ? 'Required' : isRecommended ? 'Recommended' : 'Optional';
    }
    return badges;
  }, [selectedUseCases]);

  return (
    <StepContainer
      title="Set up automations"
      subtitle="Hooks are scripts that run automatically when something happens"
      onNext={nextStep}
    >
      <ExplainerBox title="What are Hooks?" defaultOpen>
        <p>
          Hooks are small scripts that run automatically when something happens. For example,
          the &ldquo;session-memory&rdquo; hook saves your conversation context when you start a new
          chat, so your assistant remembers what you talked about before. Hooks run in the
          background. You don&apos;t interact with them directly.
        </p>
      </ExplainerBox>

      <div className="mt-6 space-y-3">
        {HOOKS.map((hook) => {
          const isSelected = selectedHooks.includes(hook.id);
          const badge = hookBadges[hook.id];
          const isExpanded = expandedHook === hook.id;

          return (
            <div
              key={hook.id}
              className={`rounded-xl border-2 transition-all overflow-hidden
                ${isSelected ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-surface'}
              `}
            >
              <button
                onClick={() => toggleHook(hook.id)}
                className="w-full text-left p-5 flex items-start gap-3"
              >
                <span className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all
                  ${isSelected ? 'border-brand-accent bg-brand-accent' : 'border-brand-border'}
                `}>
                  {isSelected && <Check className="w-3 h-3 text-brand-bg" />}
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-brand-text">{hook.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${badge === 'Required' ? 'bg-brand-error/20 text-brand-error' :
                        badge === 'Recommended' ? 'bg-brand-accent/20 text-brand-accent' :
                        'bg-brand-border text-brand-muted'}
                    `}>
                      {badge}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted">{hook.description}</p>
                  <p className="text-xs text-brand-muted/70 mt-1">Trigger: {hook.trigger}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedHook(isExpanded ? null : hook.id);
                  }}
                  className="text-brand-muted hover:text-brand-text p-1"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-brand-border/50 pt-4 animate-slide-up">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-brand-text mb-1">What it does:</p>
                      <p className="text-brand-muted">{hook.whatItDoes}</p>
                    </div>
                    <div>
                      <p className="font-medium text-brand-text mb-1">Example:</p>
                      <p className="text-brand-muted italic">{hook.example}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </StepContainer>
  );
}
