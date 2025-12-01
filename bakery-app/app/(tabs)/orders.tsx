import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered';
  items: { name: string; qty: number; image: string }[];
}

const ORDERS: Order[] = [
  { 
    id: '1847', 
    date: '28 ноября, 14:30', 
    total: 847, 
    status: 'delivering',
    items: [
      { name: 'Круассан', qty: 2, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100' },
      { name: 'Эклер', qty: 1, image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=100' },
    ]
  },
  { 
    id: '1832', 
    date: '25 ноября, 10:15', 
    total: 1250, 
    status: 'delivered',
    items: [
      { name: 'Торт Наполеон', qty: 1, image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=100' },
    ]
  },
  { 
    id: '1819', 
    date: '20 ноября, 16:45', 
    total: 456, 
    status: 'delivered',
    items: [
      { name: 'Синнабон', qty: 3, image: 'https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=100' },
    ]
  },
];

const statusConfig = {
  pending: { text: 'Ожидает', color: Colors.yellow, icon: 'time-outline' as const },
  preparing: { text: 'Готовится', color: '#F59E0B', icon: 'restaurant-outline' as const },
  delivering: { text: 'В пути', color: Colors.accent, icon: 'bicycle-outline' as const },
  delivered: { text: 'Доставлен', color: Colors.green, icon: 'checkmark-circle-outline' as const },
};

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои заказы</Text>
        <Text style={styles.subtitle}>История покупок</Text>
      </View>

      {/* Active Order Banner */}
      {ORDERS.some(o => o.status === 'delivering') && (
        <TouchableOpacity 
          style={styles.activeBanner}
          onPress={() => router.push('/(tabs)/tracking')}
        >
          <View style={styles.activeIcon}>
            <Ionicons name="bicycle" size={24} color="#fff" />
          </View>
          <View style={styles.activeInfo}>
            <Text style={styles.activeTitle}>Заказ в пути!</Text>
            <Text style={styles.activeSubtitle}>Нажмите, чтобы отследить</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const status = statusConfig[item.status];
          return (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => item.status === 'delivering' && router.push('/(tabs)/tracking')}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>Заказ #{item.id}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                  <Ionicons name={status.icon} size={14} color={status.color} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                </View>
              </View>
              
              <View style={styles.itemsRow}>
                {item.items.map((orderItem, idx) => (
                  <View key={idx} style={styles.itemThumb}>
                    <Image source={{ uri: orderItem.image }} style={styles.itemImage} />
                    {orderItem.qty > 1 && (
                      <View style={styles.qtyBadge}>
                        <Text style={styles.qtyText}>×{orderItem.qty}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.total}>{item.total} ₽</Text>
                <TouchableOpacity style={styles.repeatBtn}>
                  <Ionicons name="refresh-outline" size={16} color={Colors.accent} />
                  <Text style={styles.repeatText}>Повторить</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  activeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeInfo: {
    flex: 1,
    marginLeft: 14,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  activeSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  itemsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  itemThumb: {
    position: 'relative',
    marginRight: 10,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  qtyBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qtyText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  repeatText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
