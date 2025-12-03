import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDemoBonus } from '../../src/context/DemoBonusContext';
import { useSettings } from '../../src/context/SettingsContext';
import { useFavorites } from '../../src/context/FavoritesContext';

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

// Локальные изображения продуктов (исправлены названия файлов)
const PRODUCT_IMAGES: { [key: string]: any } = {
  croissant: require('../../assets/products/kruassan s chocaladom.jpg'),
  cinnabon: require('../../assets/products/sinabon.jpg'),
  almondCroissant: require('../../assets/products/kruassan s mendalem.jpg'),
  danish: require('../../assets/products/datskaya bulochka.jpg'),
  donut: require('../../assets/products/ponchik glazirovanniy.jpg'),
  cinnamonBun: require('../../assets/products/bulka s koricey.jpg'),
  napoleon: require('../../assets/products/napoleon classic.jpg'),
  medovik: require('../../assets/products/medovic.jpg'),
  redVelvet: require('../../assets/products/red.png'),
  cheesecake: require('../../assets/products/cheesecake new york.jpg'),
  chocolateCake: require('../../assets/products/chcolade tort.jpg'),
  eclair: require('../../assets/products/ekler s cremom.jpg'),
  macarons: require('../../assets/products/makarons assorti.jpg'),
  tiramisu: require('../../assets/products/tiramissu.jpg'),
  profiterole: require('../../assets/products/profitroli.jpg'),
  cupcake: require('../../assets/products/kapcake.jpg'),
  baguette: require('../../assets/products/baget.jpg'),
  ciabatta: require('../../assets/products/chiabatta.jpg'),
  ryeBread: require('../../assets/products/hleb rzhanoy.jpg'),
  focaccia: require('../../assets/products/fokacha s razmarinom.jpg'),
  berryTart: require('../../assets/products/tart s yagodami.jpg'),
  pannaCotta: require('../../assets/products/panna kotta.jpg'),
  cremeBrulee: require('../../assets/products/krem brulle.jpg'),
  strudel: require('../../assets/products/shtrudel.jpg'),
};

