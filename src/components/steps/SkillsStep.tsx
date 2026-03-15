'use client';

import { useMemo } from 'react';
import StepContainer from '@/components/StepContainer';
import ExplainerBox from '@/components/ExplainerBox';
import { useWizardStore } from '@/lib/store';
import { SKILLS } from '@/data/skills';
import { USE_CASES } from '@/data/use-cases';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function SkillsStep() {
  const { selectedSkills, toggleSkill, selectedUseCases, nextStep } = useWizardStore();
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const skillBadges = useMemo(() => {
    const badges: Record<string, 'Required' | 'Recommended' | 'Optional'> = {};
    const cases = USE_CASES.filter((uc) => selectedUseCases.includes(uc.id));

    for (const skill of SKILLS) {
      const isRequired = cases.some((c) => c.requiredSkills.includes(skill.id));
      const isRecommended = cases.some((c) => c.recommendedSkills.includes(skill.id));
      badges[skill.id] = isRequired ? 'Required' : isRecommended ? 'Recommended' : 'Optional';
    }
    return badges;
  }, [selectedUseCases]);

  const categories = [
    { label: 'Bundled (free, no setup needed)', skills: SKILLS.filter((s) => s.category === 'bundled') },
    { label: 'Requires API Key or OAuth', skills: SKILLS.filter((s) => s.category === 'api-required') },
  ];

  return (
    <StepContainer
      title="Teach your assistant new abilities"
      subtitle="Skills are instruction sets that teach your assistant how to perform tasks"
      onNext={nextStep}
    >
      <ExplainerBox title="What are Skills?" defaultOpen>
        <p>
          Skills are instruction sets that teach your assistant how to perform specific tasks.
          Think of them as training manuals. Without the &ldquo;weather&rdquo; skill, your assistant
          doesn&apos;t know how to check the forecast. Without the &ldquo;gog&rdquo; skill, it can&apos;t
          read your Gmail.
        </p>
      </ExplainerBox>

      <div className="mt-6 space-y-8">
        {categories.map((cat) => (
          <div key={cat.label}>
            <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-3">
              {cat.label}
            </h3>
            <div className="space-y-2">
              {cat.skills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.id);
                const badge = skillBadges[skill.id];
                const isExpanded = expandedSkill === skill.id;

                return (
                  <div
                    key={skill.id}
                    className={`rounded-lg border transition-all
                      ${isSelected ? 'border-brand-accent/50 bg-brand-accent/5' : 'border-brand-border bg-brand-surface'}
                    `}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSkill(skill.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSkill(skill.id); } }}
                      className="w-full text-left p-4 flex items-center gap-3 cursor-pointer"
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                        ${isSelected ? 'border-brand-accent bg-brand-accent' : 'border-brand-border'}
                      `}>
                        {isSelected && <Check className="w-3 h-3 text-brand-bg" />}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-brand-text">{skill.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${badge === 'Required' ? 'bg-brand-error/20 text-brand-error' :
                              badge === 'Recommended' ? 'bg-brand-accent/20 text-brand-accent' :
                              'bg-brand-border text-brand-muted'}
                          `}>
                            {badge}
                          </span>
                        </div>
                        <p className="text-sm text-brand-muted">{skill.description}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSkill(isExpanded ? null : skill.id);
                        }}
                        className="text-brand-muted hover:text-brand-text p-1"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 text-sm text-brand-muted border-t border-brand-border/50 mt-0 pt-3 animate-slide-up">
                        <p className="font-medium text-brand-text mb-1">Why you need this:</p>
                        <p>{skill.whyNeeded}</p>
                        {skill.dependencies && skill.dependencies.length > 0 && (
                          <p className="mt-2 text-xs text-brand-warning">
                            Requires: {skill.dependencies.join(', ')}
                          </p>
                        )}
                        {skill.requiresOAuth && (
                          <p className="mt-2 text-xs text-brand-warning">
                            Requires: {skill.requiresOAuth} OAuth setup
                          </p>
                        )}
                        {skill.requiresApiKey && (
                          <p className="mt-2 text-xs text-brand-warning">
                            Requires: {skill.requiresApiKey}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-brand-surface border border-brand-border">
        <p className="text-sm text-brand-muted">
          You can browse and install 3,000+ community skills later from ClawHub. For now,
          we recommend starting with the basics.
        </p>
      </div>
    </StepContainer>
  );
}
