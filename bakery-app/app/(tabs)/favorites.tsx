import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useCart } from '../../src/context/CartContext';

interface FavoriteItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
}

const INITIAL_FAVORITES: FavoriteItem[] = [
  { id: '1', name: 'Круассан с шоколадом', description: 'Нежное слоёное тесто', price: 189, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', rating: 4.9 },
  { id: '2', name: 'Эклер ванильный', description: 'Классический эклер', price: 159, image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400', rating: 4.8 },
  { id: '3', name: 'Тирамису', description: 'Итальянский десерт', price: 329, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', rating: 4.9 },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(INITIAL_FAVORITES);
  const { addToCart } = useCart();

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const handleAddToCart = (item: FavoriteItem) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image,
      category_id: '1',
      rating: item.rating,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Избранное</Text>
        <Text style={styles.subtitle}>{favorites.length} товаров</Text>
      </View>
      
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Пока пусто</Text>
          <Text style={styles.emptyText}>Добавляйте товары в избранное,{'\n'}чтобы не потерять их</Text>
          <TouchableOpacity style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Перейти в каталог</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={Colors.yellow} />
                  <Text style={styles.rating}>{item.rating}</Text>
                </View>
                <Text style={styles.price}>{item.price} ₽</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity 
                  style={styles.heartBtn}
                  onPress={() => removeFavorite(item.id)}
                >
                  <Ionicons name="heart" size={22} color={Colors.red} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addBtn}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="cart-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 24,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
    marginTop: 6,
  },
  actions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  heartBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
