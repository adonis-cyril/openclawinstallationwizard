'use client';

import { useState } from 'react';
import StepContainer from '@/components/StepContainer';
import { useWizardStore } from '@/lib/store';
import { DollarSign, Shield, Lightbulb, PlusCircle } from 'lucide-react';

const TABS = [
  { id: 'tokens', label: 'Save Money', icon: DollarSign, color: 'bg-brand-success/15 text-brand-success' },
  { id: 'security', label: 'Security', icon: Shield, color: 'bg-brand-accent/15 text-brand-accent' },
  { id: 'workflow', label: 'Daily Tips', icon: Lightbulb, color: 'bg-brand-warning/15 text-brand-warning' },
  { id: 'more', label: 'Adding More', icon: PlusCircle, color: 'bg-brand-purple/15 text-brand-purple' },
];

const TAB_COLORS: Record<string, string> = Object.fromEntries(TABS.map((t) => [t.id, t.color]));

export default function BestPracticesStep() {
  const [activeTab, setActiveTab] = useState('tokens');
  const { nextStep } = useWizardStore();

  const activeTabColor = TAB_COLORS[activeTab];

  return (
    <StepContainer
      title="You're live! Here's how to get the most out of your assistant"
      subtitle="Take a minute to learn these best practices"
      nextLabel="Finish Setup"
      onNext={nextStep}
    >
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg bg-brand-elevated/50 mb-6">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all flex-1 justify-center
                ${isActive
                  ? 'bg-brand-surface text-brand-text shadow-sm'
                  : 'text-brand-muted hover:text-brand-text'
                }
              `}
            >
              <span className={`w-5 h-5 rounded flex items-center justify-center ${isActive ? tab.color : ''}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            <p className="text-[13px] text-brand-muted mb-4">
              Your assistant uses tokens (units of text) for every interaction.
              Here&apos;s how to keep costs low:
            </p>
            <Tip number={1} title="Use /new regularly" accentColor={activeTabColor}>
              Start fresh sessions to prevent context from growing too large.
              When context fills up, every message gets more expensive.
            </Tip>
            <Tip number={2} title="Use /compact" accentColor={activeTabColor}>
              If a session gets long, run /compact to summarize it and free up space.
            </Tip>
            <Tip number={3} title="Model switching" accentColor={activeTabColor}>
              Use <code>/model haiku</code> for simple questions and <code>/model sonnet</code> for
              complex tasks. Haiku costs 1/5th of Sonnet.
            </Tip>
            <Tip number={4} title="Monitor costs" accentColor={activeTabColor}>
              Run <code>/status</code> to see how many tokens your current session is using.
            </Tip>
            <Tip number={5} title="Heartbeat settings" accentColor={activeTabColor}>
              If you&apos;re not using your assistant 24/7, disable heartbeat during off-hours to save tokens.
            </Tip>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3">
            <Tip number={1} title="Use a dedicated phone number" accentColor={activeTabColor}>
              For WhatsApp, use a separate phone number (not your personal one). A prepaid SIM works great.
            </Tip>
            <Tip number={2} title="Never expose the Control UI" accentColor={activeTabColor}>
              Keep the Control UI on localhost only. Never expose it to the internet.
            </Tip>
            <Tip number={3} title="Review skills before installing" accentColor={activeTabColor}>
              Treat community skills from ClawHub like code — review them before installing.
            </Tip>
            <Tip number={4} title="Use strong models for sensitive tasks" accentColor={activeTabColor}>
              Weaker models are easier to trick with prompt injection. Use the strongest available model
              if your assistant handles sensitive information.
            </Tip>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-3">
            <Tip number={1} title="Set up a morning briefing" accentColor={activeTabColor}>
              Use the cron skill to schedule a daily summary of your calendar, weather, and tasks.
            </Tip>
            <Tip number={2} title="Check session health" accentColor={activeTabColor}>
              Run <code>/status</code> regularly to monitor your session&apos;s token usage.
            </Tip>
            <Tip number={3} title="Run diagnostics periodically" accentColor={activeTabColor}>
              Use <code>openclaw doctor</code> to catch configuration issues early.
            </Tip>
          </div>
        )}

        {activeTab === 'more' && (
          <div className="space-y-3">
            <Tip number={1} title="Add Google integration" accentColor={activeTabColor}>
              Run <code>openclaw configure --section web</code> to set up Google Workspace integration later.
            </Tip>
            <Tip number={2} title="Install new skills" accentColor={activeTabColor}>
              Browse ClawHub or run <code>openclaw skills install &lt;name&gt;</code> to add new capabilities.
            </Tip>
            <Tip number={3} title="Add new channels" accentColor={activeTabColor}>
              Run <code>openclaw onboard</code> again to add messaging channels. It won&apos;t wipe your existing setup.
            </Tip>
          </div>
        )}
      </div>
    </StepContainer>
  );
}

function Tip({ number, title, children, accentColor }: { number: number; title: string; children: React.ReactNode; accentColor?: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-brand-elevated/50 border border-brand-border/40 transition-colors hover:border-brand-border/60">
      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${accentColor || 'bg-brand-accent/20 text-brand-accent'}`}>
        {number}
      </span>
      <div>
        <h4 className="text-[13px] font-medium text-brand-text">{title}</h4>
        <p className="text-[13px] text-brand-muted mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
