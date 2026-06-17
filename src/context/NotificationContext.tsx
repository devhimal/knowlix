import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'approval' | 'feedback' | 'upload' | 'message' | 'system' | 'subscription';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  resourceId?: string;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }
    setNotifications(data || []);
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (user) {
      console.log('Subscribing to notifications for user:', user.id);
      const channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, (payload) => {
          console.log('New notification received:', payload);
          setNotifications(prev => [payload.new as Notification, ...prev]);
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
        console.log('Unsubscribed from notifications');
      };
    }
  }, [user, fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    if (!user) return;

    // Map camelCase to snake_case for the database
    const dbPayload = {
      user_id: user.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      resource_id: notification.resourceId,
      link: notification.link
    };

    const { data, error } = await supabase
      .from('notifications')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('Error adding notification:', JSON.stringify(error, null, 2));
      return;
    }
    setNotifications(prev => [data as Notification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking as read:', error);
      return;
    }

    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }

    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
