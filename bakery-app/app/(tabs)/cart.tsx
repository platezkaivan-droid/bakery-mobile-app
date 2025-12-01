import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useCart } from '../../src/context/CartContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDemoBonus } from '../../src/context/DemoBonusContext';

export default function CartTabScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { showNotification } = useNotification();
  const { user, profile, updateProfile } = useAuth();
  const { addDemoBonus } = useDemoBonus();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'BAKERY20') {
      setAppliedPromo({ code: promoCode.toUpperCase(), discount: 240 });
      showNotification({
        type: 'success',
        title: 'Промокод применен!',
        message: 'Скидка 240₽',
      });
    } else if (promoCode.length > 0) {
      showNotification({
        type: 'error',
        title: 'Неверный промокод',
        message: 'Попробуйте BAKERY20',
      });
    }
  };

  // Начисление баллов: 5% от суммы заказа
  const calculateBonusPoints = (orderTotal: number) => Math.floor(orderTotal * 0.05);

  const handleCheckout = async () => {
    const earnedPoints = calculateBonusPoints(finalTotal);
    
    // Начисляем баллы
    if (user && profile) {
      // Авторизованный пользователь - сохраняем в Supabase
      try {
        const newPoints = (profile.bonus_points || 0) + earnedPoints;
        await updateProfile({ bonus_points: newPoints });
      } catch (error) {
        console.error('Error updating bonus points:', error);
      }
    } else {
      // Демо-режим - используем контекст
      addDemoBonus(earnedPoints);
    }
    
    showNotification({
      type: 'success',
      title: 'Заказ оформлен! 🎉',
      message: `Сумма: ${finalTotal}₽. Ожидайте доставку.`,
      duration: 3000,
    });
    
    // Показываем уведомление о начисленных баллах
    setTimeout(() => {
      showNotification({
        type: 'info',
        title: `+${earnedPoints} бонусных баллов! 🎁`,
        message: user ? 'Баллы зачислены на ваш счёт' : 'Войдите, чтобы копить баллы',
        duration: 4000,
      });
    }, 1500);
    
    clearCart();
    setAppliedPromo(null);
    router.push('/(tabs)/orders');
  };

  const discount = appliedPromo?.discount || 0;
  const deliveryFee = total > 1000 ? 0 : 150;
  const finalTotal = Math.max(0, total - discount + deliveryFee);
  const earnedPointsPreview = calculateBonusPoints(finalTotal);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Корзина</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[`${Colors.primary}20`, `${Colors.primary}05`]}
            style={styles.emptyIconBg}
          >
            <Ionicons name="cart-outline" size={80} color={Colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>Добавьте вкусную выпечку из каталога</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
            <LinearGradient
              colors={Colors.gradientOrange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Ionicons name="storefront-outline" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Перейти в каталог</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Корзина</Text>
        <View style={styles.headerRight}>
          <View style={styles.itemCountBadge}>
            <Text style={styles.itemCountText}>{itemCount} товаров</Text>
          </View>
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            clearCart();
            showNotification({ type: 'info', title: 'Корзина очищена' });
          }}>
            <Ionicons name="trash-outline" size={22} color={Colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Image 
                source={{ uri: item.product.image || item.product.image_url || 'https://via.placeholder.com/100' }} 
                style={styles.itemImage} 
              />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={1}>
                  {item.product.description || 'Свежая выпечка'}
                </Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>{item.product.price}₽</Text>
                  <Text style={styles.itemMultiplier}>× {item.quantity}</Text>
                </View>
              </View>

              <View style={styles.itemRight}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityBtn, styles.quantityBtnPlus]}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>{item.product.price * item.quantity}₽</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  removeFromCart(item.product.id);
                  showNotification({ type: 'info', title: 'Удалено', message: item.product.name });
                }}
              >
                <Ionicons name="close" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Free Delivery Banner */}
        {total < 1000 && (
          <View style={styles.deliveryBanner}>
            <View style={styles.deliveryIconBg}>
              <Ionicons name="bicycle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryTitle}>До бесплатной доставки</Text>
              <Text style={styles.deliveryAmount}>Осталось {1000 - total}₽</Text>
            </View>
            <View style={styles.deliveryProgress}>
              <View style={[styles.deliveryProgressFill, { width: `${(total / 1000) * 100}%` }]} />
            </View>
          </View>
        )}

        {total >= 1000 && (
          <View style={[styles.deliveryBanner, styles.deliveryBannerFree]}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.green} />
            <Text style={styles.deliveryFreeText}>Бесплатная доставка! 🎉</Text>
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Промокод</Text>
          </View>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Введите код (BAKERY20)"
              placeholderTextColor={Colors.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={[styles.promoButton, !promoCode && styles.promoButtonDisabled]} 
              onPress={applyPromoCode}
              disabled={!promoCode}
            >
              <Text style={styles.promoButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
          {appliedPromo && (
            <View style={styles.appliedPromo}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Text style={styles.appliedPromoText}>
                {appliedPromo.code}: -{appliedPromo.discount}₽
              </Text>
              <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bonus Points Preview */}
        <View style={styles.bonusSection}>
          <View style={styles.bonusHeader}>
            <View style={styles.bonusInfo}>
              <View style={styles.bonusIconBg}>
                <Ionicons name="gift" size={20} color={Colors.yellow} />
              </View>
              <View>
                <Text style={styles.bonusTitle}>Вы получите</Text>
                <Text style={styles.bonusEarned}>+{earnedPointsPreview} баллов</Text>
              </View>
            </View>
            <View style={styles.bonusPercentBadge}>
              <Text style={styles.bonusPercentText}>5%</Text>
            </View>
          </View>
          {profile && (
            <View style={styles.bonusBalanceRow}>
              <Ionicons name="wallet-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.bonusBalance}>Текущий баланс: {profile.bonus_points || 0} баллов</Text>
            </View>
          )}
          {!user && (
            <TouchableOpacity 
              style={styles.loginPrompt}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name="log-in-outline" size={16} color={Colors.primary} />
              <Text style={styles.loginPromptText}>Войдите, чтобы копить баллы</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 320 }} />
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryDetails}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Товары ({itemCount})</Text>
            <Text style={styles.summaryValue}>{total}₽</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Скидка</Text>
              <Text style={[styles.summaryValue, styles.summaryDiscount]}>-{discount}₽</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Доставка</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && styles.summaryFree]}>
              {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee}₽`}
            </Text>
          </View>
        </View>
        
        <View style={styles.summaryTotal}>
          <View>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalValue}>{finalTotal}₽</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <LinearGradient
              colors={Colors.gradientOrange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutText}>Оформить</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: { height: 64, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemCountBadge: { backgroundColor: `${Colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  itemCountText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  clearButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${Colors.red}10` },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  emptyIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  emptyButton: { borderRadius: 20, overflow: 'hidden' },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Items List
  itemsList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  cartItem: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  itemImage: { width: 90, height: 90, borderRadius: 16 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  itemDescription: { fontSize: 13, color: Colors.textMuted },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: Colors.text },
  itemMultiplier: { fontSize: 13, color: Colors.textMuted },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 4 },
  quantityBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  quantityBtnPlus: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quantityText: { fontSize: 16, fontWeight: '700', color: Colors.text, minWidth: 32, textAlign: 'center' },
  itemTotal: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  deleteButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },

  // Delivery Banner
  deliveryBanner: { marginHorizontal: 16, marginTop: 20, backgroundColor: Colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  deliveryBannerFree: { backgroundColor: `${Colors.green}15` },
  deliveryIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  deliveryInfo: { flex: 1 },
  deliveryTitle: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  deliveryAmount: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  deliveryProgress: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 3, backgroundColor: Colors.border, borderRadius: 2 },
  deliveryProgressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  deliveryFreeText: { fontSize: 15, fontWeight: '600', color: Colors.green },

  // Promo Section
  promoSection: { marginHorizontal: 16, marginTop: 20, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  promoInputContainer: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, height: 48, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: Colors.text },
  promoButton: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  promoButtonDisabled: { backgroundColor: Colors.border },
  promoButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  appliedPromo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: `${Colors.green}10`, padding: 12, borderRadius: 12 },
  appliedPromoText: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.green },

  // Bonus Section
  bonusSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  bonusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bonusInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bonusIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.yellow}20`, alignItems: 'center', justifyContent: 'center' },
  bonusTitle: { fontSize: 14, color: Colors.textMuted },
  bonusEarned: { fontSize: 18, fontWeight: 'bold', color: Colors.green },
  bonusPercentBadge: { backgroundColor: `${Colors.green}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bonusPercentText: { fontSize: 14, fontWeight: '600', color: Colors.green },
  bonusBalanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  bonusBalance: { fontSize: 14, color: Colors.textMuted },
  loginPrompt: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  loginPromptText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },

  // Summary
  summaryContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 100, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12 },
  summaryDetails: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: Colors.textMuted },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  summaryDiscount: { color: Colors.green },
  summaryFree: { color: Colors.green },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  totalLabel: { fontSize: 14, color: Colors.textMuted, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: Colors.text },
  checkoutButton: { borderRadius: 16, overflow: 'hidden' },
  checkoutGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 16 },
  checkoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
