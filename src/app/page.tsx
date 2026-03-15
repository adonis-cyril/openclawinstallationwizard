'use client';

import { useEffect } from 'react';
import Stepper from '@/components/Stepper';
import WelcomeStep from '@/components/steps/WelcomeStep';
import UseCaseStep from '@/components/steps/UseCaseStep';
import SystemCheckStep from '@/components/steps/SystemCheckStep';
import InstallStep from '@/components/steps/InstallStep';
import ProviderStep from '@/components/steps/ProviderStep';
import ChannelsStep from '@/components/steps/ChannelsStep';
import SkillsStep from '@/components/steps/SkillsStep';
import HooksStep from '@/components/steps/HooksStep';
import GatewayStep from '@/components/steps/GatewayStep';
import BestPracticesStep from '@/components/steps/BestPracticesStep';
import CompletionStep from '@/components/steps/CompletionStep';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';

const STEP_COMPONENTS = [
  WelcomeStep,
  UseCaseStep,
  SystemCheckStep,
  InstallStep,
  ProviderStep,
  ChannelsStep,
  SkillsStep,
  HooksStep,
  GatewayStep,
  BestPracticesStep,
  CompletionStep,
];

export default function Home() {
  const { currentStep, hydrateFromSaved, getSerializableState } = useWizardStore();

  // Load saved state on mount
  useEffect(() => {
    async function loadSaved() {
      try {
        const api = getAPI();
        const saved = await api.loadState();
        if (saved) {
          hydrateFromSaved(saved);
        }
      } catch {
        // No saved state, start fresh
      }
    }
    loadSaved();
  }, []);

  // Persist state on changes (debounced to avoid excessive writes during streaming)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useWizardStore.subscribe(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const api = getAPI();
          const state = useWizardStore.getState().getSerializableState();
          await api.saveState(state);
        } catch {
          // Silently fail persistence
        }
      }, 1000);
    });
    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const CurrentStepComponent = STEP_COMPONENTS[currentStep] || WelcomeStep;

  return (
    <div className="flex min-h-screen">
      <Stepper />
      <main className="flex-1">
        <CurrentStepComponent />
      </main>
    </div>
  );
}
