import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useNotification } from '../../src/context/NotificationContext';

type StepStatus = 'completed' | 'active' | 'pending';

interface TimelineStep {
  id: string;
  label: string;
  time: string;
  status: StepStatus;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { id: '1', label: 'Заказ принят', time: '14:30', status: 'completed' },
  { id: '2', label: 'Готовится', time: '14:35', status: 'completed' },
  { id: '3', label: 'Готов к доставке', time: '15:00', status: 'completed' },
  { id: '4', label: 'В пути', time: '15:10', status: 'active' },
  { id: '5', label: 'Доставлен', time: '~15:25', status: 'pending' },
];

export default function TrackingScreen() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleCallCourier = () => {
    Linking.openURL('tel:+79991234567');
  };

  const handleMessageCourier = () => {
    showNotification({ title: 'Чат с курьером скоро будет доступен', type: 'info' });
  };

  const handleContactSupport = () => {
    showNotification({ title: 'Связываемся с поддержкой...', type: 'info' });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Отмена заказа',
      'Вы уверены, что хотите отменить заказ?',
      [
        { text: 'Нет', style: 'cancel' },
        { 
          text: 'Да, отменить', 
          style: 'destructive',
          onPress: () => {
            showNotification({ title: 'Заказ отменён', type: 'warning' });
            router.push('/(tabs)/orders');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Отслеживание заказа</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.mapGradient}
          >
            <Ionicons name="map" size={48} color={Colors.green} />
            <Text style={styles.mapText}>Карта доставки</Text>
          </LinearGradient>

          {/* Courier Card */}
          <View style={styles.courierCard}>
            <View style={styles.courierInfo}>
              <View style={styles.courierAvatarContainer}>
                <LinearGradient
                  colors={Colors.gradientOrange}
                  style={styles.courierAvatar}
                >
                  <Text style={styles.courierAvatarText}>А</Text>
                </LinearGradient>
                <View style={styles.onlineIndicator} />
              </View>

              <View style={styles.courierDetails}>
                <View style={styles.courierNameRow}>
                  <Text style={styles.courierName}>Алексей</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={Colors.yellow} />
                    <Text style={styles.ratingText}>4.9</Text>
                  </View>
                </View>
                <Text style={styles.courierCar}>Toyota Camry X123XX</Text>
              </View>

              <View style={styles.courierActions}>
                <TouchableOpacity style={styles.callButton} onPress={handleCallCourier}>
                  <Ionicons name="call" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton} onPress={handleMessageCourier}>
                  <Ionicons name="chatbubble-outline" size={18} color={Colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статус заказа</Text>
          <View style={styles.timeline}>
            {TIMELINE_STEPS.map((step, index) => (
              <View key={step.id} style={styles.timelineItem}>
                {/* Vertical Line */}
                {index < TIMELINE_STEPS.length - 1 && (
                  <View style={[
                    styles.timelineLine,
                    step.status === 'completed' && styles.timelineLineActive
                  ]} />
                )}

                {/* Status Icon */}
                <View style={styles.timelineIconContainer}>
                  {step.status === 'completed' && (
                    <View style={styles.timelineIconCompleted}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                  {step.status === 'active' && (
                    <View style={styles.timelineIconActiveContainer}>
                      <View style={styles.timelineIconActivePulse} />
                      <View style={styles.timelineIconActive}>
                        <View style={styles.timelineIconActiveDot} />
                      </View>
                    </View>
                  )}
                  {step.status === 'pending' && (
                    <View style={styles.timelineIconPending}>
                      <View style={styles.timelineIconPendingDot} />
                    </View>
                  )}
                </View>

                {/* Step Info */}
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    step.status === 'pending' && styles.timelineLabelPending
                  ]}>
                    {step.label}
                  </Text>
                  <Text style={[
                    styles.timelineTime,
                    step.status === 'active' && styles.timelineTimeActive
                  ]}>
                    {step.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            {/* Estimated Time */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Прибудет через</Text>
                <Text style={styles.infoValuePrimary}>15 минут</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Address */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color={Colors.text} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Адрес доставки</Text>
                <Text style={styles.infoValue}>ул. Ленина, 25, кв. 10</Text>
              </View>
            </View>

            {/* Comment */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="chatbox-outline" size={20} color={Colors.text} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Комментарий</Text>
                <Text style={styles.infoValue}>Домофон не работает, позвоните</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            {/* Order Number */}
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="receipt-outline" size={20} color={Colors.text} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Номер заказа</Text>
                <Text style={styles.infoValue}>#12345</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
          <Ionicons name="alert-circle-outline" size={20} color={Colors.text} />
          <Text style={styles.supportButtonText}>Связаться с поддержкой</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
          <Text style={styles.cancelButtonText}>Отменить заказ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    height: 64,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },

  scrollView: {
    flex: 1,
  },

  // Map Section
  mapContainer: {
    position: 'relative',
    height: 300,
  },
  mapGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.green,
  },

  // Courier Card
  courierCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courierAvatarContainer: {
    position: 'relative',
  },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  courierDetails: {
    flex: 1,
  },
  courierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.yellow}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.yellow,
  },
  courierCar: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  courierActions: {
    flexDirection: 'row',
    gap: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },

  // Timeline
  timeline: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  timelineItem: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  timelineLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
  },
  timelineLineActive: {
    backgroundColor: Colors.green,
  },
  timelineIconContainer: {
    position: 'relative',
    zIndex: 10,
  },
  timelineIconCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActiveContainer: {
    position: 'relative',
  },
  timelineIconActivePulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}30`,
  },
  timelineIconActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconActiveDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  timelineIconPending: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconPendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textMuted,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  timelineLabelPending: {
    color: Colors.textMuted,
  },
  timelineTime: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  timelineTimeActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  infoValuePrimary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },

  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    gap: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.red,
  },
});
