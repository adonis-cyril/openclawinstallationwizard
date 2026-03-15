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
  columns = 2,
}: CardSelectorProps) {
  return (
    <div className={`grid gap-3 ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        const Icon = iconMap[option.icon] || Lightbulb;

        return (
          <button
            key={option.id}
            onClick={() => onToggle(option.id)}
            className={`group relative text-left p-4 rounded-xl border transition-all duration-200
              ${isSelected
                ? 'border-brand-accent bg-brand-surface shadow-card-hover'
                : 'border-brand-border bg-brand-surface hover:border-brand-muted-light hover:shadow-card'
              }
            `}
          >
            {/* Badge */}
            {option.badge && (
              <span className={`absolute top-3 right-3 text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wide uppercase
                ${option.badge === 'Required'
                  ? 'bg-brand-error/10 text-brand-error'
                  : option.badge === 'Recommended'
                    ? 'bg-brand-accent/10 text-brand-accent'
                    : 'bg-brand-bg text-brand-muted'
                }
              `}>
                {option.badge}
              </span>
            )}

            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200
                ${isSelected
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'bg-brand-bg text-brand-muted group-hover:text-brand-text'
                }
              `}>
                <Icon className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <h3 className={`text-[13px] font-medium ${isSelected ? 'text-brand-text' : 'text-brand-text/90'}`}>
                  {option.name}
                </h3>
                <p className="text-[12px] text-brand-muted mt-0.5 leading-relaxed">{option.description}</p>
                {option.example && (
                  <p className="text-[11px] text-brand-muted-light mt-2 italic leading-relaxed">
                    &ldquo;{option.example}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Selection indicator — accent bottom line */}
            {isSelected && (
              <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-brand-accent" />
            )}
          </button>
        );
      })}
    </div>
  );
}
