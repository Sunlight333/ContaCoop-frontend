import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'currency' | 'percentage' | 'number';
  icon?: LucideIcon;
  className?: string;
}

export function KPICard({
  label,
  value,
  previousValue,
  trend = 'stable',
  format = 'number',
  icon: Icon,
  className,
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          notation: val >= 1000000 ? 'compact' : 'standard',
        }).format(val);
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const calculateChange = () => {
    if (!previousValue || typeof value !== 'number' || typeof previousValue !== 'number') {
      return null;
    }
    const change = ((value - previousValue) / previousValue) * 100;
    return change.toFixed(1);
  };

  const change = calculateChange();

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card p-3 md:p-5 shadow-card',
        'transition-all duration-300 hover-lift',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{label}</p>
          <p className="font-heading text-lg md:text-2xl font-bold text-foreground truncate animate-count">
            {formatValue(value)}
          </p>
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-1.5 md:p-2.5 flex-shrink-0 transition-transform duration-300 hover:scale-110">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        )}
      </div>

      {change !== null && (
        <div className="mt-2 md:mt-3 flex items-center gap-1 md:gap-1.5 flex-wrap">
          <div
            className={cn(
              'flex items-center gap-0.5 rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium transition-all duration-300',
              trend === 'up' && 'bg-success/10 text-success',
              trend === 'down' && 'bg-destructive/10 text-destructive',
              trend === 'stable' && 'bg-muted text-muted-foreground'
            )}
          >
            <TrendIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
            <span>{Math.abs(Number(change))}%</span>
          </div>
          <span className="text-[10px] md:text-xs text-muted-foreground">vs last</span>
        </div>
      )}

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 hover:from-primary/5 hover:to-transparent transition-all duration-500 pointer-events-none rounded-xl" />
    </div>
  );
}
