'use client';

import { useEffect } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { getAPI } from '@/lib/electron';
import { PROVIDERS } from '@/data/providers';
import { SKILLS } from '@/data/skills';
import { HOOKS } from '@/data/hooks';
import { CHANNELS } from '@/data/channels';
import { PartyPopper, ExternalLink, MessageSquare, BookOpen, Users, RotateCcw } from 'lucide-react';

const LINK_COLORS = [
  'bg-brand-accent/10 text-brand-accent',
  'bg-brand-success/10 text-brand-success',
  'bg-brand-warning/10 text-brand-warning',
  'bg-brand-muted/10 text-brand-muted',
];

export default function CompletionStep() {
  const {
    selectedProvider, selectedModel, selectedSkills,
    selectedHooks, selectedChannels, gatewayToken, setGatewayToken, resetWizard,
  } = useWizardStore();

  // Fetch gateway token on mount if not already available
  useEffect(() => {
    if (!gatewayToken) {
      const api = getAPI();
      api.getGatewayToken().then((result) => {
        if (result.token) setGatewayToken(result.token);
      }).catch(() => { /* best effort */ });
    }
  }, [gatewayToken, setGatewayToken]);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);
  const model = provider?.models.find((m) => m.id === selectedModel);
  const activeChannelEntries = Object.entries(selectedChannels).filter(([, c]) => c.enabled);
  const activeChannels = activeChannelEntries.map(([id]) => CHANNELS.find((c) => c.id === id)?.name || id);

  // Build tokenized dashboard URL
  const dashboardUrl = gatewayToken
    ? `http://localhost:18789?token=${encodeURIComponent(gatewayToken)}`
    : 'http://localhost:18789';

  // Determine test message guidance based on selected channels
  const firstChannel = activeChannelEntries[0]?.[0];
  const testMessageInfo = getTestMessageInfo(firstChannel, dashboardUrl);

  return (
    <StepContainer
      title=""
      showBack={false}
      showNext={false}
    >
      {/* Success hero */}
      <div className="text-center mt-8 mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-success/10 mb-6">
          <PartyPopper className="w-10 h-10 text-brand-success" />
        </div>
        <h1 className="text-4xl font-serif font-semibold text-brand-text tracking-tight mb-3">
          Your assistant is ready!
        </h1>
        <p className="text-[15px] text-brand-muted">
          Everything has been configured and your assistant is running.
        </p>
      </div>

      {/* Config summary */}
      <div className="relative rounded-xl border border-brand-border bg-brand-surface p-6 mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-accent" />
        <h3 className="text-[11px] font-medium text-brand-muted uppercase tracking-wider mb-4">
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
          href={dashboardUrl}
          colorClass={LINK_COLORS[0]}
        />
        <QuickLink
          icon={MessageSquare}
          title={testMessageInfo.title}
          description={testMessageInfo.description}
          href={testMessageInfo.href}
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-all text-[13px]"
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
      <span className="text-brand-muted text-[11px]">{label}</span>
      <span className="text-brand-text font-medium truncate">{value}</span>
    </div>
  );
}

function getTestMessageInfo(channelId: string | undefined, dashboardUrl: string) {
  switch (channelId) {
    case 'telegram':
      return {
        title: 'Open Telegram',
        description: 'Find your bot in Telegram and send a message',
        href: 'https://telegram.org',
      };
    case 'whatsapp':
      return {
        title: 'Open WhatsApp',
        description: 'Your assistant is linked — send it a message',
        href: 'https://web.whatsapp.com',
      };
    case 'discord':
      return {
        title: 'Open Discord',
        description: 'Message your bot in your Discord server',
        href: 'https://discord.com/app',
      };
    case 'webchat':
      return {
        title: 'Open Web Chat',
        description: 'Chat with your assistant in the dashboard',
        href: dashboardUrl,
      };
    default:
      return {
        title: 'Open Web Chat',
        description: 'Chat with your assistant in the dashboard',
        href: dashboardUrl,
      };
  }
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
      className="flex items-start gap-3 p-4 rounded-xl border border-brand-border bg-brand-surface hover:border-brand-muted-light hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="text-[13px] font-medium text-brand-text">{title}</h3>
        <p className="text-[11px] text-brand-muted mt-0.5">{description}</p>
      </div>
    </a>
  );
}
