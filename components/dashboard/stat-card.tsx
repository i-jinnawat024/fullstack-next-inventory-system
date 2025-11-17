import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils/format';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
  loading?: boolean;
  className?: string;
}

export const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'var(--color-primary)',
  loading = false,
  className,
}: StatCardProps) {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('th-TH');
    }
    return val;
  };

  const getTrendColor = (direction: 'up' | 'down'): string => {
    return direction === 'up' ? 'var(--color-success)' : 'var(--color-error)';
  };

  const getTrendIcon = (direction: 'up' | 'down'): string => {
    return direction === 'up' ? '↑' : '↓';
  };

  return (
    <div
      className={cn(
        'p-6 rounded-lg transition-all duration-200',
        'hover:shadow-md',
        className
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Icon and Value Row */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-lg"
          style={{
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          <span className="text-2xl">{icon}</span>
        </div>
        
        <div className="text-right">
          <div
            className="text-3xl font-bold leading-none"
            style={{ color: color }}
          >
            {formatValue(value)}
          </div>
          
          {trend && (
            <div
              className="flex items-center justify-end gap-1 mt-2 text-sm font-medium"
              style={{ color: getTrendColor(trend.direction) }}
            >
              <span className="text-lg leading-none">
                {getTrendIcon(trend.direction)}
              </span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-sm font-medium"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {title}
      </h3>
    </div>
  );
});

export const StatCardSkeleton = memo(function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('p-6 rounded-lg', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-lg" />
        <div className="text-right space-y-2">
          <Skeleton variant="text" width={80} height={36} />
          <Skeleton variant="text" width={60} height={20} />
        </div>
      </div>
      <Skeleton variant="text" width={120} height={16} />
    </div>
  );
});
