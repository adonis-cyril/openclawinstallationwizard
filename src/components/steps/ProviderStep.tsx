'use client';

import { useState } from 'react';
import StepContainer from '@/components/StepContainer';
import APIKeyInput from '@/components/APIKeyInput';
import ExplainerBox from '@/components/ExplainerBox';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { PROVIDERS } from '@/data/providers';
import { Check, Star } from 'lucide-react';

export default function ProviderStep() {
  const {
    selectedProvider, setSelectedProvider,
    apiKey, setApiKey, apiKeyValid, setApiKeyValid,
    selectedModel, setSelectedModel, nextStep,
  } = useWizardStore();

  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationError, setValidationError] = useState<string>('');

  const currentProvider = PROVIDERS.find((p) => p.id === selectedProvider);

  async function validateApiKey() {
    if (!selectedProvider || !apiKey) return;
    setValidationStatus('validating');
    try {
      const api = getAPI();
      const result = await api.validateKey(selectedProvider, apiKey);
      if (result.valid) {
        setValidationStatus('valid');
        setApiKeyValid(true);
      } else {
        setValidationStatus('invalid');
        setValidationError(result.error || 'Invalid API key');
        setApiKeyValid(false);
      }
    } catch (err) {
      setValidationStatus('invalid');
      setValidationError((err as Error).message);
      setApiKeyValid(false);
    }
  }

  function handleProviderSelect(id: string) {
    setSelectedProvider(id);
    setValidationStatus('idle');
    setValidationError('');
  }

  const canProceed = selectedProvider && (selectedProvider === 'ollama' || apiKeyValid) && selectedModel;

  return (
    <StepContainer
      title="Choose your AI brain"
      subtitle="Select which AI model powers your assistant"
      nextDisabled={!canProceed}
      onNext={nextStep}
    >
      {/* Provider cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleProviderSelect(provider.id)}
            className={`relative text-left p-5 rounded-xl border-2 transition-all
              ${selectedProvider === provider.id
                ? 'border-brand-accent bg-brand-accent/5'
                : 'border-brand-border hover:border-brand-border/80 bg-brand-surface'
              }
            `}
          >
            {provider.recommended && (
              <span className="absolute top-3 right-3 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent font-medium">
                <Star className="w-3 h-3" /> Recommended
              </span>
            )}
            {selectedProvider === provider.id && (
              <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
            <h3 className="font-medium text-brand-text mt-1">{provider.name}</h3>
            <p className="text-sm text-brand-muted mt-1">{provider.description}</p>
            <div className="mt-3 flex gap-4 text-xs text-brand-muted">
              <span>Best for: {provider.bestFor}</span>
              <span>Cost: {provider.cost}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Provider details */}
      {currentProvider && (
        <div className="space-y-6 animate-slide-up">
          {/* API Key */}
          {currentProvider.id !== 'ollama' && (
            <>
              <ExplainerBox title="How to get your API key" defaultOpen>
                <p>{currentProvider.keyInstructions}</p>
              </ExplainerBox>

              <APIKeyInput
                value={apiKey}
                onChange={(val) => {
                  setApiKey(val);
                  setValidationStatus('idle');
                }}
                placeholder={currentProvider.keyPlaceholder}
                onValidate={validateApiKey}
                validationStatus={validationStatus}
                validationError={validationError}
              />
            </>
          )}

          {/* Model selection */}
          {(currentProvider.id === 'ollama' || apiKeyValid) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-brand-text">Select a model</h3>
              {currentProvider.models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all
                    ${selectedModel === model.id
                      ? 'border-brand-accent bg-brand-accent/5'
                      : 'border-brand-border bg-brand-surface hover:border-brand-border/80'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-brand-text">{model.name}</span>
                    {model.recommended && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-brand-accent/20 text-brand-accent">Recommended</span>
                    )}
                  </div>
                  <p className="text-sm text-brand-muted mt-1">{model.description}</p>
                </button>
              ))}
            </div>
          )}

          {/* Cost callout */}
          <div className="p-4 rounded-lg bg-brand-warning/5 border border-brand-warning/20">
            <h4 className="text-sm font-medium text-brand-warning mb-1">Cost Tip</h4>
            <p className="text-sm text-brand-muted">
              OpenClaw uses tokens (units of text) every time you send a message. A typical casual user
              spends $3-10/month. Power users can spend $50-150/month. We&apos;ll show you how to optimize
              this after setup.
            </p>
          </div>
        </div>
      )}
    </StepContainer>
  );
}
