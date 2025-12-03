import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNotification } from '../src/context/NotificationContext';
import { useSettings } from '../src/context/SettingsContext';

// Локальные изображения
const IMAGES = {
  croissant: require('../assets/products/круассан с шоколадом.jpg'),
  tart: require('../assets/products/тарт с яголами.jpg'),
  cinnabon: require('../assets/products/синнабон классический.jpg'),
  macarons: require('../assets/products/макаранос ассорти.jpg'),
  cheesecake: require('../assets/products/чизкейк нбю йорк.jpg'),
};

type NotificationType = 'order' | 'promo' | 'delivery' | 'bonus' | 'system';

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useSettings();
  const { 
    storedNotifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteStoredNotification 
  } = useNotification();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'order': return 'receipt';
      case 'promo': return 'pricetag';
      case 'delivery': return 'bicycle';
      case 'bonus': return 'gift';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'order': return colors.blue;
      case 'promo': return colors.red;
      case 'delivery': return colors.green;
      case 'bonus': return colors.yellow;
      case 'system': return colors.textMuted;
      default: return colors.primary;
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
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
        {storedNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
            <Text style={styles.emptyText}>Здесь будут появляться ваши уведомления</Text>
          </View>
        ) : (
          <View style={styles.notificationsList}>
            {storedNotifications.map((notification: any) => (
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
                  onPress={() => deleteStoredNotification(notification.id)}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
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

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Header
  header: { height: 64, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 16, elevation: 4 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  unreadBadge: { backgroundColor: colors.red, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  unreadBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  markAllText: { fontSize: 14, color: colors.primary, fontWeight: '500' },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 80 },
  emptyIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted, textAlign: 'center' },

  // Notifications List
  notificationsList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  notificationCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 16, elevation: 4 },
  notificationUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  unreadDot: { position: 'absolute', top: 16, left: 16, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notificationContent: { flex: 1 },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notificationTitle: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: 8 },
  notificationTime: { fontSize: 12, color: colors.textMuted },
  notificationMessage: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  notificationImage: { width: '100%', height: 120, borderRadius: 12, marginTop: 12, backgroundColor: colors.background },
  deleteButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
