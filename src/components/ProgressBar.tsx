'use client';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({ progress, label, showPercentage = true }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between text-[12px]">
          {label && <span className="text-brand-muted/70">{label}</span>}
          {showPercentage && <span className="text-brand-muted/70">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className="h-2.5 bg-brand-border/50 rounded-full overflow-hidden">
        <div
          className="relative h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-purple transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer effect on leading edge */}
          {clampedProgress > 0 && clampedProgress < 100 && (
            <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
          )}
        </div>
      </div>
    </div>
  );
}
