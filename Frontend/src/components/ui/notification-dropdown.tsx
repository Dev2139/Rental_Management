import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationDropdown: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications 
  } = useNotification();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // If the notification has an action URL, navigate to it
    if (notification.actionUrl) {
      // In a real app, you'd use a router here
      console.log(`Navigating to: ${notification.actionUrl}`);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="w-80 bg-card border border-border rounded-xl shadow-lg z-50">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notifications</CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="h-8 gap-1"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="h-8 text-red-500 hover:text-red-700"
                aria-label="Clear all notifications"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="text-sm text-muted-foreground">
              {unreadCount} unread
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      !notification.read ? 'bg-accent/50' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="h-5 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-6 w-6 p-0"
                            aria-label="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <div className="mt-2">
                        <Link 
                          to={notification.actionUrl} 
                          className="text-primary text-sm font-medium hover:underline inline-flex items-center gap-1"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          View details
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationDropdown;