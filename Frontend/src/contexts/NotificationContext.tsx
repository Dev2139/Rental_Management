import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  userId?: string; // The user this notification is for
  actionUrl?: string; // Optional URL to navigate to when clicked
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
};

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotification = action.payload;
      const isDuplicate = state.notifications.some(n => n.id === newNotification.id);
      
      if (isDuplicate) return state;

      // Show toast notification
      switch (newNotification.type) {
        case 'success':
          toast.success(newNotification.title, { description: newNotification.message });
          break;
        case 'error':
          toast.error(newNotification.title, { description: newNotification.message });
          break;
        case 'warning':
          toast.warning(newNotification.title, { description: newNotification.message });
          break;
        default:
          toast.info(newNotification.title, { description: newNotification.message });
      }

      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        notifications: updatedNotifications,
        unreadCount: newNotification.read ? state.unreadCount : state.unreadCount + 1,
      };

    case 'MARK_AS_READ':
      const updatedNotifs = state.notifications.map(notification =>
        notification.id === action.payload ? { ...notification, read: true } : notification
      );
      return {
        notifications: updatedNotifs,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'MARK_ALL_AS_READ':
      return {
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };

    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      const remainingUnread = filteredNotifications.filter(n => !n.read).length;
      return {
        notifications: filteredNotifications,
        unreadCount: remainingUnread,
      };

    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        notifications: [],
        unreadCount: 0,
      };

    default:
      return state;
  }
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData,
      timestamp: new Date(),
      read: false,
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  const contextValue: NotificationContextType = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};