// Расширенный каталог товаров (UUID соответствуют БД Supabase)
const PRODUCTS: Product[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Круассан с шоколадом', description: 'Нежное слоёное тесто с бельгийским шоколадом', price: 189, oldPrice: 249, image: 'croissant', rating: 4.9, reviews: 128, category: 'Выпечка', discount: 24 },
  { id: '00000000-0000-0000-0000-000000000002', name: 'Синнабон классический', description: 'Пышная булочка с корицей и сливочным кремом', price: 215, image: 'cinnabon', rating: 4.8, reviews: 256, category: 'Выпечка', isNew: true },
  { id: '00000000-0000-0000-0000-000000000003', name: 'Круассан с миндалём', description: 'Хрустящий круассан с миндальным кремом', price: 225, image: 'almondCroissant', rating: 4.7, reviews: 89, category: 'Выпечка', isNew: true },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Датская булочка', description: 'Слоёная булочка с заварным кремом и ягодами', price: 195, oldPrice: 240, image: 'danish', rating: 4.6, reviews: 67, category: 'Выпечка', discount: 19 },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Пончик глазированный', description: 'Воздушный пончик с шоколадной глазурью', price: 120, image: 'donut', rating: 4.5, reviews: 312, category: 'Выпечка' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Булочка с корицей', description: 'Ароматная булочка с корицей и изюмом', price: 145, image: 'cinnamonBun', rating: 4.8, reviews: 198, category: 'Выпечка' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Наполеон классический', description: 'Многослойный торт с заварным кремом', price: 450, image: 'napoleon', rating: 4.9, reviews: 234, category: 'Торты', isNew: true },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Медовик', description: 'Нежные медовые коржи со сметанным кремом', price: 420, oldPrice: 520, image: 'medovik', rating: 4.8, reviews: 189, category: 'Торты', discount: 19 },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Красный бархат', description: 'Бисквит с кремом из маскарпоне', price: 550, image: 'redVelvet', rating: 5.0, reviews: 156, category: 'Торты' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Чизкейк Нью-Йорк', description: 'Классический американский чизкейк', price: 380, image: 'cheesecake', rating: 4.9, reviews: 278, category: 'Торты' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Шоколадный торт', description: 'Насыщенный шоколадный бисквит с ганашем', price: 490, image: 'chocolateCake', rating: 4.7, reviews: 145, category: 'Торты', isNew: true },
  { id: '00000000-0000-0000-0000-000000000012', name: 'Эклер с кремом', description: 'Воздушное заварное тесто с ванильным кремом', price: 145, oldPrice: 180, image: 'eclair', rating: 4.7, reviews: 89, category: 'Пирожные', discount: 19 },
  { id: '00000000-0000-0000-0000-000000000013', name: 'Макаронс ассорти', description: 'Набор из 6 французских макарон', price: 420, oldPrice: 520, image: 'macarons', rating: 5.0, reviews: 312, category: 'Пирожные', discount: 19 },
  { id: '00000000-0000-0000-0000-000000000014', name: 'Тирамису', description: 'Итальянский десерт с кофе и маскарпоне', price: 340, image: 'tiramisu', rating: 4.8, reviews: 198, category: 'Пирожные' },
  { id: '00000000-0000-0000-0000-000000000015', name: 'Профитроли', description: 'Заварные шарики с кремом и шоколадом', price: 280, image: 'profiterole', rating: 4.6, reviews: 134, category: 'Пирожные' },
  { id: '00000000-0000-0000-0000-000000000016', name: 'Капкейк шоколадный', description: 'Мини-кекс с шоколадным кремом', price: 95, image: 'cupcake', rating: 4.5, reviews: 267, category: 'Пирожные' },
  { id: '00000000-0000-0000-0000-000000000017', name: 'Багет французский', description: 'Хрустящая корочка, мягкий мякиш', price: 120, image: 'baguette', rating: 4.8, reviews: 456, category: 'Хлеб' },
  { id: '00000000-0000-0000-0000-000000000018', name: 'Чиабатта', description: 'Итальянский хлеб с оливковым маслом', price: 140, image: 'ciabatta', rating: 4.7, reviews: 234, category: 'Хлеб' },
  { id: '00000000-0000-0000-0000-000000000019', name: 'Хлеб ржаной', description: 'Ржаной хлеб с кориандром', price: 95, image: 'ryeBread', rating: 4.9, reviews: 567, category: 'Хлеб' },
  { id: '00000000-0000-0000-0000-000000000020', name: 'Фокачча с розмарином', description: 'Итальянская лепёшка с травами', price: 180, image: 'focaccia', rating: 4.6, reviews: 123, category: 'Хлеб', isNew: true },
  { id: '00000000-0000-0000-0000-000000000021', name: 'Тарт с ягодами', description: 'Песочное тесто со свежими ягодами', price: 295, image: 'berryTart', rating: 4.9, reviews: 175, category: 'Десерты', isNew: true },
  { id: '00000000-0000-0000-0000-000000000022', name: 'Панна котта', description: 'Итальянский сливочный десерт', price: 220, image: 'pannaCotta', rating: 4.7, reviews: 98, category: 'Десерты' },
  { id: '00000000-0000-0000-0000-000000000023', name: 'Крем-брюле', description: 'Французский десерт с карамельной корочкой', price: 260, image: 'cremeBrulee', rating: 4.8, reviews: 167, category: 'Десерты' },
  { id: '00000000-0000-0000-0000-000000000024', name: 'Штрудель яблочный', description: 'Слоёное тесто с яблоками и корицей', price: 190, oldPrice: 240, image: 'strudel', rating: 4.6, reviews: 234, category: 'Десерты', discount: 21 },
];

const STORY_IMAGES = {
  new: require('../../assets/products/kruassan s chocaladom.jpg'),
  sales: require('../../assets/products/makarons assorti.jpg'),
  recipes: require('../../assets/products/hleb rzhanoy.jpg'),
  tips: require('../../assets/products/sinabon.jpg'),
};

