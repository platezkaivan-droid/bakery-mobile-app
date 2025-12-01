import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';

const CATEGORIES = [
  { id: '1', name: 'Выпечка', icon: '🥐', count: 24, color: '#FFE4C4', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200' },
  { id: '2', name: 'Торты', icon: '🎂', count: 12, color: '#FFD1DC', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200' },
  { id: '3', name: 'Печенье', icon: '🍪', count: 18, color: '#DEB887', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200' },
  { id: '4', name: 'Хлеб', icon: '🍞', count: 8, color: '#F5DEB3', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=200' },
  { id: '5', name: 'Пирожные', icon: '🧁', count: 15, color: '#E6E6FA', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=200' },
  { id: '6', name: 'Напитки', icon: '☕', count: 10, color: '#D2B48C', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200' },
  { id: '7', name: 'Десерты', icon: '🍰', count: 20, color: '#FFDAB9', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200' },
  { id: '8', name: 'Завтраки', icon: '🥞', count: 6, color: '#FFE4B5', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200' },
];

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Категории</Text>
        <Text style={styles.subtitle}>Выберите что вам по душе</Text>
      </View>
      
      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { backgroundColor: item.color }]}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardOverlay}>
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.count}>{item.count} товаров</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.arrowBtn}>
              <Ionicons name="arrow-forward" size={18} color={Colors.text} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
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
  grid: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    height: 180,
    borderRadius: 24,
    marginHorizontal: 6,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.3,
  },
  cardOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  name: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  count: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  arrowBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
