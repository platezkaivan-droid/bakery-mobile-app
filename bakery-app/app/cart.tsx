import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useCart } from '../src/context/CartContext';
import { useNotification } from '../src/context/NotificationContext';

export default function CartScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { showNotification } = useNotification();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [useBonusPoints, setUseBonusPoints] = useState(false);
  
  const availableBonusPoints = 1520;
  const bonusDiscount = useBonusPoints ? 50 : 0;

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
        message: 'Попробуйте другой код',
      });
    }
  };

  const handleCheckout = () => {
    showNotification({
      type: 'success',
      title: 'Заказ оформлен!',
      message: `Сумма: ${finalTotal}₽. Ожидайте доставку.`,
      duration: 4000,
    });
    clearCart();
    setAppliedPromo(null);
    setUseBonusPoints(false);
    router.push('/(tabs)/orders');
  };

  const discount = (appliedPromo?.discount || 0) + bonusDiscount;
  const deliveryFee = total > 1000 ? 0 : 150;
  const finalTotal = total - discount + deliveryFee;

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Корзина</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={64} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>Добавьте товары из каталога</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
            <LinearGradient
              colors={Colors.gradientOrange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Корзина ({itemCount})</Text>
        <TouchableOpacity style={styles.clearButton} onPress={() => {
          clearCart();
          showNotification({ type: 'info', title: 'Корзина очищена' });
        }}>
          <Ionicons name="trash-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Image 
                source={{ uri: item.product.image || item.product.image_url || 'https://via.placeholder.com/80' }} 
                style={styles.itemImage} 
              />
              
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={1}>{item.product.description}</Text>
                <Text style={styles.itemPrice}>{item.product.price}₽</Text>
              </View>

              <View style={styles.itemRight}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Ionicons name="remove" size={16} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityBtn}
                    onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Ionicons name="add" size={16} color={Colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>{item.product.price * item.quantity}₽</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  removeFromCart(item.product.id);
                  showNotification({ type: 'info', title: 'Товар удален', message: item.product.name });
                }}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.red} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Free Delivery Banner */}
        {total < 1000 && (
          <View style={styles.deliveryBanner}>
            <Ionicons name="bicycle" size={20} color={Colors.primary} />
            <Text style={styles.deliveryBannerText}>
              До бесплатной доставки осталось {1000 - total}₽
            </Text>
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>Промокод</Text>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Введите промокод (BAKERY20)"
              placeholderTextColor={Colors.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoButton} onPress={applyPromoCode}>
              <Text style={styles.promoButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
          {appliedPromo && (
            <View style={styles.appliedPromo}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
              <Text style={styles.appliedPromoText}>
                Промокод {appliedPromo.code} применен: -{appliedPromo.discount}₽
              </Text>
              <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bonus Points */}
        <View style={styles.bonusSection}>
          <View style={styles.bonusHeader}>
            <View style={styles.bonusInfo}>
              <Ionicons name="gift" size={20} color={Colors.primary} />
              <Text style={styles.bonusTitle}>Бонусные баллы</Text>
            </View>
            <TouchableOpacity
              style={[styles.bonusToggle, useBonusPoints && styles.bonusToggleActive]}
              onPress={() => setUseBonusPoints(!useBonusPoints)}
            >
              <View style={[styles.bonusToggleCircle, useBonusPoints && styles.bonusToggleCircleActive]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.bonusAvailable}>Доступно: {availableBonusPoints} баллов</Text>
          {useBonusPoints && (
            <Text style={styles.bonusApplied}>Будет списано: 50 баллов (-50₽)</Text>
          )}
        </View>

        <View style={{ height: 300 }} />
      </ScrollView>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Товары ({itemCount}):</Text>
          <Text style={styles.summaryValue}>{total}₽</Text>
        </View>
        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Скидка:</Text>
            <Text style={[styles.summaryValue, { color: Colors.green }]}>-{discount}₽</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Доставка:</Text>
          <Text style={[styles.summaryValue, deliveryFee === 0 && { color: Colors.green }]}>
            {deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee}₽`}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Итого:</Text>
          <Text style={styles.totalValue}>{finalTotal}₽</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <LinearGradient
            colors={Colors.gradientOrange}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.checkoutGradient}
          >
            <Text style={styles.checkoutText}>Оформить заказ</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: { height: 64, backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  clearButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  emptyIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  emptyButton: { borderRadius: 20, overflow: 'hidden' },
  emptyButtonGradient: { paddingHorizontal: 32, paddingVertical: 16, alignItems: 'center' },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Items List
  itemsList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  cartItem: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  itemImage: { width: 80, height: 80, borderRadius: 16 },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  itemDescription: { fontSize: 12, color: Colors.textMuted },
  itemPrice: { fontSize: 14, color: Colors.text },
  itemRight: { alignItems: 'flex-end', gap: 12 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 12, padding: 4, gap: 8 },
  quantityBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  quantityText: { fontSize: 14, fontWeight: '600', color: Colors.text, minWidth: 20, textAlign: 'center' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  deleteButton: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  // Delivery Banner
  deliveryBanner: { marginHorizontal: 16, marginTop: 16, backgroundColor: `${Colors.primary}15`, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  deliveryBannerText: { flex: 1, fontSize: 14, color: Colors.primary, fontWeight: '500' },

  // Promo Section
  promoSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  promoInputContainer: { flexDirection: 'row', gap: 12 },
  promoInput: { flex: 1, height: 48, backgroundColor: Colors.background, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: Colors.text },
  promoButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  promoButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  appliedPromo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  appliedPromoText: { flex: 1, fontSize: 14, color: Colors.green },

  // Bonus Section
  bonusSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: Colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  bonusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  bonusInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bonusTitle: { fontSize: 16, fontWeight: '600', color: Colors.text },
  bonusToggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: Colors.border, padding: 2 },
  bonusToggleActive: { backgroundColor: Colors.primary },
  bonusToggleCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  bonusToggleCircleActive: { marginLeft: 22 },
  bonusAvailable: { fontSize: 14, color: Colors.textMuted },
  bonusApplied: { fontSize: 14, color: Colors.green, marginTop: 4 },

  // Summary
  summaryContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: Colors.textMuted },
  summaryValue: { fontSize: 14, fontWeight: '600', color: Colors.text },
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  checkoutButton: { marginTop: 20, borderRadius: 20, overflow: 'hidden' },
  checkoutGradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  checkoutText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
});
