import { Badge } from '@/components/ui/badge';
import { ScoreLabel } from '@/types';
import { cn } from '@/lib/utils';

interface ScoreChipProps {
  score: number;
  label: ScoreLabel;
  pendingCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function ScoreChip({ score, label, pendingCount = 0, size = 'md', showCount = true }: ScoreChipProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const colorClasses = {
    Green: 'bg-score-green text-white border-score-green',
    Yellow: 'bg-score-yellow text-score-yellow-foreground border-score-yellow',
    Red: 'bg-score-red text-white border-score-red',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold border-2 transition-medical',
        sizeClasses[size],
        colorClasses[label]
      )}
    >
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-current opacity-80" />
        {label}
        {showCount && pendingCount > 0 && (
          <span className="ml-1 text-xs opacity-90">
            ({pendingCount})
          </span>
        )}
      </span>
    </Badge>
  );
}