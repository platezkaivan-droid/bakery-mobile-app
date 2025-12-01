import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../src/context/FavoritesContext';
import { useCart } from '../../src/context/CartContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useSettings } from '../../src/context/SettingsContext';

type FilterType = 'all' | 'available' | 'unavailable';

export default function FavoritesScreen() {
  const router = useRouter();
  const { favorites, loading, isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { colors, isDark, t } = useSettings();
  const [filter, setFilter] = useState<FilterType>('all');

  const styles = createStyles(colors, isDark);

  const products = favorites.map(f => ({ ...f, available: true }));

  const filteredProducts = products.filter((product) => {
    if (filter === 'available') return product.available !== false;
    if (filter === 'unavailable') return product.available === false;
    return true;
  });

  const handleToggleFavorite = async (product: any) => {
    try {
      await toggleFavorite(product);
      showNotification({ title: isFavorite(product.id) ? 'Удалено из избранного' : 'Добавлено в избранное', type: isFavorite(product.id) ? 'info' : 'success' });
    } catch (error) {
      showNotification({ title: 'Войдите в аккаунт', type: 'error' });
    }
  };

  const handleAddToCart = (product: any) => {
    if (product.available === false) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url });
    showNotification({ title: `${product.name} добавлен в корзину`, type: 'success' });
  };

  const handleAddAllToCart = () => {
    const availableProducts = filteredProducts.filter((p) => p.available !== false);
    if (availableProducts.length === 0) return;
    availableProducts.forEach(product => {
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image_url });
    });
    showNotification({ title: `${availableProducts.length} товаров добавлено`, type: 'success' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>{t('favorites_title')} {filteredProducts.length > 0 && `(${filteredProducts.length})`}</Text>
        <TouchableOpacity style={styles.headerButton}><Ionicons name="options-outline" size={24} color={colors.text} /></TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'available', 'unavailable'] as FilterType[]).map((f) => (
            <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.filterButtonActive]} onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? t('favorites_all') : f === 'available' ? t('favorites_available') : t('favorites_unavailable')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient colors={[`${colors.red}20`, `${colors.red}05`]} style={styles.emptyIconBg}>
              <Ionicons name="heart-outline" size={80} color={colors.red} />
            </LinearGradient>
            <Text style={styles.emptyTitle}>{t('favorites_empty')}</Text>
            <Text style={styles.emptyText}>{t('favorites_empty_desc')}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
              <LinearGradient colors={colors.gradientOrange} style={styles.emptyButtonGradient}>
                <Ionicons name="storefront-outline" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>{t('cart_go_catalog')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.actionsContainer}>
              <TouchableOpacity style={[styles.addAllButton, !filteredProducts.some((p) => p.available !== false) && styles.addAllButtonDisabled]} onPress={handleAddAllToCart} disabled={!filteredProducts.some((p) => p.available !== false)}>
                <LinearGradient colors={filteredProducts.some((p) => p.available !== false) ? colors.gradientOrange : ['#ccc', '#999']} style={styles.addAllGradient}>
                  <Ionicons name="cart" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.addAllText}>Добавить все</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.productGrid}>
              {filteredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image_url }} style={styles.productImage} resizeMode="cover" />
                    <TouchableOpacity style={styles.favoriteButton} onPress={() => handleToggleFavorite(product)}>
                      <Ionicons name="heart" size={20} color={colors.red} />
                    </TouchableOpacity>
                    {product.available === false && <View style={styles.unavailableBadge}><Text style={styles.unavailableText}>Нет в наличии</Text></View>}
                    {product.rating && <View style={styles.ratingBadge}><Ionicons name="star" size={10} color={colors.yellow} /><Text style={styles.ratingText}>{product.rating}</Text></View>}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                    {product.description && <Text style={styles.productDescription} numberOfLines={1}>{product.description}</Text>}
                    <View style={styles.productFooter}>
                      <Text style={styles.productPrice}>{product.price} ₽</Text>
                      <TouchableOpacity style={[styles.addButton, product.available === false && styles.addButtonDisabled]} onPress={() => handleAddToCart(product)} disabled={product.available === false}>
                        <Ionicons name="cart" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: colors.textMuted },
  header: { height: 64, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  headerButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  filterContainer: { backgroundColor: colors.surface, paddingVertical: 16, paddingHorizontal: 24 },
  filterScroll: { gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background, marginRight: 8 },
  filterButtonActive: { backgroundColor: colors.primary },
  filterText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  filterTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 100 },
  emptyIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' },
  emptyText: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  emptyButton: { borderRadius: 20, overflow: 'hidden' },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  content: { paddingHorizontal: 24, paddingTop: 16 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 24 },
  addAllButton: { borderRadius: 16, overflow: 'hidden' },
  addAllButtonDisabled: { opacity: 0.5 },
  addAllGradient: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center' },
  addAllText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  productCard: { width: '47%', backgroundColor: colors.surface, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  imageContainer: { position: 'relative', height: 120, backgroundColor: isDark ? colors.background : '#F8F8F8', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  productImage: { width: '100%', height: '100%' },
  favoriteButton: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  unavailableBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  unavailableText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  ratingBadge: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '600', color: colors.text },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4, lineHeight: 18 },
  productDescription: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  addButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  addButtonDisabled: { backgroundColor: colors.textMuted, opacity: 0.5 },
});
