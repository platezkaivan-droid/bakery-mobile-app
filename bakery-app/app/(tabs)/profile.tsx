import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, Modal, TextInput, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useNotification } from '../../src/context/NotificationContext';
import { useDemoBonus } from '../../src/context/DemoBonusContext';
import { useSettings, Address, PaymentMethod, ThemeMode, Language } from '../../src/context/SettingsContext';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { showNotification } = useNotification();
  const { demoBonusPoints } = useDemoBonus();
  const { 
    colors, isDark, themeMode, setThemeMode,
    language, setLanguage, t,
    addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
    paymentMethods, addPaymentMethod, deletePaymentMethod, setDefaultPaymentMethod,
    notificationsEnabled, setNotificationsEnabled,
  } = useSettings();
  
  // Модалки
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  // Форма нового адреса
  const [newAddress, setNewAddress] = useState({
    title: 'Дом',
    address: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    comment: '',
  });
  
  // Форма новой карты
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Баллы
  const currentPoints = user ? (profile?.bonus_points || 0) : demoBonusPoints;
  
  // Система лояльности на основе количества заказов
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Загружаем количество заказов
  React.useEffect(() => {
    const loadOrdersCount = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'delivered');
        
        if (!error && count !== null) {
          setTotalOrders(count);
        }
      } catch (error) {
        console.error('Error loading orders count:', error);
      }
    };
    
    loadOrdersCount();
  }, [user]);
  
  // Определяем уровень и скидку на основе количества заказов
  const getLoyaltyInfo = () => {
    if (totalOrders >= 500) {
      return { 
        level: t('profile_gold'), 
        discount: 8, 
        color: '#FFD700', 
        icon: 'trophy' as const,
        nextLevel: null,
        ordersToNext: 0,
        progress: 100
      };
    } else if (totalOrders >= 150) {
      return { 
        level: t('profile_silver'), 
        discount: 5, 
        color: '#C0C0C0', 
        icon: 'medal' as const,
        nextLevel: t('profile_gold'),
        ordersToNext: 500 - totalOrders,
        progress: (totalOrders / 500) * 100
      };
    } else if (totalOrders >= 20) {
      return { 
        level: t('profile_bronze'), 
        discount: 2, 
        color: '#CD7F32', 
        icon: 'ribbon' as const,
        nextLevel: t('profile_silver'),
        ordersToNext: 150 - totalOrders,
        progress: (totalOrders / 150) * 100
      };
    } else {
      return { 
        level: t('profile_newbie'), 
        discount: 0, 
        color: colors.textMuted, 
        icon: 'star-outline' as const,
        nextLevel: t('profile_bronze'),
        ordersToNext: 20 - totalOrders,
        progress: (totalOrders / 20) * 100
      };
    }
  };
  
  const loyaltyInfo = getLoyaltyInfo();
  
  const userName = profile?.full_name || t('profile_guest');
  const userEmail = user?.email || t('profile_login');
  const userPhone = profile?.phone || '';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase() || 'Г';

  const handleSignOut = async () => {
    Alert.alert(t('menu_logout'), t('confirm') + '?', [
      { text: t('cancel'), style: 'cancel' },
      { 
        text: t('menu_logout'), 
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            showNotification({ title: t('success'), type: 'info' });
            router.replace('/auth/login');
          } catch (error) {
            showNotification({ title: t('error'), type: 'error' });
          }
        }
      },
    ]);
  };

  const handleSaveAddress = () => {
    if (!newAddress.address.trim()) {
      showNotification({ title: t('error'), message: t('addresses_street'), type: 'error' });
      return;
    }
    
    if (editingAddress) {
      updateAddress(editingAddress.id, { ...newAddress, isDefault: editingAddress.isDefault });
      showNotification({ title: t('success'), type: 'success' });
    } else {
      addAddress({ ...newAddress, isDefault: addresses.length === 0 });
      showNotification({ title: t('addresses_add'), type: 'success' });
    }
    
    setShowAddAddressModal(false);
    setEditingAddress(null);
    setNewAddress({ title: 'Дом', address: '', apartment: '', entrance: '', floor: '', intercom: '', comment: '' });
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setNewAddress({
      title: addr.title,
      address: addr.address,
      apartment: addr.apartment || '',
      entrance: addr.entrance || '',
      floor: addr.floor || '',
      intercom: addr.intercom || '',
      comment: addr.comment || '',
    });
    setShowAddAddressModal(true);
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(t('delete'), t('confirm') + '?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => {
        deleteAddress(id);
        showNotification({ title: t('success'), type: 'info' });
      }},
    ]);
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardBrand = (number: string): 'visa' | 'mastercard' | 'mir' => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return 'mir';
  };

  const handleSaveCard = () => {
    const cleanedNumber = newCard.cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length !== 16) {
      showNotification({ title: t('error'), message: t('payment_card_number'), type: 'error' });
      return;
    }
    if (!newCard.cardHolder.trim()) {
      showNotification({ title: t('error'), message: t('payment_card_holder'), type: 'error' });
      return;
    }
    if (newCard.expiryDate.length !== 5) {
      showNotification({ title: t('error'), message: t('payment_expiry'), type: 'error' });
      return;
    }
    
    addPaymentMethod({
      type: 'card',
      last4: cleanedNumber.slice(-4),
      brand: getCardBrand(cleanedNumber),
      cardHolder: newCard.cardHolder.toUpperCase(),
      expiryDate: newCard.expiryDate,
      isDefault: paymentMethods.filter(p => p.type === 'card').length === 0,
    });
    
    showNotification({ title: t('payment_add_card'), type: 'success' });
    setShowAddCardModal(false);
    setNewCard({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(t('delete'), t('confirm') + '?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => {
        deletePaymentMethod(id);
        showNotification({ title: t('success'), type: 'info' });
      }},
    ]);
  };

  const styles = createStyles(colors);


  // Модалка адресов
  const renderAddressModal = () => (
    <Modal visible={showAddressModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('addresses_title')}</Text>
            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {addresses.map(addr => (
              <View key={addr.id} style={styles.addressCard}>
                <TouchableOpacity style={styles.addressInfo} onPress={() => handleEditAddress(addr)}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressIconBg}>
                      <Ionicons name={addr.title === 'Работа' ? 'briefcase' : addr.title === 'Дом' ? 'home' : 'location'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressTitle}>{addr.title}</Text>
                      {addr.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>{t('addresses_default')}</Text></View>}
                    </View>
                  </View>
                  <Text style={styles.addressText}>{addr.address}{addr.apartment ? `, ${t('addresses_apartment')} ${addr.apartment}` : ''}</Text>
                  {addr.entrance && <Text style={styles.addressDetails}>{t('addresses_entrance')} {addr.entrance}, {t('addresses_floor')} {addr.floor}</Text>}
                </TouchableOpacity>
                <View style={styles.addressActions}>
                  {!addr.isDefault && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => { setDefaultAddress(addr.id); showNotification({ title: t('success'), type: 'success' }); }}>
                      <Ionicons name="checkmark-circle-outline" size={22} color={colors.green} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditAddress(addr)}>
                    <Ionicons name="create-outline" size={22} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteAddress(addr.id)}>
                    <Ionicons name="trash-outline" size={22} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingAddress(null); setShowAddAddressModal(true); }}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>{t('addresses_add')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Модалка добавления/редактирования адреса
  const renderAddAddressModal = () => (
    <Modal visible={showAddAddressModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingAddress ? t('addresses_edit') : t('addresses_add')}</Text>
            <TouchableOpacity onPress={() => { setShowAddAddressModal(false); setEditingAddress(null); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>{t('addresses_name')}</Text>
            <View style={styles.addressTypeRow}>
              {[{ id: 'Дом', icon: 'home' }, { id: 'Работа', icon: 'briefcase' }, { id: 'Другое', icon: 'location' }].map(type => (
                <TouchableOpacity 
                  key={type.id} 
                  style={[styles.addressTypeBtn, newAddress.title === type.id && styles.addressTypeBtnActive]}
                  onPress={() => setNewAddress(prev => ({ ...prev, title: type.id }))}
                >
                  <Ionicons name={type.icon as any} size={20} color={newAddress.title === type.id ? '#fff' : colors.text} />
                  <Text style={[styles.addressTypeText, newAddress.title === type.id && styles.addressTypeTextActive]}>
                    {type.id === 'Дом' ? t('addresses_home') : type.id === 'Работа' ? t('addresses_work') : t('addresses_other')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>{t('addresses_street')} *</Text>
            <TextInput
              style={styles.input}
              placeholder="ул. Пушкина, д. 10"
              placeholderTextColor={colors.textMuted}
              value={newAddress.address}
              onChangeText={v => setNewAddress(prev => ({ ...prev, address: v }))}
            />
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('addresses_apartment')}</Text>
                <TextInput style={styles.input} placeholder="25" placeholderTextColor={colors.textMuted} value={newAddress.apartment} onChangeText={v => setNewAddress(prev => ({ ...prev, apartment: v }))} keyboardType="numeric" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('addresses_entrance')}</Text>
                <TextInput style={styles.input} placeholder="2" placeholderTextColor={colors.textMuted} value={newAddress.entrance} onChangeText={v => setNewAddress(prev => ({ ...prev, entrance: v }))} keyboardType="numeric" />
              </View>
            </View>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('addresses_floor')}</Text>
                <TextInput style={styles.input} placeholder="5" placeholderTextColor={colors.textMuted} value={newAddress.floor} onChangeText={v => setNewAddress(prev => ({ ...prev, floor: v }))} keyboardType="numeric" />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('addresses_intercom')}</Text>
                <TextInput style={styles.input} placeholder="25" placeholderTextColor={colors.textMuted} value={newAddress.intercom} onChangeText={v => setNewAddress(prev => ({ ...prev, intercom: v }))} />
              </View>
            </View>
            
            <Text style={styles.inputLabel}>{t('addresses_comment')}</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder={t('addresses_comment')}
              placeholderTextColor={colors.textMuted}
              value={newAddress.comment}
              onChangeText={v => setNewAddress(prev => ({ ...prev, comment: v }))}
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <LinearGradient colors={colors.gradientOrange} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Модалка оплаты
  const renderPaymentModal = () => (
    <Modal visible={showPaymentModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('payment_title')}</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {paymentMethods.filter(p => p.type === 'card').map(method => (
              <View key={method.id} style={styles.paymentCard}>
                <View style={styles.paymentInfo}>
                  <View style={[styles.cardBrandBg, { backgroundColor: method.brand === 'visa' ? '#1A1F71' : method.brand === 'mastercard' ? '#EB001B' : '#4DB45E' }]}>
                    <Text style={styles.cardBrandText}>{method.brand?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentTitle}>•••• •••• •••• {method.last4}</Text>
                    <Text style={styles.paymentSubtitle}>{method.cardHolder} · {method.expiryDate}</Text>
                    {method.isDefault && <Text style={styles.paymentDefault}>{t('payment_default')}</Text>}
                  </View>
                </View>
                <View style={styles.paymentActions}>
                  {!method.isDefault && (
                    <TouchableOpacity onPress={() => { setDefaultPaymentMethod(method.id); showNotification({ title: t('success'), type: 'success' }); }}>
                      <Ionicons name="checkmark-circle-outline" size={22} color={colors.green} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDeletePayment(method.id)}>
                    <Ionicons name="trash-outline" size={22} color={colors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddCardModal(true)}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.addButtonText}>{t('payment_add_card')}</Text>
            </TouchableOpacity>
            
            <Text style={styles.sectionTitle}>{t('payment_other_methods')}</Text>
            
            {[
              { type: 'apple_pay', icon: 'logo-apple', name: t('payment_apple_pay') },
              { type: 'google_pay', icon: 'logo-google', name: t('payment_google_pay') },
              { type: 'cash', icon: 'cash-outline', name: t('payment_cash') },
            ].map(method => {
              const existing = paymentMethods.find(p => p.type === method.type);
              return (
                <View key={method.type} style={styles.otherPaymentRow}>
                  <View style={styles.otherPaymentInfo}>
                    <Ionicons name={method.icon as any} size={24} color={colors.text} />
                    <Text style={styles.otherPaymentText}>{method.name}</Text>
                  </View>
                  <Switch
                    value={!!existing}
                    onValueChange={(enabled) => {
                      if (enabled) {
                        addPaymentMethod({ type: method.type as any, isDefault: false });
                      } else if (existing) {
                        deletePaymentMethod(existing.id);
                      }
                    }}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );


  // Модалка добавления карты
  const renderAddCardModal = () => (
    <Modal visible={showAddCardModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('payment_add_card')}</Text>
            <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Превью карты */}
            <LinearGradient colors={['#1A1F71', '#4B5EAA']} style={styles.cardPreview}>
              <View style={styles.cardPreviewTop}>
                <Ionicons name="card" size={32} color="#fff" />
                <Text style={styles.cardBrand}>{getCardBrand(newCard.cardNumber.replace(/\s/g, '')).toUpperCase()}</Text>
              </View>
              <Text style={styles.cardPreviewNumber}>{newCard.cardNumber || '•••• •••• •••• ••••'}</Text>
              <View style={styles.cardPreviewBottom}>
                <View>
                  <Text style={styles.cardPreviewLabel}>{t('payment_card_holder')}</Text>
                  <Text style={styles.cardPreviewValue}>{newCard.cardHolder || 'YOUR NAME'}</Text>
                </View>
                <View>
                  <Text style={styles.cardPreviewLabel}>{t('payment_expiry')}</Text>
                  <Text style={styles.cardPreviewValue}>{newCard.expiryDate || 'MM/YY'}</Text>
                </View>
              </View>
            </LinearGradient>
            
            <Text style={styles.inputLabel}>{t('payment_card_number')}</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor={colors.textMuted}
              value={newCard.cardNumber}
              onChangeText={v => setNewCard(prev => ({ ...prev, cardNumber: formatCardNumber(v) }))}
              keyboardType="numeric"
              maxLength={19}
            />
            
            <Text style={styles.inputLabel}>{t('payment_card_holder')}</Text>
            <TextInput
              style={styles.input}
              placeholder="IVAN IVANOV"
              placeholderTextColor={colors.textMuted}
              value={newCard.cardHolder}
              onChangeText={v => setNewCard(prev => ({ ...prev, cardHolder: v.toUpperCase() }))}
              autoCapitalize="characters"
            />
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('payment_expiry')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textMuted}
                  value={newCard.expiryDate}
                  onChangeText={v => setNewCard(prev => ({ ...prev, expiryDate: formatExpiryDate(v) }))}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>{t('payment_cvv')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  placeholderTextColor={colors.textMuted}
                  value={newCard.cvv}
                  onChangeText={v => setNewCard(prev => ({ ...prev, cvv: v.replace(/\D/g, '').substring(0, 3) }))}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCard}>
              <LinearGradient colors={colors.gradientOrange} style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>{t('save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Модалка языка
  const renderLanguageModal = () => (
    <Modal visible={showLanguageModal} animationType="fade" transparent>
      <View style={styles.centerModalOverlay}>
        <View style={styles.centerModalContent}>
          <Text style={styles.centerModalTitle}>{t('language_title')}</Text>
          {([
            { id: 'ru', name: t('language_ru'), flag: '🇷🇺' },
            { id: 'en', name: t('language_en'), flag: '🇬🇧' },
            { id: 'kz', name: t('language_kz'), flag: '🇰🇿' },
            { id: 'tt', name: t('language_tt'), flag: '🇷🇺' },
            { id: 'uz', name: t('language_uz'), flag: '🇺🇿' },
            { id: 'hy', name: t('language_hy'), flag: '🇦🇲' },
          ] as const).map(lang => (
            <TouchableOpacity 
              key={lang.id} 
              style={[styles.optionRow, language === lang.id && styles.optionRowActive]}
              onPress={() => { setLanguage(lang.id); setShowLanguageModal(false); showNotification({ title: t('success'), type: 'success' }); }}
            >
              <Text style={styles.optionFlag}>{lang.flag}</Text>
              <Text style={[styles.optionText, language === lang.id && styles.optionTextActive]}>{lang.name}</Text>
              {language === lang.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowLanguageModal(false)}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Модалка темы
  const renderThemeModal = () => (
    <Modal visible={showThemeModal} animationType="fade" transparent>
      <View style={styles.centerModalOverlay}>
        <View style={styles.centerModalContent}>
          <Text style={styles.centerModalTitle}>{t('theme_title')}</Text>
          {([
            { id: 'light', name: t('theme_light'), icon: 'sunny-outline' },
            { id: 'dark', name: t('theme_dark'), icon: 'moon-outline' },
            { id: 'system', name: t('theme_system'), icon: 'phone-portrait-outline' },
          ] as const).map(theme => (
            <TouchableOpacity 
              key={theme.id} 
              style={[styles.optionRow, themeMode === theme.id && styles.optionRowActive]}
              onPress={() => { setThemeMode(theme.id); setShowThemeModal(false); showNotification({ title: t('success'), type: 'success' }); }}
            >
              <Ionicons name={theme.icon as any} size={24} color={themeMode === theme.id ? colors.primary : colors.text} />
              <Text style={[styles.optionText, themeMode === theme.id && styles.optionTextActive]}>{theme.name}</Text>
              {themeMode === theme.id && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowThemeModal(false)}>
            <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Модалка о приложении
  const renderAboutModal = () => (
    <Modal visible={showAboutModal} animationType="fade" transparent>
      <View style={styles.centerModalOverlay}>
        <View style={styles.centerModalContent}>
          <LinearGradient colors={colors.gradientOrange} style={styles.aboutLogo}>
            <Ionicons name="storefront" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.aboutTitle}>{t('app_name')}</Text>
          <Text style={styles.aboutVersion}>{t('about_version')} 1.0.0</Text>
          <Text style={styles.aboutDesc}>{t('about_desc')}</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAboutModal(false)}>
            <Text style={styles.cancelBtnText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Модалка помощи
  const renderHelpModal = () => (
    <Modal visible={showHelpModal} animationType="fade" transparent>
      <View style={styles.centerModalOverlay}>
        <View style={[styles.centerModalContent, { paddingBottom: 24 }]}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="help-circle" size={48} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' }}>Поддержка</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>Свяжитесь с нами любым удобным способом:</Text>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}
            onPress={async () => {
              const url = 'https://t.me/Skrizzzy4';
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Ошибка', 'Не удалось открыть Telegram');
              }
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0088cc15', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="paper-plane" size={20} color="#0088cc" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 2 }}>Telegram</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>@Skrizzzy4</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border }}
            onPress={async () => {
              const url = 'mailto:vanya.piskunov.95@list.ru';
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Ошибка', 'Не удалось открыть почтовый клиент');
              }
            }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="mail" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 2 }}>Email</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>vanya.piskunov.95@list.ru</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowHelpModal(false)}>
            <Text style={styles.cancelBtnText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderAddressModal()}
      {renderAddAddressModal()}
      {renderPaymentModal()}
      {renderAddCardModal()}
      {renderLanguageModal()}
      {renderThemeModal()}
      {renderAboutModal()}
      {renderHelpModal()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient colors={colors.gradientOrange} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerContent}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>
            {userPhone ? <Text style={styles.userPhone}>{userPhone}</Text> : null}
            
            {user ? (
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile/edit')}>
                <Text style={styles.editButtonText}>{t('profile_edit')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/auth/login')}>
                <Text style={styles.editButtonText}>{t('profile_login')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Loyalty Card */}
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <Ionicons name={loyaltyInfo.icon} size={24} color={loyaltyInfo.color} />
              <Text style={styles.loyaltyTitle}>{loyaltyInfo.level} {t('profile_status')}</Text>
              {loyaltyInfo.discount > 0 && (
                <View style={[styles.discountBadge, { backgroundColor: `${loyaltyInfo.color}20` }]}>
                  <Text style={[styles.discountText, { color: loyaltyInfo.color }]}>-{loyaltyInfo.discount}%</Text>
                </View>
              )}
            </View>
            
            <View style={styles.ordersInfo}>
              <View style={styles.ordersRow}>
                <Text style={styles.ordersLabel}>{t('profile_total_orders')}:</Text>
                <Text style={styles.ordersValue}>{totalOrders}</Text>
              </View>
              {loyaltyInfo.discount > 0 && (
                <View style={styles.ordersRow}>
                  <Text style={styles.ordersLabel}>{t('profile_your_discount')}:</Text>
                  <Text style={[styles.ordersValue, { color: loyaltyInfo.color }]}>{loyaltyInfo.discount}%</Text>
                </View>
              )}
            </View>
            
            {loyaltyInfo.nextLevel && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${loyaltyInfo.progress}%`, backgroundColor: loyaltyInfo.color }]} />
                </View>
                <Text style={styles.progressText}>
                  {t('profile_to_next_level')} {loyaltyInfo.nextLevel}: {loyaltyInfo.ordersToNext} {t('profile_orders_left')}
                </Text>
              </View>
            )}
            
            <LinearGradient colors={colors.gradientOrange} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pointsCard}>
              <Text style={styles.pointsLabel}>{t('profile_bonus_points')}</Text>
              <Text style={styles.pointsValue}>{currentPoints}</Text>
            </LinearGradient>
          </View>

          {/* Menu Sections */}
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/orders')}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="receipt-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_orders')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowAddressModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="location-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_addresses')}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{addresses.length}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowPaymentModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="card-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_payment')}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{paymentMethods.filter(p => p.type === 'card').length}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="notifications-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_notifications')}</Text>
              </View>
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowLanguageModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="globe-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_language')}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>
                  {language === 'ru' ? '🇷🇺' : 
                   language === 'en' ? '🇬🇧' : 
                   language === 'kz' ? '🇰🇿' :
                   language === 'tt' ? '🇷🇺' :
                   language === 'uz' ? '🇺🇿' :
                   language === 'hy' ? '🇦🇲' : '🇷🇺'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowThemeModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="moon-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_theme')}</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>{themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '📱'}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/support')}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="chatbubbles-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_support')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowHelpModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="help-circle-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_help')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowAboutModal(true)}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}><Ionicons name="information-circle-outline" size={20} color={colors.primary} /></View>
                <Text style={styles.menuItemText}>{t('menu_about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {user && (
            <View style={styles.menuSection}>
              <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, styles.menuIconDestructive]}><Ionicons name="log-out-outline" size={20} color={colors.red} /></View>
                  <Text style={[styles.menuItemText, styles.menuItemTextDestructive]}>{t('menu_logout')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  // Header
  header: { paddingTop: 24, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { alignItems: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarImage: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  userPhone: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  editButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.2)' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Content
  content: { paddingHorizontal: 24, marginTop: -16 },

  // Loyalty Card
  loyaltyCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: `${colors.yellow}30` },
  loyaltyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  loyaltyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, flex: 1 },
  discountBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  discountText: { fontSize: 14, fontWeight: 'bold' },
  ordersInfo: { marginBottom: 16, gap: 8 },
  ordersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ordersLabel: { fontSize: 14, color: colors.textMuted },
  ordersValue: { fontSize: 16, fontWeight: '600', color: colors.text },
  progressContainer: { marginBottom: 16 },
  progressBar: { height: 8, backgroundColor: `${colors.yellow}20`, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.yellow, borderRadius: 4 },
  progressText: { fontSize: 13, color: colors.textMuted },
  pointsCard: { borderRadius: 16, padding: 16, alignItems: 'center' },
  pointsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  pointsValue: { fontSize: 36, fontWeight: 'bold', color: '#fff' },

  // Menu
  menuSection: { gap: 8, marginBottom: 24 },
  menuItem: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: colors.border },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  menuIconDestructive: { backgroundColor: `${colors.red}15` },
  menuItemText: { fontSize: 15, fontWeight: '500', color: colors.text },
  menuItemTextDestructive: { color: colors.red },
  menuItemValue: { fontSize: 14, color: colors.textMuted },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  modalBody: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textMuted, marginTop: 24, marginBottom: 12 },

  // Address
  addressCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border },
  addressInfo: { flex: 1 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  addressIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.primary}15`, alignItems: 'center', justifyContent: 'center' },
  addressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  defaultBadge: { backgroundColor: `${colors.green}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  defaultText: { fontSize: 11, fontWeight: '600', color: colors.green },
  addressText: { fontSize: 14, color: colors.text, marginLeft: 52 },
  addressDetails: { fontSize: 13, color: colors.textMuted, marginLeft: 52, marginTop: 4 },
  addressActions: { flexDirection: 'column', gap: 8 },
  actionBtn: { padding: 4 },

  // Add Address Form
  addressTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  addressTypeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  addressTypeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  addressTypeText: { fontSize: 14, fontWeight: '500', color: colors.text },
  addressTypeTextActive: { color: '#fff' },

  // Inputs
  inputLabel: { fontSize: 14, fontWeight: '500', color: colors.text, marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },

  // Buttons
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', borderRadius: 16, marginTop: 8 },
  addButtonText: { fontSize: 15, fontWeight: '500', color: colors.primary },
  saveButton: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  saveButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Payment
  paymentCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  paymentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardBrandBg: { width: 48, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cardBrandText: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  paymentDetails: { },
  paymentTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  paymentSubtitle: { fontSize: 12, color: colors.textMuted },
  paymentDefault: { fontSize: 12, color: colors.green, marginTop: 2 },
  paymentActions: { flexDirection: 'row', gap: 12 },
  otherPaymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  otherPaymentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  otherPaymentText: { fontSize: 15, color: colors.text },

  // Card Preview
  cardPreview: { borderRadius: 16, padding: 20, marginBottom: 24, height: 180 },
  cardPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cardBrand: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardPreviewNumber: { fontSize: 22, fontWeight: '600', color: '#fff', letterSpacing: 2, marginBottom: 24 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardPreviewLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cardPreviewValue: { fontSize: 14, fontWeight: '600', color: '#fff' },

  // Center Modal
  centerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  centerModalContent: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  centerModalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, gap: 12 },
  optionRowActive: { backgroundColor: `${colors.primary}15` },
  optionFlag: { fontSize: 24 },
  optionText: { flex: 1, fontSize: 16, color: colors.text },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
  cancelBtn: { marginTop: 12, paddingVertical: 12 },
  cancelBtnText: { fontSize: 15, color: colors.textMuted },

  // About
  aboutLogo: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  aboutTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  aboutVersion: { fontSize: 14, color: colors.textMuted, marginBottom: 12 },
  aboutDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 16 },
});
