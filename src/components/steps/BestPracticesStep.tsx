'use client';

import { useState } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { DollarSign, Shield, Lightbulb, PlusCircle } from 'lucide-react';

const TABS = [
  { id: 'tokens', label: 'Save Money', icon: DollarSign },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'workflow', label: 'Daily Tips', icon: Lightbulb },
  { id: 'more', label: 'Adding More', icon: PlusCircle },
];

export default function BestPracticesStep() {
  const [activeTab, setActiveTab] = useState('tokens');
  const { nextStep } = useWizardStore();

  return (
    <StepContainer
      title="You're live! Here's how to get the most out of your assistant"
      subtitle="Take a minute to learn these best practices"
      nextLabel="Finish Setup"
      onNext={nextStep}
    >
      {/* Tab bar */}
      <div className="flex border-b border-brand-border mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px
                ${activeTab === tab.id
                  ? 'border-brand-accent text-brand-accent'
                  : 'border-transparent text-brand-muted hover:text-brand-text'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-slide-up">
        {activeTab === 'tokens' && (
          <div className="space-y-4">
            <p className="text-sm text-brand-muted mb-4">
              Your assistant uses tokens (units of text) for every interaction.
              Here&apos;s how to keep costs low:
            </p>
            <Tip number={1} title="Use /new regularly">
              Start fresh sessions to prevent context from growing too large.
              When context fills up, every message gets more expensive.
            </Tip>
            <Tip number={2} title="Use /compact">
              If a session gets long, run /compact to summarize it and free up space.
            </Tip>
            <Tip number={3} title="Model switching">
              Use <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">/model haiku</code> for
              simple questions and <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">/model sonnet</code> for
              complex tasks. Haiku costs 1/5th of Sonnet.
            </Tip>
            <Tip number={4} title="Monitor costs">
              Run <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">/status</code> to
              see how many tokens your current session is using.
            </Tip>
            <Tip number={5} title="Heartbeat settings">
              If you&apos;re not using your assistant 24/7, disable heartbeat during off-hours to save tokens.
            </Tip>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <Tip number={1} title="Use a dedicated phone number">
              For WhatsApp, use a separate phone number (not your personal one). A prepaid SIM works great.
            </Tip>
            <Tip number={2} title="Never expose the Control UI">
              Keep the Control UI on localhost only. Never expose it to the internet.
            </Tip>
            <Tip number={3} title="Review skills before installing">
              Treat community skills from ClawHub like code — review them before installing.
            </Tip>
            <Tip number={4} title="Use strong models for sensitive tasks">
              Weaker models are easier to trick with prompt injection. Use the strongest available model
              if your assistant handles sensitive information.
            </Tip>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <Tip number={1} title="Set up a morning briefing">
              Use the cron skill to schedule a daily summary of your calendar, weather, and tasks.
            </Tip>
            <Tip number={2} title="Check session health">
              Run <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">/status</code> regularly
              to monitor your session&apos;s token usage.
            </Tip>
            <Tip number={3} title="Run diagnostics periodically">
              Use <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">openclaw doctor</code> to
              catch configuration issues early.
            </Tip>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="space-y-4">
            <Tip number={1} title="Add Google integration">
              Run <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">openclaw configure --section web</code> to
              set up Google Workspace integration later.
            </Tip>
            <Tip number={2} title="Install new skills">
              Browse ClawHub or run <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">openclaw skills install &lt;name&gt;</code> to
              add new capabilities.
            </Tip>
            <Tip number={3} title="Add new channels">
              Run <code className="px-1.5 py-0.5 bg-brand-bg rounded text-brand-accent text-xs">openclaw onboard</code> again
              to add messaging channels. It won&apos;t wipe your existing setup.
            </Tip>
          </div>
        )}
      </div>
    </StepContainer>
  );
}

function Tip({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-brand-surface border border-brand-border">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-xs font-bold">
        {number}
      </span>
      <div>
        <h4 className="text-sm font-medium text-brand-text">{title}</h4>
        <p className="text-sm text-brand-muted mt-1">{children}</p>
      </div>
    </div>
  );
}
