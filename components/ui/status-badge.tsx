import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils/format';
import { THAI_LABELS } from '@/lib/constants/thai-labels';
import { Icons } from '@/lib/utils/icons';

export type StatusType = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'issued'
  | 'cancelled'
  | 'draft';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  defaultIcon: ReactNode;
}> = {
  pending: {
    label: THAI_LABELS.pending,
    colorClass: 'text-yellow-700',
    bgClass: ' dark:bg-yellow-900/20',
    borderClass: 'border-yellow-200 dark:border-yellow-800',
    defaultIcon: <Icons.Clock className="w-full h-full" aria-hidden={true} />,
  },
  approved: {
    label: THAI_LABELS.approved,
    colorClass: 'text-green-700',
    bgClass: 'dark:bg-green-900/20',
    borderClass: 'border-green-200 dark:border-green-800',
    defaultIcon: <Icons.CheckCircle className="w-full h-full" aria-hidden={true} />,
  },
  rejected: {
    label: THAI_LABELS.rejected,
    colorClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    borderClass: 'border-red-200 dark:border-red-800',
    defaultIcon: <Icons.XCircle className="w-full h-full" aria-hidden={true} />,
  },
  issued: {
    label: THAI_LABELS.issued,
    colorClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    borderClass: 'border-blue-200 dark:border-blue-800',
    defaultIcon: <Icons.Check className="w-full h-full" aria-hidden={true} />,
  },
  cancelled: {
    label: THAI_LABELS.cancel,
    colorClass: 'text-gray-700 dark:text-gray-300',
    bgClass: 'bg-gray-50 dark:bg-gray-900/20',
    borderClass: 'border-gray-200 dark:border-gray-800',
    defaultIcon: <Icons.Close className="w-full h-full" aria-hidden={true} />,
  },
  draft: {
    label: THAI_LABELS.draft,
    colorClass: 'text-gray-600 ',
    bgClass: ' dark:bg-gray-800/50',
    borderClass: 'border-gray-300 dark:border-gray-700',
    defaultIcon: <Icons.Edit className="w-full h-full" aria-hidden={true} />,
  },
};

const sizeConfig = {
  sm: {
    container: 'px-2 py-0.5 text-xs gap-1',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'px-2.5 py-1 text-sm gap-1.5',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'px-3 py-1.5 text-base gap-2',
    icon: 'w-5 h-5',
  },
};

export const StatusBadge = memo(function StatusBadge({ 
  status, 
  size = 'md', 
  icon,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  
  const displayIcon = icon !== undefined ? icon : config.defaultIcon;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        config.colorClass,
        config.bgClass,
        config.borderClass,
        sizeStyles.container,
        "cursor-pointer whitespace-nowrap min-w-[64px]"
        // className
      )}
      role="status"
      aria-label={config.label}
    >
      {displayIcon && (
        <span className={sizeStyles.icon} aria-hidden="true" >
          {displayIcon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
});
