import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';

// Локальные изображения
const IMAGES = {
  croissant: require('../assets/products/круассан с шоколадом.jpg'),
  tart: require('../assets/products/тарт с яголами.jpg'),
  cinnabon: require('../assets/products/синнабон классический.jpg'),
  macarons: require('../assets/products/макаранос ассорти.jpg'),
  cheesecake: require('../assets/products/чизкейк нбю йорк.jpg'),
};

interface Notification {
  id: string;
  type: 'order' | 'promo' | 'delivery' | 'bonus' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  image?: any;
}

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'delivery',
    title: 'Заказ доставлен! 🎉',
    message: 'Ваш заказ #24891 успешно доставлен. Приятного аппетита!',
    time: '5 мин назад',
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Скидка 20% на круассаны!',
    message: 'Только сегодня! Используйте промокод CROISSANT20',
    time: '1 час назад',
    read: false,
    image: IMAGES.croissant,
  },
  {
    id: '3',
    type: 'bonus',
    title: 'Начислено 150 бонусов 🎁',
    message: 'За ваш последний заказ начислено 150 бонусных баллов',
    time: '2 часа назад',
    read: true,
  },
  {
    id: '4',
    type: 'order',
    title: 'Заказ готовится 👨‍🍳',
    message: 'Ваш заказ #24892 принят и уже готовится',
    time: '3 часа назад',
    read: true,
  },
  {
    id: '5',
    type: 'promo',
    title: 'Новинка! Тарт с ягодами 🍓',
    message: 'Попробуйте наш новый тарт со свежими ягодами',
    time: 'Вчера',
    read: true,
    image: IMAGES.tart,
  },
  {
    id: '6',
    type: 'promo',
    title: 'Синнабоны по акции! 🔥',
    message: 'Купите 2 синнабона и получите 3-й в подарок',
    time: 'Вчера',
    read: true,
    image: IMAGES.cinnabon,
  },
  {
    id: '7',
    type: 'bonus',
    title: 'Двойные бонусы! ⭐',
    message: 'Сегодня начисляем x2 бонусов за все заказы',
    time: '2 дня назад',
    read: true,
  },
  {
    id: '8',
    type: 'promo',
    title: 'Макаронс со скидкой 15%',
    message: 'Набор из 6 макаронс по специальной цене',
    time: '2 дня назад',
    read: true,
    image: IMAGES.macarons,
  },
  {
    id: '9',
    type: 'system',
    title: 'Обновление приложения',
    message: 'Доступна новая версия с улучшенным дизайном',
    time: '3 дня назад',
    read: true,
  },
  {
    id: '10',
    type: 'promo',
    title: 'Чизкейк дня! 🧀',
    message: 'Нью-Йорк чизкейк — хит продаж этой недели',
    time: '4 дня назад',
    read: true,
    image: IMAGES.cheesecake,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order': return 'receipt';
      case 'promo': return 'pricetag';
      case 'delivery': return 'bicycle';
      case 'bonus': return 'gift';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'order': return Colors.blue;
      case 'promo': return Colors.red;
      case 'delivery': return Colors.green;
      case 'bonus': return Colors.yellow;
      case 'system': return Colors.textMuted;
      default: return Colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Уведомления</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Прочитать все</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={64} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
            <Text style={styles.emptyText}>Здесь будут появляться ваши уведомления</Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={[styles.notificationCard, !notification.read && styles.notificationUnread]}
                onPress={() => markAsRead(notification.id)}
                activeOpacity={0.8}
              >
                {!notification.read && <View style={styles.unreadDot} />}
                
                <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(notification.type)}15` }]}>
                  <Ionicons name={getIcon(notification.type)} size={24} color={getIconColor(notification.type)} />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  
                  {notification.image && (
                    <Image source={notification.image} style={styles.notificationImage} resizeMode="cover" />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteNotification(notification.id)}
                >
                  <Ionicons name="close" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: { height: 64, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  unreadBadge: { backgroundColor: Colors.red, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  unreadBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  markAllText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 80 },
  emptyIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted, textAlign: 'center' },

  // Notifications List
  notificationsList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  notificationCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  notificationUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  unreadDot: { position: 'absolute', top: 16, left: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: Colors.text, flex: 1, marginRight: 8 },
  notificationTime: { fontSize: 12, color: Colors.textMuted },
  notificationMessage: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  notificationImage: { width: '100%', height: 120, borderRadius: 12, marginTop: 12, backgroundColor: Colors.background },
  deleteButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
