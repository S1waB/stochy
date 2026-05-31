import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as notificationApi from '../api/notification.api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationApi.getNotifications({ isRead: false, size: 10 });
      setNotifications(res.data.content || []);
      setUnreadCount(res.data.totalElements || 0);
    } catch (err) { console.error(err); }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
