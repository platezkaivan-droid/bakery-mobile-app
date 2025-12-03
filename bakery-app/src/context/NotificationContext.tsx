import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from './SettingsContext';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface StoredNotification {
  id: string;
  type: 'order' | 'promo' | 'delivery' | 'bonus' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  storedNotifications: StoredNotification[];
  unreadCount: number;
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
  addStoredNotification: (notification: Omit<StoredNotification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteStoredNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [storedNotifications, setStoredNotifications] = useState<StoredNotification[]>([]);

  const unreadCount = storedNotifications.filter(n => !n.read).length;

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Автоматически скрыть через duration (по умолчанию 3 секунды)
    const duration = notification.duration || 3000;
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addStoredNotification = useCallback((notification: Omit<StoredNotification, 'id' | 'time' | 'read'>) => {
    const id = Date.now().toString();
    const now = new Date();
    const time = 'Только что';
    
    const newNotification: StoredNotification = {
      ...notification,
      id,
      time,
      read: false,
    };
    
    setStoredNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setStoredNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setStoredNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteStoredNotification = useCallback((id: string) => {
    setStoredNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      storedNotifications,
      unreadCount,
      showNotification, 
      hideNotification, 
      clearAll,
      addStoredNotification,
      markAsRead,
      markAllAsRead,
      deleteStoredNotification,
    }}>
      {children}
      <NotificationContainer notifications={notifications} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

// Компонент для отображения уведомлений
function NotificationContainer({ 
  notifications, 
  onHide 
}: { 
  notifications: Notification[]; 
  onHide: (id: string) => void;
}) {
  const { colors, isDark } = useSettings();
  const styles = createDynamicStyles(colors, isDark);
  
  if (notifications.length === 0) return null;

  return (
    <View style={styles.container}>
      {notifications.map((notification, index) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onHide={onHide}
          index={index}
        />
      ))}
    </View>
  );
}

function NotificationItem({ 
  notification, 
  onHide,
  index 
}: { 
  notification: Notification; 
  onHide: (id: string) => void;
  index: number;
}) {
  const { colors, isDark } = useSettings();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'success': return colors.green;
      case 'error': return colors.red;
      case 'warning': return colors.yellow;
      case 'info': return colors.blue;
      default: return colors.primary;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return `${colors.green}15`;
      case 'error': return `${colors.red}15`;
      case 'warning': return `${colors.yellow}15`;
      case 'info': return `${colors.blue}15`;
      default: return `${colors.primary}15`;
    }
  };

  const styles = createDynamicStyles(colors, isDark);

  return (
    <Animated.View 
      style={[
        styles.notification,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          marginTop: index > 0 ? 8 : 0,
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: getBgColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.message && (
          <Text style={styles.message}>{notification.message}</Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => onHide(notification.id)}
      >
        <Ionicons name="close" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const createDynamicStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notification: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: colors.textMuted,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
