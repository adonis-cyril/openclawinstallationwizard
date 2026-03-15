'use client';

import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { PROVIDERS } from '@/data/providers';
import { SKILLS } from '@/data/skills';
import { HOOKS } from '@/data/hooks';
import { CHANNELS } from '@/data/channels';
import { PartyPopper, ExternalLink, MessageSquare, BookOpen, Users, RotateCcw } from 'lucide-react';

const SPARKLE_STYLES: React.CSSProperties[] = [
  { top: '10%', left: '20%', animation: 'sparkle 2s ease-in-out 0s infinite' },
  { top: '15%', right: '25%', animation: 'sparkle 2s ease-in-out 0.4s infinite' },
  { top: '5%', left: '45%', animation: 'sparkle 2s ease-in-out 0.8s infinite' },
  { top: '20%', right: '15%', animation: 'sparkle 2s ease-in-out 1.2s infinite' },
  { top: '8%', left: '35%', animation: 'sparkle 2s ease-in-out 1.6s infinite' },
];

const LINK_COLORS = [
  'bg-brand-accent/15 text-brand-accent',
  'bg-brand-purple/15 text-brand-purple',
  'bg-brand-success/15 text-brand-success',
  'bg-brand-warning/15 text-brand-warning',
];

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
      {/* Sparkle animations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SPARKLE_STYLES.map((style, i) => (
          <div key={i} className="absolute w-2 h-2" style={style}>
            <div className="w-full h-full bg-brand-accent/60 rounded-full" />
          </div>
        ))}
      </div>

      {/* Success hero */}
      <div className="relative text-center mt-8 mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-success/20 to-brand-accent/20 mb-6">
          <PartyPopper className="w-10 h-10 text-brand-success" />
        </div>
        <h1 className="text-3xl font-semibold text-gradient tracking-tight mb-3">
          Your assistant is ready!
        </h1>
        <p className="text-[15px] text-brand-muted">
          Everything has been configured and your assistant is running.
        </p>
      </div>

      {/* Config summary with gradient top border */}
      <div className="relative rounded-xl border border-brand-border/50 bg-brand-surface/50 p-6 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-accent via-brand-purple to-brand-accent" />
        <h3 className="text-[11px] font-medium text-brand-muted/60 uppercase tracking-wider mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <SummaryRow label="AI Provider" value={provider?.name || 'None'} />
          <SummaryRow label="Model" value={model?.name || 'None'} />
          <SummaryRow label="Channels" value={activeChannels.join(', ') || 'None'} />
          <SummaryRow label="Skills" value={selectedSkills.map((s) => SKILLS.find((sk) => sk.id === s)?.name || s).join(', ') || 'None'} />
          <SummaryRow label="Hooks" value={selectedHooks.map((h) => HOOKS.find((hk) => hk.id === h)?.name || h).join(', ') || 'None'} />
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <QuickLink
          icon={ExternalLink}
          title="Open Dashboard"
          description="Open the Control UI in your browser"
          href="http://localhost:18789"
          colorClass={LINK_COLORS[0]}
        />
        <QuickLink
          icon={MessageSquare}
          title="Send a Test Message"
          description="Try chatting with your assistant"
          href="#"
          colorClass={LINK_COLORS[1]}
        />
        <QuickLink
          icon={BookOpen}
          title="View Documentation"
          description="Read the full OpenClaw docs"
          href="https://docs.openclaw.ai"
          colorClass={LINK_COLORS[2]}
        />
        <QuickLink
          icon={Users}
          title="Join the Community"
          description="Get help on Discord"
          href="https://discord.gg/openclaw"
          colorClass={LINK_COLORS[3]}
        />
      </div>

      {/* Start over */}
      <div className="text-center">
        <button
          onClick={resetWizard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-white/[0.04] transition-all text-[13px]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start Over
        </button>
      </div>
    </StepContainer>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-brand-muted/60 text-[11px]">{label}</span>
      <span className="text-brand-text font-medium truncate">{value}</span>
    </div>
  );
}

function QuickLink({
  icon: Icon,
  title,
  description,
  href,
  colorClass,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  colorClass: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 rounded-xl border border-brand-border/40 bg-brand-surface/30 hover:bg-brand-elevated/50 hover:border-brand-border/60 hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-[13px] font-medium text-brand-text">{title}</h3>
        <p className="text-[11px] text-brand-muted/70 mt-0.5">{description}</p>
      </div>
    </a>
  );
}
