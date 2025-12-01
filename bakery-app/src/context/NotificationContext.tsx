import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification, clearAll }}>
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
      case 'success': return Colors.green;
      case 'error': return Colors.red;
      case 'warning': return Colors.yellow;
      case 'info': return Colors.blue;
      default: return Colors.primary;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return `${Colors.green}15`;
      case 'error': return `${Colors.red}15`;
      case 'warning': return `${Colors.yellow}15`;
      case 'info': return `${Colors.blue}15`;
      default: return `${Colors.primary}15`;
    }
  };

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
        <Ionicons name="close" size={20} color={Colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  notification: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
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
    color: Colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
