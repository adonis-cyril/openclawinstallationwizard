'use client';

import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { PROVIDERS } from '@/data/providers';
import { SKILLS } from '@/data/skills';
import { HOOKS } from '@/data/hooks';
import { CHANNELS } from '@/data/channels';
import { PartyPopper, ExternalLink, MessageSquare, BookOpen, Users, RotateCcw } from 'lucide-react';

export default function CompletionStep() {
  const {
    selectedProvider, selectedModel, selectedSkills,
    selectedHooks, selectedChannels, resetWizard,
  } = useWizardStore();

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);
  const model = provider?.models.find((m) => m.id === selectedModel);
  const activeChannels = Object.entries(selectedChannels)
    .filter(([, c]) => c.enabled)
    .map(([id]) => CHANNELS.find((c) => c.id === id)?.name || id);

  return (
    <StepContainer
      title=""
      showBack={false}
      showNext={false}
    >
      {/* Success animation */}
      <div className="text-center mt-8 mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-success/10 mb-6">
          <PartyPopper className="w-10 h-10 text-brand-success" />
        </div>
        <h1 className="text-3xl font-bold text-brand-text mb-3">
          Your assistant is ready!
        </h1>
        <p className="text-lg text-brand-muted">
          Everything has been configured and your assistant is running.
        </p>
      </div>

      {/* Config summary */}
      <div className="rounded-xl border border-brand-border bg-brand-surface p-6 mb-8">
        <h3 className="text-sm font-medium text-brand-muted uppercase tracking-wider mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-brand-muted">AI Provider:</span>
            <span className="text-brand-text ml-2 font-medium">{provider?.name || 'None'}</span>
          </div>
          <div>
            <span className="text-brand-muted">Model:</span>
            <span className="text-brand-text ml-2 font-medium">{model?.name || 'None'}</span>
          </div>
          <div>
            <span className="text-brand-muted">Channels:</span>
            <span className="text-brand-text ml-2 font-medium">{activeChannels.join(', ') || 'None'}</span>
          </div>
          <div>
            <span className="text-brand-muted">Skills:</span>
            <span className="text-brand-text ml-2 font-medium">
              {selectedSkills.map((s) => SKILLS.find((sk) => sk.id === s)?.name || s).join(', ') || 'None'}
            </span>
          </div>
          <div>
            <span className="text-brand-muted">Hooks:</span>
            <span className="text-brand-text ml-2 font-medium">
              {selectedHooks.map((h) => HOOKS.find((hk) => hk.id === h)?.name || h).join(', ') || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <QuickLink
          icon={ExternalLink}
          title="Open Dashboard"
          description="Open the Control UI in your browser"
          href="http://localhost:18789"
        />
        <QuickLink
          icon={MessageSquare}
          title="Send a Test Message"
          description="Try chatting with your assistant"
          href="#"
        />
        <QuickLink
          icon={BookOpen}
          title="View Documentation"
          description="Read the full OpenClaw docs"
          href="https://docs.openclaw.ai"
        />
        <QuickLink
          icon={Users}
          title="Join the Community"
          description="Get help on Discord"
          href="https://discord.gg/openclaw"
        />
      </div>

      {/* Start over */}
      <div className="text-center">
        <button
          onClick={resetWizard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-white/5 transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </StepContainer>
  );
}

function QuickLink({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface hover:bg-brand-surface/80 hover:border-brand-accent/30 transition-all"
    >
      <div className="p-2 rounded-lg bg-brand-accent/10">
        <Icon className="w-5 h-5 text-brand-accent" />
      </div>
      <div>
        <h3 className="font-medium text-brand-text">{title}</h3>
        <p className="text-xs text-brand-muted mt-0.5">{description}</p>
      </div>
    </a>
  );
}
