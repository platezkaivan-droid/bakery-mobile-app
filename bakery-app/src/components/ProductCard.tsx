import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';

interface Props {
  product: Product;
  variant?: 'small' | 'large';
}

export function ProductCard({ product, variant = 'small' }: Props) {
  const { addToCart } = useCart();
  const isLarge = variant === 'large';

  return (
    <TouchableOpacity style={[styles.card, isLarge && styles.cardLarge]}>
      <Image 
        source={{ uri: product.image_url }} 
        style={[styles.image, isLarge && styles.imageLarge]} 
      />
      {product.rating && (
        <View style={styles.rating}>
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Ionicons name="star" size={12} color={Colors.yellow} />
          <TouchableOpacity style={styles.heart}>
            <Ionicons name="heart-outline" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.priceTag}>
        <Text style={styles.price}>{product.price}руб</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(product)}>
        <Ionicons name="add" size={20} color={Colors.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 90,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
  },
  cardLarge: {
    width: '48%',
    height: 180,
    marginRight: 0,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  imageLarge: {
    height: '100%',
  },
  rating: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 2,
  },
  heart: {
    marginLeft: 8,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  price: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  addBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
