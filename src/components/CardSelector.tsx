'use client';

import {
  MessageCircle, Calendar, Users, Code, PenTool, Home,
  Brain, Send, Hash, Globe, Wrench, Zap, Server,
  Lightbulb, BookOpen, Download, Monitor, Rocket, Check,
  MessageSquare, PartyPopper, Search, FileText, Wand2,
  Github, Chrome, Database, Clock,
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  MessageCircle, Calendar, Users, Code, PenTool, Home,
  Brain, Send, Hash, Globe, Wrench, Zap, Server,
  Lightbulb, BookOpen, Download, Monitor, Rocket, Check,
  MessageSquare, PartyPopper, Search, FileText, Wand2,
  Github, Chrome, Database, Clock,
};

export interface CardOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  example?: string;
  badge?: 'Required' | 'Recommended' | 'Optional' | string;
  extra?: string;
}

interface CardSelectorProps {
  options: CardOption[];
  selected: string[];
  onToggle: (id: string) => void;
  multiSelect?: boolean;
  columns?: 2 | 3;
}

export default function CardSelector({
  options,
  selected,
  onToggle,
  multiSelect = true,
  columns = 2,
}: CardSelectorProps) {
  return (
    <div className={`grid gap-4 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const Icon = iconMap[option.icon] || Lightbulb;

        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`relative text-left p-5 rounded-xl border-2 transition-all
              ${isSelected
                ? 'border-brand-accent bg-brand-accent/5'
                : 'border-brand-border hover:border-brand-border/80 bg-brand-surface hover:bg-brand-surface/80'
              }
            `}
          >
            {/* Badge */}
            {option.badge && (
              <span className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium
                ${option.badge === 'Required'
                  ? 'bg-brand-error/20 text-brand-error'
                  : option.badge === 'Recommended'
                    ? 'bg-brand-accent/20 text-brand-accent'
                    : 'bg-brand-border text-brand-muted'
                }
              `}>
                {option.badge}
              </span>
            )}

            {/* Selection indicator */}
            {isSelected && (
              <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}

            <div className="flex items-start gap-3 mt-1">
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-accent/20' : 'bg-brand-border/50'}`}>
                <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-accent' : 'text-brand-muted'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-brand-text">{option.name}</h3>
                <p className="text-sm text-brand-muted mt-0.5">{option.description}</p>
                {option.example && (
                  <p className="text-xs text-brand-muted/70 mt-2 italic">
                    &ldquo;{option.example}&rdquo;
                  </p>
                )}
                {option.extra && (
                  <p className="text-xs text-brand-muted mt-1">{option.extra}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