const STORIES_CONTENT = {
  new: { title: 'Новинки', subtitle: 'Попробуйте первыми!', items: PRODUCTS.filter(p => p.isNew), gradient: ['#FF6B35', '#FF8552', '#FFB347'], headerImage: STORY_IMAGES.new },
  sales: { title: 'Акции', subtitle: 'Скидки до 25%!', items: PRODUCTS.filter(p => p.discount), gradient: ['#667eea', '#764ba2', '#f093fb'], headerImage: STORY_IMAGES.sales },
  recipes: {
    title: 'Рецепты', subtitle: 'Готовьте дома', gradient: ['#f093fb', '#f5576c', '#FF6B35'], headerImage: STORY_IMAGES.recipes,
    recipes: [
      { id: '1', name: 'Домашний хлеб', time: '2 часа', difficulty: 'Средне', image: require('../../assets/products/hleb rzhanoy.jpg'), ingredients: ['500 г муки', '10 г дрожжей', '300 мл воды', '1 ч.л. соли', '1 ст.л. сахара', '2 ст.л. масла'], steps: ['Смешайте воду с дрожжами', 'Добавьте муку и соль', 'Замесите тесто', 'Дайте подойти 1 час', 'Выпекайте при 200°C 40 мин'] },
      { id: '2', name: 'Круассаны', time: '4 часа', difficulty: 'Сложно', image: require('../../assets/products/kruassan s chocaladom.jpg'), ingredients: ['500 г муки', '300 мл молока', '80 г сахара', '300 г масла'], steps: ['Замесите тесто', 'Охладите 1 час', 'Раскатайте с маслом', 'Сложите 3 раза', 'Выпекайте при 200°C'] },
    ],
  },
  tips: {
    title: 'Советы', subtitle: 'Полезные лайфхаки', gradient: ['#11998e', '#38ef7d', '#56ab2f'], headerImage: STORY_IMAGES.tips,
    tips: [
      { id: '1', title: 'Как хранить хлеб', text: 'Храните в бумажном пакете до 3 дней', icon: 'bulb' },
      { id: '2', title: 'Свежесть выпечки', text: 'Разогрейте в духовке при 180°C 3-5 мин', icon: 'flame' },
    ],
  },
};

const STORIES = [
  { id: 'new', label: 'Новинки', icon: 'sparkles', ...STORIES_CONTENT.new },
  { id: 'sales', label: 'Акции', icon: 'pricetag', ...STORIES_CONTENT.sales },
  { id: 'recipes', label: 'Рецепты', icon: 'book', ...STORIES_CONTENT.recipes },
  { id: 'tips', label: 'Советы', icon: 'bulb', ...STORIES_CONTENT.tips },
];

