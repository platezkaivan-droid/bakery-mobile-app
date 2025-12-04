import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/context/CartContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useAuth } from '../../src/context/AuthContext';
import { useSettings } from '../../src/context/SettingsContext';
import { supabase } from '../../src/lib/supabase';
import { getLocalizedProduct } from '../../src/utils/getLocalizedProduct';

type FilterTab = 'active' | 'history';
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'transit' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  address: string;
  paymentMethod: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  courierName?: string;
  courierPhone?: string;
  courierRating?: number;
  rating?: number;
  review?: string;
  bonusEarned: number;
}

// Локальные изображения продуктов (полный список)
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


// Пустой список заказов для нового пользователя
const generateMockOrders = (): Order[] => [];

// Временно используем статичные цвета для statusConfig (определён на уровне модуля)
const STATUS_COLORS = {
  yellow: '#FFC107',
  blue: '#2196F3',
  primary: '#FF6B35',
  green: '#4CAF50',
  red: '#F44336',
};

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: { label: 'Готовится 👨‍🍳', color: STATUS_COLORS.primary, bgColor: `${STATUS_COLORS.primary}20`, icon: 'restaurant-outline' },
  confirmed: { label: 'Подтверждён', color: STATUS_COLORS.blue, bgColor: `${STATUS_COLORS.blue}20`, icon: 'checkmark-circle-outline' },
  preparing: { label: 'Готовится', color: STATUS_COLORS.primary, bgColor: `${STATUS_COLORS.primary}20`, icon: 'restaurant-outline' },
  ready: { label: 'Готов к выдаче', color: STATUS_COLORS.green, bgColor: `${STATUS_COLORS.green}20`, icon: 'bag-check-outline' },
  transit: { label: 'В пути', color: STATUS_COLORS.blue, bgColor: `${STATUS_COLORS.blue}20`, icon: 'bicycle-outline' },
  delivered: { label: 'Доставлен', color: STATUS_COLORS.green, bgColor: `${STATUS_COLORS.green}20`, icon: 'checkmark-done-outline' },
  cancelled: { label: 'Отменён', color: STATUS_COLORS.red, bgColor: `${STATUS_COLORS.red}20`, icon: 'close-circle-outline' },
};


