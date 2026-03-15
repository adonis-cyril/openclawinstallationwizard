'use client';

import { useMemo } from 'react';
import StepContainer from '@/components/StepContainer';
import CardSelector, { CardOption } from '@/components/CardSelector';
import { useWizardStore } from '@/lib/store';
import { USE_CASES } from '@/data/use-cases';
import { SKILLS } from '@/data/skills';
import { HOOKS } from '@/data/hooks';

export default function UseCaseStep() {
  const { selectedUseCases, toggleUseCase, setSelectedSkills, setSelectedHooks, nextStep } = useWizardStore();

  const cardOptions: CardOption[] = USE_CASES.map((uc) => ({
    id: uc.id,
    name: uc.name,
    description: uc.description,
    icon: uc.icon,
    example: uc.example,
  }));

  const summary = useMemo(() => {
    const selectedCases = USE_CASES.filter((uc) => selectedUseCases.includes(uc.id));
    const requiredSkills = new Set<string>();
    const recommendedSkills = new Set<string>();
    const requiredHooks = new Set<string>();
    const recommendedHooks = new Set<string>();

    for (const uc of selectedCases) {
      uc.requiredSkills.forEach((s) => requiredSkills.add(s));
      uc.recommendedSkills.forEach((s) => recommendedSkills.add(s));
      uc.requiredHooks.forEach((h) => requiredHooks.add(h));
      uc.recommendedHooks.forEach((h) => recommendedHooks.add(h));
    }

    return { requiredSkills, recommendedSkills, requiredHooks, recommendedHooks };
  }, [selectedUseCases]);

  function handleNext() {
    // Pre-select skills and hooks based on use cases
    const allSkills = new Set([...summary.requiredSkills, ...summary.recommendedSkills]);
    const allHooks = new Set([...summary.requiredHooks, ...summary.recommendedHooks]);
    setSelectedSkills([...allSkills]);
    setSelectedHooks([...allHooks]);
    nextStep();
  }

  return (
    <StepContainer
      title="What do you want your AI assistant to do?"
      subtitle="Select one or more use cases. We'll tailor the setup based on your choices."
      nextDisabled={selectedUseCases.length === 0}
      onNext={handleNext}
    >
      <CardSelector
        options={cardOptions}
        selected={selectedUseCases}
        onToggle={toggleUseCase}
      />

      {selectedUseCases.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-brand-surface border border-brand-border animate-slide-up">
          <h3 className="text-sm font-medium text-brand-text mb-3">
            Based on your choices, we&apos;ll set up:
          </h3>
          <div className="space-y-2 text-sm text-brand-muted">
            {summary.requiredSkills.size > 0 && (
              <p>
                <span className="text-brand-error text-xs font-medium mr-2">Required</span>
                Skills: {[...summary.requiredSkills].map((s) => SKILLS.find((sk) => sk.id === s)?.name || s).join(', ')}
              </p>
            )}
            {summary.recommendedSkills.size > 0 && (
              <p>
                <span className="text-brand-accent text-xs font-medium mr-2">Recommended</span>
                Skills: {[...summary.recommendedSkills].map((s) => SKILLS.find((sk) => sk.id === s)?.name || s).join(', ')}
              </p>
            )}
            {summary.requiredHooks.size > 0 && (
              <p>
                <span className="text-brand-error text-xs font-medium mr-2">Required</span>
                Hooks: {[...summary.requiredHooks].map((h) => HOOKS.find((hk) => hk.id === h)?.name || h).join(', ')}
              </p>
            )}
            {summary.recommendedHooks.size > 0 && (
              <p>
                <span className="text-brand-accent text-xs font-medium mr-2">Recommended</span>
                Hooks: {[...summary.recommendedHooks].map((h) => HOOKS.find((hk) => hk.id === h)?.name || h).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </StepContainer>
  );
}