// Категории будут переведены через t() в компоненте
const CATEGORIES_KEYS = ['home_all', 'home_bakery', 'home_cakes', 'home_pastries', 'home_bread', 'home_desserts'];
const CATEGORIES = ['Все', 'Выпечка', 'Торты', 'Пирожные', 'Хлеб', 'Десерты'];

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [storyModal, setStoryModal] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const { addToCart, itemCount, setOnItemAdded } = useCart();
  const { showNotification, unreadCount: unreadNotificationsCount } = useNotification();
  const { profile, user } = useAuth();
  const { demoBonusPoints } = useDemoBonus();
  const { colors, isDark, t } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const bonusPoints = user ? (profile?.bonus_points || 0) : demoBonusPoints;

  useEffect(() => {
    setOnItemAdded((productName: string) => {
      showNotification({ type: 'success', title: 'Добавлено в корзину', message: productName, duration: 2000 });
    });
  }, [setOnItemAdded, showNotification]);

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = activeCategory === 'Все' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeStory = STORIES.find(s => s.id === storyModal);
  const styles = createStyles(colors, isDark);

  const renderStoryModal = () => {
    if (!activeStory) return null;
    return (
      <Modal visible={!!storyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image source={(activeStory as any).headerImage} style={styles.modalHeaderImage} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.modalHeaderOverlay}>
                <View style={styles.modalHeaderContent}>
                  <View>
                    <Text style={styles.modalTitle}>{activeStory.title}</Text>
                    <Text style={styles.modalSubtitle}>{activeStory.subtitle}</Text>
                  </View>
                  <TouchableOpacity style={styles.modalClose} onPress={() => { setStoryModal(null); setSelectedRecipe(null); }}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {(storyModal === 'new' || storyModal === 'sales') && (activeStory as any).items && (
                <View style={styles.modalProducts}>
                  {(activeStory as any).items.map((product: Product) => (
                    <TouchableOpacity key={product.id} style={styles.modalProductCard}>
                      <Image source={PRODUCT_IMAGES[product.image]} style={styles.modalProductImage} resizeMode="cover" />
                      {product.isNew && <View style={styles.modalNewBadge}><Text style={styles.badgeText}>NEW</Text></View>}
                      {product.discount && <View style={styles.modalDiscountBadge}><Text style={styles.badgeText}>-{product.discount}%</Text></View>}
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName}>{product.name}</Text>
                        <Text style={styles.modalProductDesc}>{product.description}</Text>
                        <View style={styles.modalProductFooter}>
                          <View style={styles.modalPriceRow}>
                            <Text style={styles.modalPrice}>{product.price}₽</Text>
                            {product.oldPrice && <Text style={styles.modalOldPrice}>{product.oldPrice}₽</Text>}
                          </View>
                          <TouchableOpacity style={styles.modalAddBtn} onPress={() => addToCart(product as any)}>
                            <Ionicons name="add" size={20} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {storyModal === 'recipes' && (activeStory as any).recipes && !selectedRecipe && (
                <View style={styles.modalRecipes}>
                  {(activeStory as any).recipes.map((recipe: any) => (
                    <TouchableOpacity key={recipe.id} style={styles.recipeCard} onPress={() => setSelectedRecipe(recipe)}>
                      <Image source={recipe.image} style={styles.recipeImage} />
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeName}>{recipe.name}</Text>
                        <View style={styles.recipeDetails}>
                          <View style={styles.recipeDetail}><Ionicons name="time-outline" size={14} color={colors.textMuted} /><Text style={styles.recipeDetailText}>{recipe.time}</Text></View>
                          <View style={styles.recipeDetail}><Ionicons name="speedometer-outline" size={14} color={colors.textMuted} /><Text style={styles.recipeDetailText}>{recipe.difficulty}</Text></View>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {storyModal === 'recipes' && selectedRecipe && (
                <View style={styles.recipeDetailView}>
                  <TouchableOpacity style={styles.recipeBackBtn} onPress={() => setSelectedRecipe(null)}>
                    <Ionicons name="arrow-back" size={20} color={colors.primary} /><Text style={styles.recipeBackText}>Назад</Text>
                  </TouchableOpacity>
                  <Image source={selectedRecipe.image} style={styles.recipeDetailImage} />
                  <Text style={styles.recipeDetailTitle}>{selectedRecipe.name}</Text>
                  <Text style={styles.recipeSectionTitle}>🥣 Ингредиенты</Text>
                  {selectedRecipe.ingredients.map((ing: string, idx: number) => (
                    <View key={idx} style={styles.ingredientItem}><View style={styles.ingredientBullet} /><Text style={styles.ingredientText}>{ing}</Text></View>
                  ))}
                  <Text style={styles.recipeSectionTitle}>👨‍🍳 Приготовление</Text>
                  {selectedRecipe.steps.map((step: string, idx: number) => (
                    <View key={idx} style={styles.stepItem}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{idx + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>
                  ))}
                </View>
              )}
              {storyModal === 'tips' && (activeStory as any).tips && (
                <View style={styles.modalTips}>
                  {(activeStory as any).tips.map((tip: any) => (
                    <View key={tip.id} style={styles.tipCard}>
                      <View style={styles.tipIcon}><Ionicons name={tip.icon as any} size={24} color={colors.primary} /></View>
                      <View style={styles.tipContent}><Text style={styles.tipTitle}>{tip.title}</Text><Text style={styles.tipText}>{tip.text}</Text></View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderStoryModal()}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={[colors.primary, '#8B4513']} style={styles.avatar}>
                <Text style={styles.avatarText}>{profile?.full_name?.charAt(0) || 'И'}</Text>
              </LinearGradient>
            )}
            <View style={styles.onlineIndicator} />
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>Добрый день 👋</Text>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{profile?.full_name || 'Иван'}</Text>
                {user ? (
                  <View style={styles.authBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.green} />
                    <Text style={styles.authBadgeText}>Авторизован</Text>
                  </View>
                ) : (
                  <View style={[styles.authBadge, styles.authBadgeGuest]}>
                    <Ionicons name="person-outline" size={14} color={colors.textMuted} />
                    <Text style={[styles.authBadgeText, styles.authBadgeTextGuest]}>{t('profile_guest')}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/cart')}>
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              {itemCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{itemCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient colors={[colors.primary, '#FF8552', '#D2691E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoCard}>
            <View style={styles.promoContent}>
              <View style={styles.promoIconContainer}><Ionicons name="gift" size={28} color="#fff" /></View>
              <View><Text style={styles.promoLabel}>{t('home_your_bonus')}</Text><Text style={styles.promoValue}>{bonusPoints} {t('home_points')}</Text></View>
            </View>
            <Ionicons name="chevron-forward" size={28} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput style={styles.searchInput} placeholder={t('home_search_placeholder')} placeholderTextColor={colors.textMuted} value={searchQuery} onChangeText={setSearchQuery} />
            <TouchableOpacity style={styles.filterButton}><Ionicons name="options" size={20} color={colors.primary} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContainer}>
          {STORIES.map((story) => (
            <TouchableOpacity key={story.id} style={styles.storyItem} onPress={() => setStoryModal(story.id)}>
              <LinearGradient colors={story.gradient} style={styles.storyCircle}>
                <Image source={(story as any).headerImage} style={styles.storyImage} resizeMode="cover" />
              </LinearGradient>
              <Text style={styles.storyLabel}>{story.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity key={category} style={[styles.categoryButton, activeCategory === category && styles.categoryButtonActive]} onPress={() => setActiveCategory(category)}>
              <Text style={[styles.categoryText, activeCategory === category && styles.categoryTextActive]}>
                {t(CATEGORIES_KEYS[index] as any)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.productsHeader}>
          <Text style={styles.productsTitle}>{activeCategory === t('home_all') ? 'Все товары' : activeCategory}</Text>
          <Text style={styles.productsCount}>{filteredProducts.length} {t('cart_items')}</Text>
        </View>

        <View style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.9}>
              <View style={styles.productImageContainer}>
                <Image source={PRODUCT_IMAGES[product.image]} style={styles.productImage} resizeMode="contain" />
                {product.isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                {product.discount && <View style={styles.discountBadge}><Text style={styles.discountBadgeText}>-{product.discount}%</Text></View>}
                
                {/* Кнопка избранного */}
                <TouchableOpacity 
                  style={styles.favoriteButton} 
                  onPress={async () => {
                    if (!user) {
                      showNotification({
                        type: 'error',
                        title: 'Требуется авторизация',
                        message: 'Войдите в аккаунт, чтобы добавлять товары в избранное',
                        duration: 3000
                      });
                      return;
                    }
                    
                    try {
                      const wasFavorite = isFavorite(product.id);
                      await toggleFavorite(product as any);
                      showNotification({
                        type: wasFavorite ? 'info' : 'success',
                        title: wasFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
                        message: product.name,
                        duration: 2000
                      });
                    } catch (error: any) {
                      console.error('Error toggling favorite:', error);
                      showNotification({
                        type: 'error',
                        title: 'Ошибка',
                        message: error.message || 'Не удалось добавить в избранное',
                        duration: 3000
                      });
                    }
                  }}
                >
                  <Ionicons 
                    name={isFavorite(product.id) ? "heart" : "heart-outline"} 
                    size={20} 
                    color={isFavorite(product.id) ? colors.red : "#fff"} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.addButtonOverlay} onPress={() => addToCart(product as any)}><Ionicons name="add" size={20} color="#fff" /></TouchableOpacity>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                <View style={styles.ratingContainer}><Ionicons name="star" size={12} color={colors.yellow} /><Text style={styles.ratingText}>{product.rating}</Text></View>
                <View style={styles.priceRow}><Text style={styles.price}>{product.price}₽</Text>{product.oldPrice && <Text style={styles.oldPrice}>{product.oldPrice}₽</Text>}</View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { height: 80, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  onlineIndicator: { position: 'absolute', bottom: 0, left: 36, width: 14, height: 14, borderRadius: 7, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.surface },
  greeting: { marginLeft: 4 },
  greetingText: { fontSize: 14, color: colors.textMuted },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  authBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${colors.green}15` },
  authBadgeGuest: { backgroundColor: `${colors.textMuted}15` },
  authBadgeText: { fontSize: 11, fontWeight: '600', color: colors.green },
  authBadgeTextGuest: { color: colors.textMuted },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  notificationBadge: { position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notificationBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  cartBadge: { position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },
  promoCard: { marginHorizontal: 24, marginTop: 20, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  promoIconContainer: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  promoLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  promoValue: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  searchContainer: { paddingHorizontal: 24, marginTop: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: colors.text },
  filterButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  storiesContainer: { paddingHorizontal: 24, paddingVertical: 20, gap: 16 },
  storyItem: { alignItems: 'center', gap: 8 },
  storyCircle: { width: 72, height: 72, borderRadius: 36, padding: 3, alignItems: 'center', justifyContent: 'center' },
  storyImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: colors.surface },
  storyLabel: { fontSize: 12, fontWeight: '500', color: colors.text },
  categoriesContainer: { paddingHorizontal: 24, gap: 8 },
  categoryButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, backgroundColor: colors.surface },
  categoryButtonActive: { backgroundColor: colors.primary },
  categoryText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  categoryTextActive: { color: '#fff' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginTop: 24, marginBottom: 16 },
  productsTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  productsCount: { fontSize: 14, color: colors.textMuted },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  productCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, marginBottom: 4 },
  productImageContainer: { height: 140, backgroundColor: isDark ? colors.background : '#F8F8F8', position: 'relative' },
  productImage: { width: '100%', height: '100%' },
  newBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.green, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  newBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  discountBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.red, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  discountBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  addButtonOverlay: { position: 'absolute', bottom: 8, right: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  ratingText: { fontSize: 12, fontWeight: '500', color: colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  price: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  oldPrice: { fontSize: 14, color: colors.textMuted, textDecorationLine: 'line-through' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%' },
  modalHeader: { height: 200, position: 'relative' },
  modalHeaderImage: { width: '100%', height: '100%' },
  modalHeaderOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, justifyContent: 'flex-end', padding: 20 },
  modalHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  modalSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20 },
  modalProducts: { gap: 16 },
  modalProductCard: { backgroundColor: colors.background, borderRadius: 16, overflow: 'hidden' },
  modalProductImage: { width: '100%', height: 160 },
  modalNewBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.green, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalDiscountBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: colors.red, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  modalProductInfo: { padding: 16 },
  modalProductName: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  modalProductDesc: { fontSize: 14, color: colors.textMuted, marginBottom: 12 },
  modalProductFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalPrice: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  modalOldPrice: { fontSize: 16, color: colors.textMuted, textDecorationLine: 'line-through' },
  modalAddBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  modalRecipes: { gap: 12 },
  recipeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 16, padding: 12, gap: 12 },
  recipeImage: { width: 70, height: 70, borderRadius: 12 },
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  recipeDetails: { flexDirection: 'row', gap: 12 },
  recipeDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recipeDetailText: { fontSize: 13, color: colors.textMuted },
  recipeDetailView: { paddingBottom: 20 },
  recipeBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  recipeBackText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  recipeDetailImage: { width: '100%', height: 200, borderRadius: 16, marginBottom: 16 },
  recipeDetailTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  recipeSectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 12 },
  ingredientItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  ingredientBullet: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  ingredientText: { fontSize: 15, color: colors.text },
  stepItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  stepText: { flex: 1, fontSize: 15, color: colors.text, lineHeight: 22 },
  modalTips: { gap: 12 },
  tipCard: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 16, padding: 16, gap: 12 },
  tipIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  tipText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
