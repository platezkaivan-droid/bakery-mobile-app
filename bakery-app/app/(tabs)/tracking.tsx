import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';

const STEPS = [
  { id: 1, title: 'Заказ принят', time: '14:30', done: true },
  { id: 2, title: 'Готовится', time: '14:35', done: true },
  { id: 3, title: 'В пути', time: '14:50', done: true, active: true },
  { id: 4, title: 'Доставлен', time: '~15:10', done: false },
];

export default function TrackingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Отслеживание</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Ionicons name="help-circle-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Simplified map visualization */}
          <View style={styles.mapGrid}>
            <View style={styles.road} />
            <View style={styles.roadV} />
            
            {/* Destination marker */}
            <View style={[styles.marker, { left: '25%', top: '60%' }]}>
              <View style={styles.markerDot}>
                <Ionicons name="home" size={16} color="#fff" />
              </View>
              <Text style={styles.markerLabel}>Ваш адрес</Text>
            </View>
            
            {/* Courier */}
            <View style={[styles.courier, { left: '55%', top: '35%' }]}>
              <View style={styles.courierIcon}>
                <Text style={{ fontSize: 24 }}>🛵</Text>
              </View>
              <View style={styles.courierPulse} />
            </View>
            
            {/* Route line */}
            <View style={styles.routeLine} />
          </View>
        </View>
        
        {/* ETA Badge */}
        <View style={styles.etaBadge}>
          <Ionicons name="time-outline" size={18} color={Colors.accent} />
          <Text style={styles.etaText}>~20 мин</Text>
        </View>
      </View>

      {/* Courier Card */}
      <View style={styles.courierCard}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }}
          style={styles.courierPhoto}
        />
        <View style={styles.courierInfo}>
          <Text style={styles.courierName}>Алексей К.</Text>
          <View style={styles.courierRating}>
            <Ionicons name="star" size={14} color={Colors.yellow} />
            <Text style={styles.ratingText}>4.9</Text>
            <Text style={styles.deliveries}>• 234 доставки</Text>
          </View>
        </View>
        <View style={styles.courierActions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="call" size={20} color={Colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
            <Ionicons name="chatbubble" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Статус заказа</Text>
        {STEPS.map((step, index) => (
          <View key={step.id} style={styles.step}>
            <View style={styles.stepIndicator}>
              <View style={[
                styles.stepDot,
                step.done && styles.stepDotDone,
                step.active && styles.stepDotActive
              ]}>
                {step.done && !step.active && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
                {step.active && (
                  <View style={styles.activePulse} />
                )}
              </View>
              {index < STEPS.length - 1 && (
                <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, step.active && styles.stepTitleActive]}>
                {step.title}
              </Text>
              <Text style={styles.stepTime}>{step.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.summaryTitle}>Заказ #1847</Text>
        <Text style={styles.summaryItems}>2× Круассан, 1× Эклер</Text>
        <Text style={styles.summaryTotal}>847 ₽</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    marginHorizontal: 20,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8E4D9',
  },
  mapGrid: {
    flex: 1,
    position: 'relative',
  },
  road: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '45%',
    height: 24,
    backgroundColor: '#F5F5F0',
  },
  roadV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '40%',
    width: 24,
    backgroundColor: '#F5F5F0',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  courier: {
    position: 'absolute',
    alignItems: 'center',
  },
  courierIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  courierPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    opacity: 0.2,
  },
  routeLine: {
    position: 'absolute',
    left: '28%',
    top: '48%',
    width: '30%',
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    transform: [{ rotate: '-25deg' }],
  },
  etaBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 6,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  courierPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  courierInfo: {
    flex: 1,
    marginLeft: 14,
  },
  courierName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  courierRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  deliveries: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  courierActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.accent,
  },
  stepsContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    minHeight: 50,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.green,
  },
  stepDotActive: {
    backgroundColor: Colors.accent,
  },
  activePulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  stepLineDone: {
    backgroundColor: Colors.green,
  },
  stepContent: {
    flex: 1,
    marginLeft: 14,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  stepTitleActive: {
    color: Colors.accent,
  },
  stepTime: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  orderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryItems: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
  },
});
