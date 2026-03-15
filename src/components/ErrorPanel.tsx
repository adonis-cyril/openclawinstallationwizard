'use client';

import { AlertTriangle, RefreshCw, SkipForward, ExternalLink } from 'lucide-react';

interface ErrorPanelProps {
  title: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  onSkip?: () => void;
  showTerminal?: boolean;
  onShowTerminal?: () => void;
}

export default function ErrorPanel({
  title,
  message,
  suggestion,
  onRetry,
  onSkip,
  showTerminal,
  onShowTerminal,
}: ErrorPanelProps) {
  return (
    <div className="rounded-xl border-2 border-brand-error/30 bg-brand-error/5 p-5 animate-slide-up">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-brand-error flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-brand-error">{title}</h3>
          <p className="text-sm text-brand-muted mt-1">{message}</p>
          {suggestion && (
            <p className="text-sm text-brand-text mt-2">{suggestion}</p>
          )}

          <div className="flex items-center gap-3 mt-4">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-error/20 hover:bg-brand-error/30 text-brand-error text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-brand-muted text-sm transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip This Step
              </button>
            )}
            {onShowTerminal && (
              <button
                onClick={onShowTerminal}
                className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-brand-muted text-sm transition-colors"
              >
                View Terminal Output
              </button>
            )}
            <a
              href="https://discord.gg/openclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-brand-muted text-sm transition-colors ml-auto"
            >
              <ExternalLink className="w-4 h-4" />
              Get Help
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
