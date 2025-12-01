import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

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
  isHot?: boolean;
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
    isHot: true,
    discount: 24
  },
  { 
    id: '2', 
    name: 'Эклер ванильный', 
    description: 'Классический эклер с ванильным кремом',
    price: 159, 
    image: 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400', 
    rating: 4.8, 
    reviews: 96,
    category: 'Пирожные'
  },
  { 
    id: '3', 
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
    id: '4', 
    name: 'Багет французский', 
    description: 'Хрустящий багет с мягкой серединкой',
    price: 89, 
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400', 
    rating: 4.7, 
    reviews: 67,
    category: 'Хлеб'
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
    isHot: true,
    discount: 18
  },
  { 
    id: '6', 
    name: 'Маффин черничный', 
    description: 'Воздушный маффин со свежей черникой',
    price: 129, 
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', 
    rating: 4.6, 
    reviews: 54,
    category: 'Выпечка',
    isNew: true
  },
  { 
    id: '7', 
    name: 'Наполеон', 
    description: 'Многослойный торт с заварным кремом',
    price: 259, 
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400', 
    rating: 4.8, 
    reviews: 112,
    category: 'Торты'
  },
  { 
    id: '8', 
    name: 'Синнабон', 
    description: 'Булочка с корицей и сливочной глазурью',
    price: 199, 
    image: 'https://images.unsplash.com/photo-1609127102567-8a9a21dc27d8?w=400', 
    rating: 4.9, 
    reviews: 203,
    category: 'Выпечка',
    isHot: true
  },
];

const CATEGORIES = ['Все', 'Выпечка', 'Торты', 'Пирожные', 'Хлеб', 'Десерты'];

const STORIES = [
  { id: '1', title: 'Новинки', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100', gradient: ['#FF6B6B', '#FFE66D'] },
  { id: '2', title: 'Акции', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=100', gradient: ['#4ECDC4', '#44A08D'] },
  { id: '3', title: 'Рецепты', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=100', gradient: ['#F093FB', '#F5576C'] },
  { id: '4', title: 'Советы', image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=100', gradient: ['#FA709A', '#FEE140'] },
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

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {/* Badges */}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        {item.isNew && !item.discount && (
          <View style={styles.newBadge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {item.isHot && !item.discount && !item.isNew && (
          <View style={styles.hotBadge}>
            <Text style={styles.badgeText}>🔥 ХИТ</Text>
          </View>
        )}
        
        {/* Heart button */}
        <TouchableOpacity style={styles.heartBtn}>
          <Ionicons name="heart-outline" size={18} color={Colors.red} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={Colors.yellow} />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>
        
        <View style={styles.priceRow}>
          <View>
            <Text style={styles.price}>{item.price} ₽</Text>
            {item.oldPrice && (
              <Text style={styles.oldPrice}>{item.oldPrice} ₽</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addBtn}
            onPress={() => addToCart({ 
              id: item.id, 
              name: item.name, 
              price: item.price, 
              image_url: item.image,
              category_id: '1',
              rating: item.rating
            })}
          >
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }}
                style={styles.avatar}
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{profile?.full_name || 'Гость'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartBtn}>
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
        <TouchableOpacity style={styles.bonusCard} activeOpacity={0.9}>
          <View style={styles.bonusLeft}>
            <View style={styles.bonusIcon}>
              <Ionicons name="gift" size={24} color={Colors.accent} />
            </View>
            <View>
              <Text style={styles.bonusTitle}>Ваши бонусы</Text>
              <Text style={styles.bonusPoints}>{profile?.bonus_points || 0} баллов</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Что будем искать?"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textMuted}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          <View style={styles.searchDivider} />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
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
              <View style={styles.storyGradient}>
                <View style={styles.storyImageContainer}>
                  <Image source={{ uri: story.image }} style={styles.storyImage} />
                </View>
              </View>
              <Text style={styles.storyTitle}>{story.title}</Text>
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
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBtn,
                selectedCategory === cat && styles.categoryBtnActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
          <View style={styles.promoContent}>
            <View style={styles.promoTag}>
              <Text style={styles.promoTagText}>СПЕЦИАЛЬНОЕ ПРЕДЛОЖЕНИЕ</Text>
            </View>
            <Text style={styles.promoTitle}>Скидка 20%</Text>
            <Text style={styles.promoSubtitle}>на первый заказ в приложении</Text>
            <TouchableOpacity style={styles.promoBtn}>
              <Text style={styles.promoBtnText}>Получить скидку</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300' }}
            style={styles.promoImage}
          />
        </TouchableOpacity>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Популярное</Text>
            <Text style={styles.sectionSubtitle}>Самые любимые товары</Text>
          </View>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>Все</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productWrapper}>
              {renderProduct({ item: product })}
            </View>
          ))}
        </View>

        {/* Bottom Spacing */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  greetingContainer: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  cartBtn: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.accent,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  bonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bonusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bonusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bonusTitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  bonusPoints: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  filterBtn: {
    padding: 8,
    backgroundColor: Colors.accent + '10',
    borderRadius: 10,
  },
  storiesContainer: {
    marginTop: 24,
    maxHeight: 100,
  },
  storiesContent: {
    paddingHorizontal: 20,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyGradient: {
    padding: 3,
    borderRadius: 28,
    background: 'linear-gradient(45deg, #FF6B6B, #FFE66D)',
  },
  storyImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: Colors.background,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyTitle: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    fontWeight: '500',
  },
  categoriesContainer: {
    marginTop: 24,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: Colors.surface,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  categoryTextActive: {
    color: '#fff',
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 24,
    overflow: 'hidden',
    height: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  promoContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  promoTag: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  promoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
  },
  promoSubtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  promoBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginRight: 6,
  },
  promoImage: {
    width: 160,
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '10',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    marginRight: 4,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  productWrapper: {
    width: '50%',
    padding: 6,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.red,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.green,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  hotBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 14,
  },
  productCategory: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 6,
  },
  productDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  oldPrice: {
    fontSize: 12,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
