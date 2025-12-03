import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDemoBonus } from '../../src/context/DemoBonusContext';
import { useSettings } from '../../src/context/SettingsContext';
import { supabase } from '../../src/lib/supabase';

// Локальные изображения продуктов
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

export default function CartTabScreen() {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { showNotification, addStoredNotification } = useNotification();
  const { user, profile, updateProfile } = useAuth();
  const { addDemoBonus } = useDemoBonus();
  const { colors, isDark, t } = useSettings();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  const bonusPoints = user ? (profile?.bonus_points || 0) : 0;

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

  // Расчёт скидки баллами (10 баллов = 1₽)
  const calculatePointsDiscount = () => {
    if (!usePoints || !bonusPoints) return 0;
    
    // Максимальная скидка в рублях (баллы / 10)
    const maxDiscountRub = Math.floor(bonusPoints / 10);
    
    // Скидка не может быть больше суммы заказа
    return Math.min(maxDiscountRub, total);
  };

  const pointsDiscount = calculatePointsDiscount();
  const pointsToSpend = pointsDiscount * 10; // Сколько баллов реально спишется

  const handleCheckout = async () => {
    const earnedPoints = calculateBonusPoints(finalTotal);
    
    try {
      let orderNumber = '';
      let orderId = '';
      
      // Сохраняем заказ в БД (если пользователь авторизован)
      if (user) {
        // 1. Создаём заказ со статусом "pending" (активный)
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            status: 'pending', // Статус "ожидает" - будет в активных
            subtotal: total,
            discount: discount + pointsDiscount,
            delivery_fee: deliveryFee,
            total_price: finalTotal,
            delivery_address: 'Адрес доставки',
            promo_code: appliedPromo?.code || null,
            points_spent: pointsToSpend,
          })
          .select()
          .single();

        if (orderError) {
          console.error('Error creating order:', orderError);
          throw orderError;
        }

        orderId = orderData.id;
        orderNumber = `#${orderData.id.slice(0, 8).toUpperCase()}`;

        // 2. Добавляем товары в order_items
        if (orderData) {
          const orderItems = items.map(item => ({
            order_id: orderData.id,
            product_id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image || '',
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

          if (itemsError) {
            console.error('Error creating order items:', itemsError);
          }
        }

        // Сохраняем значения для использования в setTimeout
        const savedOrderId = orderId;
        const savedOrderNumber = orderNumber;
        const savedEarnedPoints = earnedPoints;
        const savedProfile = profile;
        
        // Через 1 минуту меняем статус на "delivered" и начисляем баллы
        console.log(`[ЗАКАЗ] Создан заказ ${savedOrderNumber}, ID: ${savedOrderId}. Доставка через 60 секунд...`);
        
        setTimeout(async () => {
          try {
            console.log(`[ЗАКАЗ] Обновляем статус заказа ${savedOrderNumber} на "delivered"...`);
            console.log(`[ЗАКАЗ] Order ID для обновления: ${savedOrderId}`);
            
            // Обновляем статус заказа
            const { data: updateData, error: updateError } = await supabase
              .from('orders')
              .update({ status: 'delivered' })
              .eq('id', savedOrderId)
              .select();

            if (updateError) {
              console.error('[ЗАКАЗ] Ошибка обновления статуса:', updateError);
              throw updateError;
            }

            console.log(`[ЗАКАЗ] Статус обновлён на "delivered"`, updateData);

            // Принудительно перезагружаем страницу заказов
            // Используем глобальное событие для обновления
            if ((global as any).refreshOrders) {
              console.log('[ЗАКАЗ] Вызываем глобальную функцию обновления заказов');
              (global as any).refreshOrders();
            } else {
              console.log('[ЗАКАЗ] Глобальная функция refreshOrders не найдена');
            }

            // Начисляем баллы (за вычетом потраченных при оформлении)
            if (savedProfile) {
              const currentPoints = savedProfile.bonus_points || 0;
              const newPoints = currentPoints + savedEarnedPoints;
              await updateProfile({ bonus_points: newPoints });
              console.log(`[ЗАКАЗ] Начислено ${savedEarnedPoints} бонусов. Новый баланс: ${newPoints}`);
            }

            // Показываем уведомление о доставке
            showNotification({
              type: 'success',
              title: 'Заказ доставлен! 🎉',
              message: `Ваш заказ ${savedOrderNumber} успешно доставлен. Приятного аппетита!`,
              duration: 4000,
            });

            // Добавляем уведомление в историю
            addStoredNotification({
              type: 'delivery',
              title: 'Заказ доставлен! 🎉',
              message: `Ваш заказ ${savedOrderNumber} успешно доставлен. Приятного аппетита!`,
            });

            console.log(`[ЗАКАЗ] Уведомления отправлены`);

            // Показываем уведомление о бонусах
            setTimeout(() => {
              showNotification({
                type: 'info',
                title: `+${savedEarnedPoints} бонусных баллов! 🎁`,
                message: 'Баллы зачислены на ваш счёт',
                duration: 4000,
              });
            }, 2000);
          } catch (error) {
            console.error('[ЗАКАЗ] Ошибка при обновлении статуса заказа:', error);
          }
        }, 60000); // 60 секунд = 1 минута
      } else {
        // Демо-режим
        addDemoBonus(earnedPoints);
        orderNumber = `#${Date.now().toString().slice(-8).toUpperCase()}`;
      }
      
      // Добавляем уведомление "Заказ оформлен" в историю
      addStoredNotification({
        type: 'order',
        title: 'Заказ оформлен! 👨‍🍳',
        message: `Ваш заказ ${orderNumber} принят и готовится. Сумма: ${finalTotal}₽`,
      });
      
      // Показываем всплывающее уведомление
      showNotification({
        type: 'success',
        title: 'Заказ оформлен! 🎉',
        message: `Заказ ${orderNumber}. Сумма: ${finalTotal}₽`,
        duration: 3000,
      });
      
      // Списываем баллы СРАЗУ при оформлении
      if (usePoints && pointsToSpend > 0 && user && profile) {
        const newBalance = (profile.bonus_points || 0) - pointsToSpend;
        await updateProfile({ bonus_points: newBalance });
        console.log(`[ЗАКАЗ] Списано ${pointsToSpend} баллов. Новый баланс: ${newBalance}`);
      }

      clearCart();
      setAppliedPromo(null);
      setUsePoints(false);
      router.push('/orders');
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification({
        type: 'error',
        title: t('error'),
        message: 'Не удалось оформить заказ. Попробуйте снова.',
        duration: 3000,
      });
    }
  };

  const discount = appliedPromo?.discount || 0;
  const deliveryFee = total > 1000 ? 0 : 150;
  const finalTotal = Math.max(0, total - discount - pointsDiscount + deliveryFee);
  const earnedPointsPreview = calculateBonusPoints(finalTotal);

  const styles = createStyles(colors, isDark);

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Корзина</Text>
        </View>
        
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[`${colors.primary}20`, `${colors.primary}05`]}
            style={styles.emptyIconBg}
          >
            <Ionicons name="cart-outline" size={80} color={colors.primary} />
          </LinearGradient>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>Добавьте вкусную выпечку из каталога</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
            <LinearGradient
              colors={colors.gradientOrange}
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
            <Ionicons name="trash-outline" size={22} color={colors.red} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Cart Items */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View key={item.product.id} style={styles.cartItem}>
              <Image 
                source={PRODUCT_IMAGES[item.product.image || 'croissant'] || PRODUCT_IMAGES.croissant} 
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
                    <Ionicons name="remove" size={18} color={colors.primary} />
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
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Free Delivery Banner */}
        {total < 1000 && (
          <View style={styles.deliveryBanner}>
            <View style={styles.deliveryIconBg}>
              <Ionicons name="bicycle" size={24} color={colors.primary} />
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
            <Ionicons name="checkmark-circle" size={24} color={colors.green} />
            <Text style={styles.deliveryFreeText}>Бесплатная доставка! 🎉</Text>
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Промокод</Text>
          </View>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Введите код (BAKERY20)"
              placeholderTextColor={colors.textMuted}
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
              <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              <Text style={styles.appliedPromoText}>
                {appliedPromo.code}: -{appliedPromo.discount}₽
              </Text>
              <TouchableOpacity onPress={() => setAppliedPromo(null)}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Use Points Section */}
        {user && profile && bonusPoints >= 10 && (
          <View style={styles.usePointsSection}>
            <View style={styles.usePointsHeader}>
              <View style={styles.usePointsInfo}>
                <View style={styles.usePointsIconBg}>
                  <Ionicons name="wallet" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.usePointsTitle}>{t('cart_use_points')}</Text>
                  <Text style={styles.usePointsBalance}>
                    {t('cart_points_balance')}: {bonusPoints} ≈ {Math.floor(bonusPoints / 10)}₽
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.usePointsSwitch, usePoints && styles.usePointsSwitchActive]}
                onPress={() => setUsePoints(!usePoints)}
              >
                <View style={[styles.usePointsThumb, usePoints && styles.usePointsThumbActive]} />
              </TouchableOpacity>
            </View>
            {usePoints && (
              <View style={styles.pointsDiscountInfo}>
                <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                <Text style={styles.pointsDiscountText}>
                  {t('cart_points_to_spend')}: {pointsToSpend} баллов (-{pointsDiscount}₽)
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bonus Points Preview */}
        <View style={styles.bonusSection}>
          <View style={styles.bonusHeader}>
            <View style={styles.bonusInfo}>
              <View style={styles.bonusIconBg}>
                <Ionicons name="gift" size={20} color={colors.yellow} />
              </View>
              <View>
                <Text style={styles.bonusTitle}>{t('cart_bonus_earn')}</Text>
                <Text style={styles.bonusEarned}>+{earnedPointsPreview} {t('cart_bonus_points')}</Text>
              </View>
            </View>
            <View style={styles.bonusPercentBadge}>
              <Text style={styles.bonusPercentText}>5%</Text>
            </View>
          </View>
          {profile && (
            <View style={styles.bonusBalanceRow}>
              <Ionicons name="wallet-outline" size={16} color={colors.textMuted} />
              <Text style={styles.bonusBalance}>
                Текущий баланс: {bonusPoints} {t('cart_bonus_points')}
              </Text>
            </View>
          )}
          {!user && (
            <TouchableOpacity 
              style={styles.loginPrompt}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name="log-in-outline" size={16} color={colors.primary} />
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
            <Text style={styles.summaryLabel}>{t('cart_subtotal')} ({itemCount})</Text>
            <Text style={styles.summaryValue}>{total}₽</Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart_discount')}</Text>
              <Text style={[styles.summaryValue, styles.summaryDiscount]}>-{discount}₽</Text>
            </View>
          )}
          {pointsDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('cart_points_discount')}</Text>
              <Text style={[styles.summaryValue, styles.summaryDiscount]}>-{pointsDiscount}₽</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart_delivery')}</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && styles.summaryFree]}>
              {deliveryFee === 0 ? t('cart_free') : `${deliveryFee}₽`}
            </Text>
          </View>
        </View>
        
        <View style={styles.summaryTotal}>
          <View>
            <Text style={styles.totalLabel}>{t('cart_to_pay')}</Text>
            <Text style={styles.totalValue}>{finalTotal}₽</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <LinearGradient
              colors={colors.gradientOrange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkoutGradient}
            >
              <Text style={styles.checkoutText}>{t('cart_checkout')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Header
  header: { height: 64, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemCountBadge: { backgroundColor: `${colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  itemCountText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  clearButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.red}10` },

  scrollView: { flex: 1 },

  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48 },
  emptyIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  emptyButton: { borderRadius: 20, overflow: 'hidden' },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Items List
  itemsList: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  cartItem: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  itemImage: { width: 90, height: 90, borderRadius: 16 },
  itemInfo: { flex: 1, justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 20 },
  itemDescription: { fontSize: 13, color: colors.textMuted },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemPrice: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemMultiplier: { fontSize: 13, color: colors.textMuted },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 12, padding: 4 },
  quantityBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  quantityBtnPlus: { backgroundColor: colors.primary, borderColor: colors.primary },
  quantityText: { fontSize: 16, fontWeight: '700', color: colors.text, minWidth: 32, textAlign: 'center' },
  itemTotal: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  deleteButton: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },

  // Delivery Banner
  deliveryBanner: { marginHorizontal: 16, marginTop: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  deliveryBannerFree: { backgroundColor: `${colors.green}15` },
  deliveryIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  deliveryInfo: { flex: 1 },
  deliveryTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 2 },
  deliveryAmount: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  deliveryProgress: { position: 'absolute', bottom: 0, left: 16, right: 16, height: 3, backgroundColor: colors.border, borderRadius: 2 },
  deliveryProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
  deliveryFreeText: { fontSize: 15, fontWeight: '600', color: colors.green },

  // Promo Section
  promoSection: { marginHorizontal: 16, marginTop: 20, backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  promoInputContainer: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, height: 48, backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, color: colors.text },
  promoButton: { width: 48, height: 48, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  promoButtonDisabled: { backgroundColor: colors.border },
  promoButtonText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  appliedPromo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: `${colors.green}10`, padding: 12, borderRadius: 12 },
  appliedPromoText: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.green },

  // Use Points Section
  usePointsSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  usePointsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  usePointsInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  usePointsIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  usePointsTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  usePointsBalance: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  usePointsSwitch: { width: 52, height: 32, borderRadius: 16, backgroundColor: colors.border, padding: 2, justifyContent: 'center' },
  usePointsSwitchActive: { backgroundColor: colors.primary },
  usePointsThumb: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  usePointsThumbActive: { alignSelf: 'flex-end' },
  pointsDiscountInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  pointsDiscountText: { fontSize: 14, fontWeight: '500', color: colors.green },

  // Bonus Section
  bonusSection: { marginHorizontal: 16, marginTop: 16, backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  bonusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bonusInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bonusIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.yellow}20`, alignItems: 'center', justifyContent: 'center' },
  bonusTitle: { fontSize: 14, color: colors.textMuted },
  bonusEarned: { fontSize: 18, fontWeight: 'bold', color: colors.green },
  bonusPercentBadge: { backgroundColor: `${colors.green}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  bonusPercentText: { fontSize: 14, fontWeight: '600', color: colors.green },
  bonusBalanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  bonusBalance: { fontSize: 14, color: colors.textMuted },
  loginPrompt: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  loginPromptText: { fontSize: 14, color: colors.primary, fontWeight: '500' },

  // Summary
  summaryContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 100, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 12 },
  summaryDetails: { marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: colors.textMuted },
  summaryValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  summaryDiscount: { color: colors.green },
  summaryFree: { color: colors.green },
  summaryTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  checkoutButton: { borderRadius: 16, overflow: 'hidden' },
  checkoutGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 28, paddingVertical: 16 },
  checkoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
