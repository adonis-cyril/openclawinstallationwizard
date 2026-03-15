'use client';

import { useState } from 'react';
import StepContainer from '@/components/StepContainer';
import ExplainerBox from '@/components/ExplainerBox';
import APIKeyInput from '@/components/APIKeyInput';
import { useWizardStore } from '@/lib/store';
import { CHANNELS } from '@/data/channels';
import { Check, MessageCircle, Send, Hash, Globe, AlertCircle } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  MessageCircle, Send, Hash, Globe,
};

export default function ChannelsStep() {
  const { selectedChannels, setChannelConfig, nextStep } = useWizardStore();
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  function toggleChannel(id: string) {
    const current = selectedChannels[id];
    if (current?.enabled) {
      setChannelConfig(id, { enabled: false });
    } else {
      setChannelConfig(id, { enabled: true });
      setExpandedChannel(id);
    }
  }

  const hasChannel = Object.values(selectedChannels).some((c) => c.enabled);

  return (
    <StepContainer
      title="Where do you want to chat with your assistant?"
      subtitle="Select one or more messaging channels"
      nextDisabled={!hasChannel}
      onNext={nextStep}
    >
      <div className="space-y-3">
        {CHANNELS.map((channel) => {
          const isSelected = selectedChannels[channel.id]?.enabled;
          const isExpanded = expandedChannel === channel.id && isSelected;
          const Icon = iconMap[channel.icon] || MessageCircle;

          return (
            <div
              key={channel.id}
              className={`rounded-xl border-2 transition-all overflow-hidden
                ${isSelected ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-border bg-brand-surface'}
              `}
            >
              <button
                onClick={() => toggleChannel(channel.id)}
                className="w-full text-left p-5 flex items-start gap-4"
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-accent/20' : 'bg-brand-border/50'}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-brand-muted'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-brand-text">{channel.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-border text-brand-muted">
                      {channel.popularity}
                    </span>
                    <span className="text-xs text-brand-muted">
                      Setup: {channel.setupDifficulty}
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-1">{channel.description}</p>
                </div>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected ? 'border-brand-accent bg-brand-accent' : 'border-brand-border'}
                `}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-bg" />}
                </span>
              </button>

              {/* Expanded setup instructions */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-brand-border/50 pt-4 animate-slide-up">
                  {channel.callout && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-warning/5 border border-brand-warning/20 mb-4">
                      <AlertCircle className="w-4 h-4 text-brand-warning flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-brand-muted">{channel.callout}</p>
                    </div>
                  )}

                  <h4 className="text-sm font-medium text-brand-text mb-3">Setup Instructions</h4>
                  <ol className="space-y-2">
                    {channel.setupInstructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-brand-muted">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-border flex items-center justify-center text-xs text-brand-muted">
                          {i + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>

                  {channel.requiresToken && (
                    <div className="mt-4">
                      <APIKeyInput
                        label={channel.tokenLabel || 'Token'}
                        value={selectedChannels[channel.id]?.token || ''}
                        onChange={(val) =>
                          setChannelConfig(channel.id, {
                            ...selectedChannels[channel.id],
                            enabled: true,
                            token: val,
                          })
                        }
                        placeholder={channel.tokenPlaceholder || 'Enter token...'}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Click to expand/collapse */}
              {isSelected && !isExpanded && (
                <button
                  onClick={() => setExpandedChannel(channel.id)}
                  className="w-full px-5 py-2 text-xs text-brand-accent hover:bg-brand-accent/5 border-t border-brand-border/50 transition-colors"
                >
                  Show setup instructions
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => setExpandedChannel(null)}
                  className="w-full px-5 py-2 text-xs text-brand-muted hover:bg-brand-bg border-t border-brand-border/50 transition-colors"
                >
                  Hide instructions
                </button>
              )}
            </div>
          );
        })}
      </div>
    </StepContainer>
  );
}
