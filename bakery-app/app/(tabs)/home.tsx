import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../src/constants/colors';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  isNew?: boolean;
  discount?: number;
}

const PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Круассан с шоколадом', 
    description: 'Нежное слоёное тесто с бельгийским шоколадом',
    price: 189, 
    oldPrice: 249,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', 
    rating: 4.9, 
    reviews: 128,
    category: 'Выпечка',
    discount: 24
  },
  { 
    id: '2', 
    name: 'Синнабон классический', 
    description: 'Пышная булочка с корицей и сливочным кремом',
    price: 215, 
    image: 'https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=400', 
    rating: 4.8, 
    reviews: 256,
    category: 'Выпечка',
    isNew: true
  },
  { 
    id: '3', 
    name: 'Эклер ванильный', 
    description: 'Классический эклер с ванильным кремом патисьер',
    price: 159, 
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400', 
    rating: 4.8, 
    reviews: 96,
    category: 'Пирожные'
  },
  { 
    id: '4', 
    name: 'Чизкейк Нью-Йорк', 
    description: 'Сливочный чизкейк по классическому рецепту',
    price: 289, 
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 
    rating: 5.0, 
    reviews: 234,
    category: 'Торты',
    isNew: true
  },
  { 
    id: '5', 
    name: 'Тирамису', 
    description: 'Итальянский десерт с маскарпоне и кофе',
    price: 329, 
    oldPrice: 399,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 
    rating: 4.9, 
    reviews: 189,
    category: 'Десерты',
    discount: 18
  },
  { 
    id: '6', 
    name: 'Багет французский', 
    description: 'Хрустящий багет с мягкой серединкой',
    price: 89, 
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 
    rating: 4.7, 
    reviews: 67,
    category: 'Хлеб'
  },
];

const CATEGORIES = ['Все', 'Выпечка', 'Торты', 'Пирожные', 'Хлеб', 'Десерты'];

const STORIES = [
  { id: '1', title: 'Новинки', icon: 'sparkles', gradient: ['#EF4444', '#F97316', '#FBBF24'] },
  { id: '2', title: 'Акции', icon: 'pricetag', gradient: ['#3B82F6', '#8B5CF6', '#EC4899'] },
  { id: '3', title: 'Рецепты', icon: 'book', gradient: ['#EC4899', '#F43F5E', '#F97316'] },
  { id: '4', title: 'Советы', icon: 'bulb', gradient: ['#10B981', '#059669', '#14B8A6'] },
];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const { addToCart, itemCount } = useCart();
  const { profile } = useAuth();

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {profile?.full_name?.charAt(0) || 'Г'}
                </Text>
              </LinearGradient>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{profile?.full_name || 'Гость'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="cart-outline" size={24} color={Colors.text} />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bonus Card */}
        <LinearGradient
          colors={Colors.gradientOrange}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bonusCard}
        >
          <View style={styles.bonusLeft}>
            <View style={styles.bonusIconContainer}>
              <Ionicons name="gift" size={28} color="#fff" />
            </View>
            <View>
              <Text style={styles.bonusTitle}>Ваши бонусы</Text>
              <Text style={styles.bonusPoints}>{profile?.bonus_points || 0} баллов</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.9)" />
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Что будем искать?"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={Colors.primary} />
          </View>
        </View>

        {/* Stories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.storiesContainer}
          contentContainerStyle={styles.storiesContent}
        >
          {STORIES.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyItem}>
              <LinearGradient
                colors={story.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyCircle}
              >
                <View style={styles.storyInner}>
                  <Ionicons name={story.icon as any} size={36} color="#fff" />
                </View>
              </LinearGradient>
              <Text style={styles.storyLabel}>{story.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.4)']}
                  style={styles.imageGradient}
                />
                {product.isNew && (
                  <View style={styles.badgeNew}>
                    <Text style={styles.badgeText}>NEW</Text>
                  </View>
                )}
                {product.discount && (
                  <View style={styles.badgeDiscount}>
                    <Text style={styles.badgeText}>-{product.discount}%</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>{product.description}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color={Colors.yellow} />
                  <Text style={styles.ratingText}>{product.rating}</Text>
                  <Text style={styles.reviewsText}>({product.reviews})</Text>
                </View>
                <View style={styles.priceRow}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{product.price}₽</Text>
                    {product.oldPrice && (
                      <Text style={styles.oldPrice}>{product.oldPrice}₽</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => addToCart({ product, quantity: 1 })}
                  >
                    <LinearGradient
                      colors={[Colors.primary, '#FF8552']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addButtonGradient}
                    >
                      <Ionicons name="add" size={24} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    height: 80,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.green,
    borderWidth: 3,
    borderColor: Colors.surface,
  },
  greetingContainer: {
    gap: 2,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 20,
  },
  iconBtn: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.red,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Bonus Card
  bonusCard: {
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 8,
  },
  bonusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bonusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bonusTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bonusPoints: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },

  // Search Bar
  searchContainer: {
    marginHorizontal: 24,
    marginTop: 24,
    height: 56,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stories
  storiesContainer: {
    marginTop: 24,
  },
  storiesContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    gap: 10,
  },
  storyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  storyInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },

  // Categories
  categoriesContainer: {
    marginTop: 24,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 6,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Products Grid
  productsGrid: {
    marginTop: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  productImageContainer: {
    height: 160,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  badgeNew: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.green,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeDiscount: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  productDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
    height: 40,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewsText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  oldPrice: {
    fontSize: 14,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
});
