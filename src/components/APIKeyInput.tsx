'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, Loader2, X } from 'lucide-react';

interface APIKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  onValidate?: () => void;
  validationStatus?: 'idle' | 'validating' | 'valid' | 'invalid';
  validationError?: string;
}

export default function APIKeyInput({
  value,
  onChange,
  placeholder = 'Enter API key...',
  label = 'API Key',
  onValidate,
  validationStatus = 'idle',
  validationError,
}: APIKeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-brand-text">{label}</label>
      )}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-lg bg-brand-bg border border-brand-border text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent font-mono text-sm"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {onValidate && (
          <button
            onClick={onValidate}
            disabled={!value || validationStatus === 'validating'}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all
              ${!value || validationStatus === 'validating'
                ? 'bg-brand-border text-brand-muted cursor-not-allowed'
                : validationStatus === 'valid'
                  ? 'bg-brand-success/20 text-brand-success'
                  : 'bg-brand-accent hover:bg-brand-accent/90 text-white'
              }
            `}
          >
            {validationStatus === 'validating' && <Loader2 className="w-4 h-4 animate-spin" />}
            {validationStatus === 'valid' && <Check className="w-4 h-4" />}
            {validationStatus === 'invalid' && <X className="w-4 h-4" />}
            {validationStatus === 'validating' ? 'Testing...' : validationStatus === 'valid' ? 'Valid' : 'Test Connection'}
          </button>
        )}
      </div>
      {validationStatus === 'valid' && (
        <p className="text-xs text-brand-success flex items-center gap-1">
          <Check className="w-3 h-3" /> API key validated successfully
        </p>
      )}
      {validationStatus === 'invalid' && validationError && (
        <p className="text-xs text-brand-error">{validationError}</p>
      )}
      <p className="text-xs text-brand-muted">
        Your API key stays on your machine. It&apos;s never sent anywhere except directly to the AI provider.
      </p>
    </div>
  );
}