export default function OrdersScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { profile } = useAuth();
  const { colors, isDark, language } = useSettings();
  
  const [activeTab, setActiveTab] = useState<FilterTab>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [previousActiveCount, setPreviousActiveCount] = useState(0);

  // Загрузка заказов
  useEffect(() => {
    loadOrders();
    
    // Регистрируем глобальную функцию для принудительного обновления
    (global as any).refreshOrders = () => {
      console.log('[ЗАКАЗЫ] Принудительное обновление через глобальную функцию');
      loadOrders();
    };
    
    // Автоматическое обновление каждую секунду для таймера
    const interval = setInterval(() => {
      loadOrders();
    }, 1000);
    
    return () => {
      clearInterval(interval);
      // Очищаем глобальную функцию при размонтировании
      delete (global as any).refreshOrders;
    };
  }, []);

  // Автоматическое переключение на "История" когда заказ доставлен
  useEffect(() => {
    const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(o.status)).length;
    
    // Если было активных заказов, а теперь нет - переключаем на историю
    if (previousActiveCount > 0 && activeCount === 0 && activeTab === 'active') {
      setActiveTab('history');
      showNotification({
        type: 'success',
        title: 'Заказ доставлен! 🎉',
        message: 'Проверьте историю заказов',
        duration: 3000,
      });
    }
    
    setPreviousActiveCount(activeCount);
  }, [orders]);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            name,
            price,
            quantity,
            image
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ЗАКАЗЫ] Ошибка загрузки:', error);
        setOrders([]);
        return;
      }

      console.log(`[ЗАКАЗЫ] Загружено ${data?.length || 0} заказов`);

      // Преобразуем данные из БД в формат приложения
      const formattedOrders: Order[] = (data || []).map((order: any) => {
        const createdAt = new Date(order.created_at);
        const now = new Date();
        const deliveryTime = new Date(createdAt.getTime() + 60000); // +1 минута
        const timeLeft = Math.max(0, Math.floor((deliveryTime.getTime() - now.getTime()) / 1000));
        
        let estimatedDelivery = '30-40 мин';
        if (order.status === 'pending' || order.status === 'confirmed' || order.status === 'preparing') {
          if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            estimatedDelivery = minutes > 0 ? `${minutes} мин ${seconds} сек` : `${seconds} сек`;
          } else {
            estimatedDelivery = 'Скоро доставят';
          }
        }
        
        return {
          id: order.id,
          orderNumber: `#${order.id.slice(0, 8).toUpperCase()}`,
          date: new Date(order.created_at).toLocaleDateString('ru-RU'),
          time: new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          status: order.status as OrderStatus,
          items: (order.order_items || []).map((item: any) => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: PRODUCT_IMAGES[item.image] || PRODUCT_IMAGES.croissant,
          })),
          subtotal: order.subtotal || 0,
          deliveryFee: order.delivery_fee || 0,
          discount: order.discount || 0,
          totalPrice: order.total_price,
          address: order.delivery_address || 'Адрес не указан',
          paymentMethod: 'Картой онлайн',
          estimatedDelivery,
          bonusEarned: Math.floor(order.total_price * 0.05),
          rating: undefined,
        };
      });

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      loadOrders();
      setRefreshing(false);
      showNotification({ title: 'Заказы обновлены', type: 'info' });
    }, 1000);
  }, []);

  // Фильтрация заказов
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(order.status);
    }
    return ['delivered', 'cancelled'].includes(order.status);
  });

  const activeCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(o.status)).length;
  const historyCount = orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length;
  
  console.log(`[ЗАКАЗЫ] Вкладка: ${activeTab}, Всего: ${orders.length}, Активных: ${activeCount}, История: ${historyCount}, Показано: ${filteredOrders.length}`);

  // Активный заказ (в пути)
  const activeOrder = orders.find(o => o.status === 'transit');

  // Повторить заказ
  const handleRepeatOrder = (order: Order) => {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
        });
      }
    });
    showNotification({ 
      title: 'Товары добавлены в корзину', 
      message: `${order.items.reduce((sum, i) => sum + i.quantity, 0)} позиций`,
      type: 'success' 
    });
    setShowOrderDetail(false);
    router.push('/(tabs)/cart');
  };

  // Отмена заказа
  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = () => {
    if (orderToCancel) {
      setOrders(prev => prev.map(o => 
        o.id === orderToCancel.id ? { ...o, status: 'cancelled' as OrderStatus } : o
      ));
      showNotification({ 
        title: 'Заказ отменён', 
        message: `Заказ ${orderToCancel.orderNumber} успешно отменён`,
        type: 'info' 
      });
      setShowCancelConfirm(false);
      setOrderToCancel(null);
      setShowOrderDetail(false);
    }
  };

  // Оценка заказа
  const handleRateOrder = (order: Order) => {
    setRatingOrder(order);
    setSelectedRating(order.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (ratingOrder && selectedRating > 0) {
      try {
        // Сохраняем оценку в БД
        const { error } = await supabase
          .from('orders')
          .update({ rating: selectedRating })
          .eq('id', ratingOrder.id);

        if (error) throw error;

        // Обновляем локальное состояние
        setOrders(prev => prev.map(o => 
          o.id === ratingOrder.id ? { ...o, rating: selectedRating } : o
        ));
        
        showNotification({ 
          title: 'Спасибо за оценку!', 
          message: `Вы поставили ${selectedRating} звёзд`,
          type: 'success' 
        });
        
        setShowRatingModal(false);
        setRatingOrder(null);
      } catch (error) {
        console.error('Ошибка сохранения оценки:', error);
        showNotification({ 
          title: 'Ошибка', 
          message: 'Не удалось сохранить оценку',
          type: 'error' 
        });
      }
    }
  };

  // Открыть детали заказа
  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Отследить заказ
  const handleTrackOrder = () => {
    setShowOrderDetail(false);
    router.push('/(tabs)/tracking');
  };

  // Позвонить курьеру
  const handleCallCourier = (phone: string) => {
    showNotification({ title: `Звонок: ${phone}`, type: 'info' });
  };

  // Связаться с поддержкой
  const handleContactSupport = () => {
    showNotification({ title: 'Поддержка', message: 'Оператор ответит в течение минуты', type: 'info' });
  };

  const styles = createStyles(colors, isDark);

  // Рендер модалки деталей заказа
  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;
    const status = statusConfig[selectedOrder.status];
    const canCancel = ['pending', 'confirmed'].includes(selectedOrder.status);
    const canRate = selectedOrder.status === 'delivered' && !selectedOrder.rating;
    const isActive = ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(selectedOrder.status);

    return (
      <Modal visible={showOrderDetail} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalOrderNumber}>{selectedOrder.orderNumber}</Text>
                <Text style={styles.modalOrderDate}>{selectedOrder.date}, {selectedOrder.time}</Text>
              </View>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowOrderDetail(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Status */}
              <View style={[styles.statusCard, { backgroundColor: status.bgColor }]}>
                <Ionicons name={status.icon as any} size={24} color={status.color} />
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                  {selectedOrder.estimatedDelivery && isActive && (
                    <Text style={styles.statusTime}>Ожидаемое время: {selectedOrder.estimatedDelivery}</Text>
                  )}
                  {selectedOrder.actualDelivery && selectedOrder.status === 'delivered' && (
                    <Text style={styles.statusTime}>Доставлен в {selectedOrder.actualDelivery}</Text>
                  )}
                </View>
              </View>

              {/* Courier Info (for active orders) */}
              {selectedOrder.courierName && isActive && (
                <View style={styles.courierSection}>
                  <Text style={styles.sectionTitle}>Курьер</Text>
                  <View style={styles.courierCard}>
                    <View style={styles.courierAvatar}>
                      <Text style={styles.courierInitial}>{selectedOrder.courierName[0]}</Text>
                    </View>
                    <View style={styles.courierInfo}>
                      <Text style={styles.courierName}>{selectedOrder.courierName}</Text>
                      <View style={styles.courierRating}>
                        <Ionicons name="star" size={14} color={colors.yellow} />
                        <Text style={styles.courierRatingText}>{selectedOrder.courierRating}</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.callButton}
                      onPress={() => handleCallCourier(selectedOrder.courierPhone!)}
                    >
                      <Ionicons name="call" size={20} color={colors.green} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Order Items */}
              <View style={styles.itemsSection}>
                <Text style={styles.sectionTitle}>Состав заказа</Text>
                {selectedOrder.items.map((item, index) => {
                  const localizedItem = getLocalizedProduct(item, language);
                  return (
                    <View key={index} style={styles.orderItem}>
                      <Image source={item.image} style={styles.itemImage} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{localizedItem.name}</Text>
                        <Text style={styles.itemQuantity}>{item.quantity} шт × {item.price}₽</Text>
                      </View>
                      <Text style={styles.itemTotal}>{item.price * item.quantity}₽</Text>
                    </View>
                  );
                })}
              </View>

              {/* Price Breakdown */}
              <View style={styles.priceSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Товары</Text>
                  <Text style={styles.priceValue}>{selectedOrder.subtotal}₽</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Доставка</Text>
                  <Text style={[styles.priceValue, selectedOrder.deliveryFee === 0 && styles.priceFree]}>
                    {selectedOrder.deliveryFee === 0 ? 'Бесплатно' : `${selectedOrder.deliveryFee}₽`}
                  </Text>
                </View>
                {selectedOrder.discount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Скидка</Text>
                    <Text style={[styles.priceValue, styles.priceDiscount]}>-{selectedOrder.discount}₽</Text>
                  </View>
                )}
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Итого</Text>
                  <Text style={styles.totalValue}>{selectedOrder.totalPrice}₽</Text>
                </View>
                {selectedOrder.bonusEarned > 0 && selectedOrder.status === 'delivered' && (
                  <View style={styles.bonusRow}>
                    <Ionicons name="gift" size={16} color={colors.green} />
                    <Text style={styles.bonusText}>+{selectedOrder.bonusEarned} бонусных баллов</Text>
                  </View>
                )}
              </View>

              {/* Delivery Info */}
              <View style={styles.deliverySection}>
                <Text style={styles.sectionTitle}>Доставка</Text>
                <View style={styles.deliveryRow}>
                  <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                  <Text style={styles.deliveryText}>{selectedOrder.address}</Text>
                </View>
                <View style={styles.deliveryRow}>
                  <Ionicons name="card-outline" size={20} color={colors.textMuted} />
                  <Text style={styles.deliveryText}>{selectedOrder.paymentMethod}</Text>
                </View>
              </View>

              {/* Rating (for delivered orders) */}
              {selectedOrder.status === 'delivered' && selectedOrder.rating && (
                <View style={styles.ratingSection}>
                  <Text style={styles.sectionTitle}>Ваша оценка</Text>
                  <View style={styles.ratingDisplay}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Ionicons 
                        key={star} 
                        name={star <= selectedOrder.rating! ? 'star' : 'star-outline'} 
                        size={24} 
                        color={colors.yellow} 
                      />
                    ))}
                  </View>
                  {selectedOrder.review && (
                    <Text style={styles.reviewText}>"{selectedOrder.review}"</Text>
                  )}
                </View>
              )}

              <View style={{ height: 24 }} />
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              {isActive && selectedOrder.status === 'transit' && (
                <TouchableOpacity style={styles.trackBtn} onPress={handleTrackOrder}>
                  <LinearGradient colors={colors.gradientOrange} style={styles.trackBtnGradient}>
                    <Ionicons name="location" size={20} color="#fff" />
                    <Text style={styles.trackBtnText}>Отследить</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {canCancel && (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelOrder(selectedOrder)}>
                  <Text style={styles.cancelBtnText}>Отменить заказ</Text>
                </TouchableOpacity>
              )}

              {canRate && (
                <TouchableOpacity style={styles.rateBtn} onPress={() => handleRateOrder(selectedOrder)}>
                  <Ionicons name="star-outline" size={20} color={colors.primary} />
                  <Text style={styles.rateBtnText}>Оценить заказ</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.repeatBtn} onPress={() => handleRepeatOrder(selectedOrder)}>
                <Ionicons name="refresh" size={20} color={colors.primary} />
                <Text style={styles.repeatBtnText}>Повторить заказ</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportBtn} onPress={handleContactSupport}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
                <Text style={styles.supportBtnText}>Связаться с поддержкой</Text>
              </TouchableOpacity>
            </View>

            {/* Модалка подтверждения отмены ВНУТРИ деталей заказа */}
            {showCancelConfirm && orderToCancel?.id === selectedOrder.id && (
              <View style={styles.cancelConfirmOverlay}>
                <View style={styles.cancelConfirmContent}>
                  <Ionicons name="warning-outline" size={48} color={colors.red} style={{ marginBottom: 16 }} />
                  <Text style={styles.cancelConfirmTitle}>Отменить заказ?</Text>
                  <Text style={styles.cancelConfirmText}>
                    Заказ {selectedOrder.orderNumber} будет отменён. Это действие нельзя отменить.
                  </Text>

                  <View style={styles.cancelConfirmActions}>
                    <TouchableOpacity style={styles.cancelConfirmNoBtn} onPress={() => setShowCancelConfirm(false)}>
                      <Text style={styles.cancelConfirmNoText}>Нет, оставить</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelConfirmYesBtn} onPress={confirmCancelOrder}>
                      <Text style={styles.cancelConfirmYesText}>Да, отменить</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };


  // Рендер модалки оценки
  const renderRatingModal = () => (
    <Modal visible={showRatingModal} animationType="fade" transparent>
      <View style={styles.ratingModalOverlay}>
        <View style={styles.ratingModalContent}>
          <Text style={styles.ratingModalTitle}>Оцените заказ</Text>
          <Text style={styles.ratingModalSubtitle}>{ratingOrder?.orderNumber}</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                <Ionicons 
                  name={star <= selectedRating ? 'star' : 'star-outline'} 
                  size={40} 
                  color={colors.yellow} 
                />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.ratingHint}>
            {selectedRating === 0 && 'Нажмите на звезду'}
            {selectedRating === 1 && 'Ужасно 😞'}
            {selectedRating === 2 && 'Плохо 😕'}
            {selectedRating === 3 && 'Нормально 😐'}
            {selectedRating === 4 && 'Хорошо 🙂'}
            {selectedRating === 5 && 'Отлично! 🤩'}
          </Text>

          <View style={styles.ratingModalActions}>
            <TouchableOpacity style={styles.ratingCancelBtn} onPress={() => setShowRatingModal(false)}>
              <Text style={styles.ratingCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.ratingSubmitBtn, selectedRating === 0 && styles.ratingSubmitDisabled]} 
              onPress={submitRating}
              disabled={selectedRating === 0}
            >
              <Text style={styles.ratingSubmitText}>Отправить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );



  // Пустое состояние
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}05`]}
        style={styles.emptyIconBg}
      >
        <Ionicons 
          name={activeTab === 'active' ? 'time-outline' : 'receipt-outline'} 
          size={80} 
          color={colors.primary} 
        />
      </LinearGradient>
      <Text style={styles.emptyTitle}>
        {activeTab === 'active' ? 'Нет активных заказов' : 'История пуста'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'active' 
          ? 'Закажите свежую выпечку прямо сейчас!' 
          : 'Здесь появятся ваши завершённые заказы'
        }
      </Text>
      {activeTab === 'active' && (
        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/home')}>
          <LinearGradient colors={colors.gradientOrange} style={styles.emptyButtonGradient}>
            <Ionicons name="storefront-outline" size={20} color="#fff" />
            <Text style={styles.emptyButtonText}>Перейти в каталог</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderOrderDetailModal()}
      {renderRatingModal()}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Мои заказы</Text>
        <View style={styles.headerActions}>
          {activeCount > 0 && activeTab === 'active' && (
            <TouchableOpacity 
              style={styles.clearAllBtn} 
              onPress={async () => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  
                  // Получаем ID активных заказов
                  const activeOrderIds = orders
                    .filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(o.status))
                    .map(o => o.id);
                  
                  if (activeOrderIds.length === 0) return;
                  
                  // Удаляем только активные заказы
                  const { error } = await supabase
                    .from('orders')
                    .delete()
                    .in('id', activeOrderIds);
                  
                  if (error) throw error;
                  
                  // Обновляем список
                  setOrders(prev => prev.filter(o => !activeOrderIds.includes(o.id)));
                  
                  showNotification({ 
                    title: `Удалено ${activeOrderIds.length} активных заказов`, 
                    type: 'info' 
                  });
                } catch (error) {
                  console.error('Error deleting active orders:', error);
                  showNotification({ 
                    title: 'Ошибка удаления', 
                    type: 'error' 
                  });
                }
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.red} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={handleContactSupport}>
            <Ionicons name="headset-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Активные
          </Text>
          {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(o.status)).length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'active' && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === 'active' && styles.tabBadgeTextActive]}>
                {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'transit'].includes(o.status)).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            История
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Active Order Banner */}
        {activeTab === 'active' && activeOrder && (
          <TouchableOpacity onPress={() => openOrderDetail(activeOrder)}>
            <LinearGradient
              colors={colors.gradientOrange}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.activeOrderBanner}
            >
              <View style={styles.activeOrderHeader}>
                <View>
                  <Text style={styles.activeOrderLabel}>Заказ в пути</Text>
                  <Text style={styles.activeOrderNumber}>{activeOrder.orderNumber}</Text>
                </View>
                <View style={styles.activeOrderTime}>
                  <Ionicons name="time" size={16} color="#fff" />
                  <Text style={styles.activeOrderTimeText}>{activeOrder.estimatedDelivery}</Text>
                </View>
              </View>

              <View style={styles.activeOrderProgress}>
                <View style={styles.progressDot} />
                <View style={styles.progressLine} />
                <View style={styles.progressDot} />
                <View style={styles.progressLine} />
                <View style={[styles.progressDot, styles.progressDotActive]} />
                <View style={[styles.progressLine, styles.progressLineInactive]} />
                <View style={[styles.progressDot, styles.progressDotInactive]} />
              </View>

              <View style={styles.activeOrderFooter}>
                <View style={styles.courierMini}>
                  <View style={styles.courierMiniAvatar}>
                    <Text style={styles.courierMiniInitial}>{activeOrder.courierName?.[0]}</Text>
                  </View>
                  <Text style={styles.courierMiniName}>{activeOrder.courierName}</Text>
                </View>
                <View style={styles.trackMiniBtn}>
                  <Text style={styles.trackMiniBtnText}>Отследить</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <View style={styles.ordersList}>
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => openOrderDetail(order)}
                  activeOpacity={0.7}
                >
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderDate}>{order.date}, {order.time}</Text>
                      {order.status === 'pending' && order.estimatedDelivery && (
                        <View style={styles.timerBadge}>
                          <Ionicons name="time" size={12} color={colors.primary} />
                          <Text style={styles.timerText}>{order.estimatedDelivery}</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                      <Ionicons name={status.icon as any} size={14} color={status.color} />
                      <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>

                  {/* Product Thumbnails */}
                  <View style={styles.thumbnailsContainer}>
                    {order.items.slice(0, 4).map((item, index) => (
                      <View key={index} style={styles.thumbnailWrapper}>
                        <Image source={item.image} style={styles.thumbnail} />
                        {item.quantity > 1 && (
                          <View style={styles.thumbnailBadge}>
                            <Text style={styles.thumbnailBadgeText}>×{item.quantity}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    {order.items.length > 4 && (
                      <View style={styles.moreItems}>
                        <Text style={styles.moreItemsText}>+{order.items.length - 4}</Text>
                      </View>
                    )}
                  </View>

                  {/* Footer */}
                  <View style={styles.orderFooter}>
                    <View>
                      <Text style={styles.orderTotal}>{order.totalPrice}₽</Text>
                      <Text style={styles.orderItemCount}>
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)} товаров
                      </Text>
                    </View>
                    <View style={styles.orderActions}>
                      {order.status === 'delivered' && !order.rating && (
                        <TouchableOpacity 
                          style={styles.rateSmallBtn}
                          onPress={(e) => { e.stopPropagation(); handleRateOrder(order); }}
                        >
                          <Ionicons name="star-outline" size={16} color={colors.yellow} />
                        </TouchableOpacity>
                      )}
                      {order.status === 'delivered' && order.rating && (
                        <View style={styles.ratedBadge}>
                          <Ionicons name="star" size={14} color={colors.yellow} />
                          <Text style={styles.ratedText}>{order.rating}</Text>
                        </View>
                      )}
                      <TouchableOpacity 
                        style={styles.repeatSmallBtn}
                        onPress={(e) => { e.stopPropagation(); handleRepeatOrder(order); }}
                      >
                        <Ionicons name="refresh" size={16} color={colors.primary} />
                        <Text style={styles.repeatSmallText}>Повторить</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          renderEmptyState()
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}


const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Header
  header: { height: 64, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clearAllBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: `${colors.red}15` },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },

  // Tabs
  tabsContainer: { flexDirection: 'row', marginHorizontal: 24, marginTop: 16, gap: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 16, backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: '#fff' },
  tabBadge: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  tabBadgeTextActive: { color: '#fff' },

  scrollView: { flex: 1 },

  // Active Order Banner
  activeOrderBanner: { marginHorizontal: 24, marginTop: 24, borderRadius: 24, padding: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8 },
  activeOrderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  activeOrderLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  activeOrderNumber: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  activeOrderTime: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  activeOrderTimeText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  activeOrderProgress: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff' },
  progressDotActive: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#fff', backgroundColor: 'transparent' },
  progressDotInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#fff', marginHorizontal: 4 },
  progressLineInactive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  activeOrderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  courierMini: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courierMiniAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  courierMiniInitial: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  courierMiniName: { fontSize: 14, fontWeight: '500', color: '#fff' },
  trackMiniBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  trackMiniBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Orders List
  ordersList: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  orderCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderNumber: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  orderDate: { fontSize: 13, color: colors.textMuted },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: `${colors.primary}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  timerText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  thumbnailsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  thumbnailWrapper: { position: 'relative' },
  thumbnail: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.background },
  thumbnailBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  thumbnailBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  moreItems: { width: 56, height: 56, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  moreItemsText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  orderTotal: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  orderItemCount: { fontSize: 13, color: colors.textMuted },
  orderActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rateSmallBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.yellow}20`, alignItems: 'center', justifyContent: 'center' },
  ratedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${colors.yellow}20`, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  ratedText: { fontSize: 13, fontWeight: '600', color: colors.text },
  repeatSmallBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: `${colors.primary}15`, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  repeatSmallText: { fontSize: 13, fontWeight: '600', color: colors.primary },


  // Empty State
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 80 },
  emptyIconBg: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 12, textAlign: 'center' },
  emptyText: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  emptyButton: { borderRadius: 20, overflow: 'hidden' },
  emptyButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 32, paddingVertical: 16 },
  emptyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOrderNumber: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  modalOrderDate: { fontSize: 14, color: colors.textMuted },
  modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  modalBody: { paddingHorizontal: 24 },
  modalActions: { padding: 24, gap: 12, borderTopWidth: 1, borderTopColor: colors.border },

  // Status Card
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 16, marginTop: 16 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  statusTime: { fontSize: 13, color: colors.textMuted },

  // Courier Section
  courierSection: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  courierCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  courierAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  courierInitial: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  courierInfo: { flex: 1 },
  courierName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  courierRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  courierRatingText: { fontSize: 14, color: colors.text },
  callButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.green}20`, alignItems: 'center', justifyContent: 'center' },

  // Items Section
  itemsSection: { marginTop: 24 },
  orderItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemImage: { width: 56, height: 56, borderRadius: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500', color: colors.text, marginBottom: 4 },
  itemQuantity: { fontSize: 13, color: colors.textMuted },
  itemTotal: { fontSize: 15, fontWeight: '600', color: colors.text },

  // Price Section
  priceSection: { marginTop: 24, backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: colors.textMuted },
  priceValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  priceFree: { color: colors.green },
  priceDiscount: { color: colors.green },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  bonusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  bonusText: { fontSize: 14, fontWeight: '500', color: colors.green },

  // Delivery Section
  deliverySection: { marginTop: 24 },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  deliveryText: { fontSize: 14, color: colors.text, flex: 1 },

  // Rating Section
  ratingSection: { marginTop: 24, backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  ratingDisplay: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  reviewText: { fontSize: 14, color: colors.textMuted, fontStyle: 'italic' },

  // Action Buttons
  trackBtn: { borderRadius: 16, overflow: 'hidden' },
  trackBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  trackBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelBtn: { borderWidth: 1, borderColor: colors.red, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.red },
  rateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.primary, borderRadius: 16, paddingVertical: 14 },
  rateBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  repeatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: `${colors.primary}15`, borderRadius: 16, paddingVertical: 14 },
  repeatBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  supportBtnText: { fontSize: 14, color: colors.textMuted },

  // Rating Modal
  ratingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  ratingModalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 32, width: '100%', alignItems: 'center' },
  ratingModalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  ratingModalSubtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  ratingHint: { fontSize: 16, color: colors.text, marginBottom: 24 },
  ratingModalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  ratingCancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16, backgroundColor: colors.background },
  ratingCancelText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  ratingSubmitBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16, backgroundColor: colors.primary },
  ratingSubmitDisabled: { backgroundColor: colors.border },
  ratingSubmitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  
  // Cancel Confirm Modal (внутри деталей заказа)
  cancelConfirmOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 9999, elevation: 10 },
  cancelConfirmContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, alignItems: 'center' },
  cancelConfirmTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  cancelConfirmText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  cancelConfirmActions: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelConfirmNoBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  cancelConfirmNoText: { fontSize: 15, fontWeight: '600', color: colors.text },
  cancelConfirmYesBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 16, backgroundColor: colors.red },
  cancelConfirmYesText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
