import React from 'react';
import { Button } from './button';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'ghost';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count = 0,
  onClick,
  className,
  variant = 'ghost'
}) => {
  return (
    <Button
      variant={variant}
      size="icon"
      className={cn("relative", className)}
      onClick={onClick}
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
};

export default NotificationBadge;