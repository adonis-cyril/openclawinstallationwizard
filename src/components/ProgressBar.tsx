'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-brand-muted">{label}</span>}
          {showPercentage && <span className="text-brand-muted">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="h-2 bg-brand-border rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
