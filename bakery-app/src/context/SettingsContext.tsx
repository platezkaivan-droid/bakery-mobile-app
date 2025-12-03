import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// Типы
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'ru' | 'en' | 'kz' | 'tt' | 'uz' | 'hy';

export interface Address {
  id: string;
  title: string;
  address: string;
  apartment?: string;
  entrance?: string;
  floor?: string;
  intercom?: string;
  comment?: string;
  isDefault: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'cash';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  last4?: string;
  brand?: 'visa' | 'mastercard' | 'mir';
  isDefault: boolean;
}

// Переводы
export const translations = {
  ru: {
    // Общие
    app_name: 'Sweet Bakery',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    add: 'Добавить',
    confirm: 'Подтвердить',
    back: 'Назад',
    close: 'Закрыть',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    success: 'Успешно',
    
    // Навигация
    nav_home: 'Главная',
    nav_cart: 'Корзина',
    nav_favorites: 'Избранное',
    nav_orders: 'Заказы',
    nav_profile: 'Профиль',
    
    // Главная
    home_search_placeholder: 'Что будем искать?',
    home_your_bonus: 'Ваши бонусы',
    home_points: 'баллов',
    home_all: 'Все',
    home_bakery: 'Выпечка',
    home_cakes: 'Торты',
    home_pastries: 'Пирожные',
    home_bread: 'Хлеб',
    home_desserts: 'Десерты',
    
    // Корзина
    cart_title: 'Корзина',
    cart_empty: 'Корзина пуста',
    cart_empty_desc: 'Добавьте вкусную выпечку из каталога',
    cart_go_catalog: 'Перейти в каталог',
    cart_items: 'товаров',
    cart_promo_code: 'Промокод',
    cart_enter_code: 'Введите код',
    cart_apply: 'Применить',
    cart_subtotal: 'Товары',
    cart_delivery: 'Доставка',
    cart_free: 'Бесплатно',
    cart_discount: 'Скидка',
    cart_total: 'Итого',
    cart_checkout: 'Оформить',
    cart_bonus_earn: 'Вы получите',
    cart_bonus_points: 'баллов',
    cart_use_points: 'Списать баллы',
    cart_points_balance: 'Ваш баланс',
    cart_points_discount: 'Скидка баллами',
    cart_points_to_spend: 'Будет списано',
    cart_points_not_enough: 'Недостаточно баллов',
    cart_points_min: 'Минимум 10 баллов',
    cart_to_pay: 'К оплате',
    
    // Избранное
    favorites_title: 'Избранное',
    favorites_empty: 'Избранное пусто',
    favorites_empty_desc: 'Нажмите ❤️ на товаре, чтобы добавить',
    favorites_all: 'Все',
    favorites_available: 'Доступные',
    favorites_unavailable: 'Нет в наличии',
    
    // Заказы
    orders_title: 'Мои заказы',
    orders_active: 'Активные',
    orders_history: 'История',
    orders_empty_active: 'Нет активных заказов',
    orders_empty_history: 'История пуста',
    orders_empty_desc: 'Закажите свежую выпечку прямо сейчас!',
    orders_repeat: 'Повторить',
    orders_track: 'Отследить',
    orders_rate: 'Оценить',
    orders_cancel: 'Отменить заказ',
    orders_support: 'Связаться с поддержкой',
    
    // Статусы заказов
    status_pending: 'Ожидает подтверждения',
    status_confirmed: 'Подтверждён',
    status_preparing: 'Готовится',
    status_ready: 'Готов к выдаче',
    status_transit: 'В пути',
    status_delivered: 'Доставлен',
    status_cancelled: 'Отменён',
    
    // Профиль
    profile_guest: 'Гость',
    profile_login: 'Войти в аккаунт',
    profile_edit: 'Редактировать профиль',
    profile_bonus_points: 'Бонусных баллов',
    profile_next_level: 'До следующего уровня',
    profile_make_purchase: 'Совершите покупку, чтобы получить баллы',
    profile_newbie: 'Новичок',
    profile_bronze: 'Бронзовый',
    profile_silver: 'Серебряный',
    profile_gold: 'Золотой',
    profile_status: 'статус',
    profile_total_orders: 'Всего заказов',
    profile_your_discount: 'Ваша скидка',
    profile_to_next_level: 'До следующего уровня',
    profile_orders_left: 'заказов',
    
    // Меню профиля
    menu_orders: 'Мои заказы',
    menu_addresses: 'Адреса доставки',
    menu_payment: 'Способы оплаты',
    menu_notifications: 'Уведомления',
    menu_language: 'Язык',
    menu_theme: 'Тема',
    menu_help: 'Помощь',
    menu_about: 'О приложении',
    menu_logout: 'Выйти',
    
    // Адреса
    addresses_title: 'Адреса доставки',
    addresses_add: 'Добавить адрес',
    addresses_edit: 'Редактировать адрес',
    addresses_default: 'По умолчанию',
    addresses_set_default: 'Сделать основным',
    addresses_street: 'Улица и дом',
    addresses_apartment: 'Квартира/офис',
    addresses_entrance: 'Подъезд',
    addresses_floor: 'Этаж',
    addresses_intercom: 'Домофон',
    addresses_comment: 'Комментарий курьеру',
    addresses_name: 'Название адреса',
    addresses_home: 'Дом',
    addresses_work: 'Работа',
    addresses_other: 'Другое',
    
    // Оплата
    payment_title: 'Способы оплаты',
    payment_add_card: 'Добавить карту',
    payment_card_number: 'Номер карты',
    payment_card_holder: 'Имя владельца',
    payment_expiry: 'Срок действия',
    payment_cvv: 'CVV',
    payment_other_methods: 'Другие способы',
    payment_apple_pay: 'Apple Pay',
    payment_google_pay: 'Google Pay',
    payment_cash: 'Наличными',
    payment_default: 'По умолчанию',
    
    // Язык
    language_title: 'Выберите язык',
    language_ru: 'Русский',
    language_en: 'English',
    language_kz: 'Қазақша',
    language_tt: 'Татарский',
    language_uz: 'Узбекский',
    language_hy: 'Армянский',
    
    // Тема
    theme_title: 'Выберите тему',
    theme_light: 'Светлая',
    theme_dark: 'Тёмная',
    theme_system: 'Системная',
    
    // О приложении
    about_version: 'Версия',
    about_desc: 'Приложение для заказа свежей выпечки с доставкой',
    
    // Уведомления
    notifications_title: 'Уведомления',
    notifications_empty: 'Нет уведомлений',
    notifications_read_all: 'Прочитать все',
    
    // Авторизация
    auth_login: 'Вход',
    auth_register: 'Регистрация',
    auth_email: 'Email',
    auth_password: 'Пароль',
    auth_name: 'Имя',
    auth_phone: 'Телефон',
    auth_forgot_password: 'Забыли пароль?',
    auth_no_account: 'Нет аккаунта?',
    auth_have_account: 'Уже есть аккаунт?',
    auth_sign_up: 'Зарегистрироваться',
    auth_sign_in: 'Войти',
  },
  en: {
    // General
    app_name: 'Sweet Bakery',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    confirm: 'Confirm',
    back: 'Back',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Navigation
    nav_home: 'Home',
    nav_cart: 'Cart',
    nav_favorites: 'Favorites',
    nav_orders: 'Orders',
    nav_profile: 'Profile',
    
    // Home
    home_search_placeholder: 'What are you looking for?',
    home_your_bonus: 'Your bonus',
    home_points: 'points',
    home_all: 'All',
    home_bakery: 'Bakery',
    home_cakes: 'Cakes',
    home_pastries: 'Pastries',
    home_bread: 'Bread',
    home_desserts: 'Desserts',
    
    // Cart
    cart_title: 'Cart',
    cart_empty: 'Cart is empty',
    cart_empty_desc: 'Add delicious pastries from the catalog',
    cart_go_catalog: 'Go to catalog',
    cart_items: 'items',
    cart_promo_code: 'Promo code',
    cart_enter_code: 'Enter code',
    cart_apply: 'Apply',
    cart_subtotal: 'Subtotal',
    cart_delivery: 'Delivery',
    cart_free: 'Free',
    cart_discount: 'Discount',
    cart_total: 'Total',
    cart_checkout: 'Checkout',
    cart_bonus_earn: 'You will earn',
    cart_bonus_points: 'points',
    cart_use_points: 'Use points',
    cart_points_balance: 'Your balance',
    cart_points_discount: 'Points discount',
    cart_points_to_spend: 'Will be spent',
    cart_points_not_enough: 'Not enough points',
    cart_points_min: 'Minimum 10 points',
    cart_to_pay: 'To pay',
    
    // Favorites
    favorites_title: 'Favorites',
    favorites_empty: 'Favorites is empty',
    favorites_empty_desc: 'Tap ❤️ on a product to add it',
    favorites_all: 'All',
    favorites_available: 'Available',
    favorites_unavailable: 'Out of stock',
    
    // Orders
    orders_title: 'My Orders',
    orders_active: 'Active',
    orders_history: 'History',
    orders_empty_active: 'No active orders',
    orders_empty_history: 'History is empty',
    orders_empty_desc: 'Order fresh pastries right now!',
    orders_repeat: 'Repeat',
    orders_track: 'Track',
    orders_rate: 'Rate',
    orders_cancel: 'Cancel order',
    orders_support: 'Contact support',
    
    // Order statuses
    status_pending: 'Pending confirmation',
    status_confirmed: 'Confirmed',
    status_preparing: 'Preparing',
    status_ready: 'Ready for pickup',
    status_transit: 'In transit',
    status_delivered: 'Delivered',
    status_cancelled: 'Cancelled',
    
    // Profile
    profile_guest: 'Guest',
    profile_login: 'Sign in',
    profile_edit: 'Edit profile',
    profile_bonus_points: 'Bonus points',
    profile_next_level: 'To next level',
    profile_make_purchase: 'Make a purchase to earn points',
    profile_newbie: 'Newbie',
    profile_bronze: 'Bronze',
    profile_silver: 'Silver',
    profile_gold: 'Gold',
    profile_status: 'status',
    profile_total_orders: 'Total orders',
    profile_your_discount: 'Your discount',
    profile_to_next_level: 'To next level',
    profile_orders_left: 'orders',
    
    // Profile menu
    menu_orders: 'My Orders',
    menu_addresses: 'Delivery Addresses',
    menu_payment: 'Payment Methods',
    menu_notifications: 'Notifications',
    menu_language: 'Language',
    menu_theme: 'Theme',
    menu_help: 'Help',
    menu_about: 'About',
    menu_logout: 'Log out',
    
    // Addresses
    addresses_title: 'Delivery Addresses',
    addresses_add: 'Add address',
    addresses_edit: 'Edit address',
    addresses_default: 'Default',
    addresses_set_default: 'Set as default',
    addresses_street: 'Street and building',
    addresses_apartment: 'Apartment/office',
    addresses_entrance: 'Entrance',
    addresses_floor: 'Floor',
    addresses_intercom: 'Intercom',
    addresses_comment: 'Comment for courier',
    addresses_name: 'Address name',
    addresses_home: 'Home',
    addresses_work: 'Work',
    addresses_other: 'Other',
    
    // Payment
    payment_title: 'Payment Methods',
    payment_add_card: 'Add card',
    payment_card_number: 'Card number',
    payment_card_holder: 'Cardholder name',
    payment_expiry: 'Expiry date',
    payment_cvv: 'CVV',
    payment_other_methods: 'Other methods',
    payment_apple_pay: 'Apple Pay',
    payment_google_pay: 'Google Pay',
    payment_cash: 'Cash',
    payment_default: 'Default',
    
    // Language
    language_title: 'Select language',
    language_ru: 'Русский',
    language_en: 'English',
    language_kz: 'Қазақша',
    
    // Theme
    theme_title: 'Select theme',
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    
    // About
    about_version: 'Version',
    about_desc: 'App for ordering fresh pastries with delivery',
    
    // Notifications
    notifications_title: 'Notifications',
    notifications_empty: 'No notifications',
    notifications_read_all: 'Read all',
    
    // Auth
    auth_login: 'Login',
    auth_register: 'Register',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_name: 'Name',
    auth_phone: 'Phone',
    auth_forgot_password: 'Forgot password?',
    auth_no_account: "Don't have an account?",
    auth_have_account: 'Already have an account?',
    auth_sign_up: 'Sign up',
    auth_sign_in: 'Sign in',
  },
  kz: {
    // Жалпы
    app_name: 'Sweet Bakery',
    save: 'Сақтау',
    cancel: 'Болдырмау',
    delete: 'Жою',
    edit: 'Өңдеу',
    add: 'Қосу',
    confirm: 'Растау',
    back: 'Артқа',
    close: 'Жабу',
    search: 'Іздеу',
    loading: 'Жүктелуде...',
    error: 'Қате',
    success: 'Сәтті',
    
    // Навигация
    nav_home: 'Басты бет',
    nav_cart: 'Себет',
    nav_favorites: 'Таңдаулылар',
    nav_orders: 'Тапсырыстар',
    nav_profile: 'Профиль',
    
    // Басты бет
    home_search_placeholder: 'Не іздейсіз?',
    home_your_bonus: 'Сіздің бонустарыңыз',
    home_points: 'ұпай',
    home_all: 'Барлығы',
    home_bakery: 'Наубайхана',
    home_cakes: 'Торттар',
    home_pastries: 'Пирожныйлар',
    home_bread: 'Нан',
    home_desserts: 'Десерттер',
    
    // Себет
    cart_title: 'Себет',
    cart_empty: 'Себет бос',
    cart_empty_desc: 'Каталогтан дәмді тоқаш қосыңыз',
    cart_go_catalog: 'Каталогқа өту',
    cart_items: 'тауар',
    cart_promo_code: 'Промокод',
    cart_enter_code: 'Кодты енгізіңіз',
    cart_apply: 'Қолдану',
    cart_subtotal: 'Тауарлар',
    cart_delivery: 'Жеткізу',
    cart_free: 'Тегін',
    cart_discount: 'Жеңілдік',
    cart_total: 'Барлығы',
    cart_checkout: 'Рәсімдеу',
    cart_bonus_earn: 'Сіз аласыз',
    cart_bonus_points: 'ұпай',
    
    // Таңдаулылар
    favorites_title: 'Таңдаулылар',
    favorites_empty: 'Таңдаулылар бос',
    favorites_empty_desc: 'Қосу үшін тауардағы ❤️ басыңыз',
    favorites_all: 'Барлығы',
    favorites_available: 'Қолжетімді',
    favorites_unavailable: 'Қоймада жоқ',
    
    // Тапсырыстар
    orders_title: 'Менің тапсырыстарым',
    orders_active: 'Белсенді',
    orders_history: 'Тарих',
    orders_empty_active: 'Белсенді тапсырыстар жоқ',
    orders_empty_history: 'Тарих бос',
    orders_empty_desc: 'Қазір жаңа тоқаш тапсырыс беріңіз!',
    orders_repeat: 'Қайталау',
    orders_track: 'Бақылау',
    orders_rate: 'Бағалау',
    orders_cancel: 'Тапсырысты болдырмау',
    orders_support: 'Қолдау қызметіне хабарласу',
    
    // Тапсырыс мәртебелері
    status_pending: 'Растауды күтуде',
    status_confirmed: 'Расталды',
    status_preparing: 'Дайындалуда',
    status_ready: 'Алуға дайын',
    status_transit: 'Жолда',
    status_delivered: 'Жеткізілді',
    status_cancelled: 'Болдырылмады',
    
    // Профиль
    profile_guest: 'Қонақ',
    profile_login: 'Кіру',
    profile_edit: 'Профильді өңдеу',
    profile_bonus_points: 'Бонус ұпайлары',
    profile_next_level: 'Келесі деңгейге дейін',
    profile_make_purchase: 'Ұпай алу үшін сатып алыңыз',
    profile_silver: 'Күміс',
    profile_gold: 'Алтын',
    profile_platinum: 'Платина',
    profile_status: 'мәртебе',
    
    // Профиль мәзірі
    menu_orders: 'Менің тапсырыстарым',
    menu_addresses: 'Жеткізу мекенжайлары',
    menu_payment: 'Төлем әдістері',
    menu_notifications: 'Хабарландырулар',
    menu_language: 'Тіл',
    menu_theme: 'Тақырып',
    menu_help: 'Көмек',
    menu_about: 'Қолданба туралы',
    menu_logout: 'Шығу',
    
    // Мекенжайлар
    addresses_title: 'Жеткізу мекенжайлары',
    addresses_add: 'Мекенжай қосу',
    addresses_edit: 'Мекенжайды өңдеу',
    addresses_default: 'Негізгі',
    addresses_set_default: 'Негізгі ету',
    addresses_street: 'Көше және үй',
    addresses_apartment: 'Пәтер/кеңсе',
    addresses_entrance: 'Кіреберіс',
    addresses_floor: 'Қабат',
    addresses_intercom: 'Домофон',
    addresses_comment: 'Курьерге түсініктеме',
    addresses_name: 'Мекенжай атауы',
    addresses_home: 'Үй',
    addresses_work: 'Жұмыс',
    addresses_other: 'Басқа',
    
    // Төлем
    payment_title: 'Төлем әдістері',
    payment_add_card: 'Карта қосу',
    payment_card_number: 'Карта нөмірі',
    payment_card_holder: 'Иесінің аты',
    payment_expiry: 'Жарамдылық мерзімі',
    payment_cvv: 'CVV',
    payment_other_methods: 'Басқа әдістер',
    payment_apple_pay: 'Apple Pay',
    payment_google_pay: 'Google Pay',
    payment_cash: 'Қолма-қол',
    payment_default: 'Негізгі',
    
    // Тіл
    language_title: 'Тілді таңдаңыз',
    language_ru: 'Русский',
    language_en: 'English',
    language_kz: 'Қазақша',
    
    // Тақырып
    theme_title: 'Тақырыпты таңдаңыз',
    theme_light: 'Жарық',
    theme_dark: 'Қараңғы',
    theme_system: 'Жүйелік',
    
    // Қолданба туралы
    about_version: 'Нұсқа',
    about_desc: 'Жаңа тоқашты жеткізумен тапсырыс беру қолданбасы',
    
    // Хабарландырулар
    notifications_title: 'Хабарландырулар',
    notifications_empty: 'Хабарландырулар жоқ',
    notifications_read_all: 'Барлығын оқу',
    
    // Авторизация
    auth_login: 'Кіру',
    auth_register: 'Тіркелу',
    auth_email: 'Email',
    auth_password: 'Құпия сөз',
    auth_name: 'Аты',
    auth_phone: 'Телефон',
    auth_forgot_password: 'Құпия сөзді ұмыттыңыз ба?',
    auth_no_account: 'Аккаунтыңыз жоқ па?',
    auth_have_account: 'Аккаунтыңыз бар ма?',
    auth_sign_up: 'Тіркелу',
    auth_sign_in: 'Кіру',
  },
  tt: {
    // Татарский
    app_name: 'Sweet Bakery',
    save: 'Саклау',
    cancel: 'Баш тарту',
    delete: 'Бетерү',
    edit: 'Үзгәртү',
    add: 'Өстәү',
    nav_home: 'Баш бит',
    nav_cart: 'Кәрзин',
    nav_favorites: 'Сайланганнар',
    nav_orders: 'Заказлар',
    nav_profile: 'Профиль',
    cart_title: 'Кәрзин',
    cart_empty: 'Кәрзин буш',
    cart_checkout: 'Рәсмиләштерү',
    favorites_title: 'Сайланганнар',
    orders_title: 'Минем заказлар',
    orders_active: 'Актив',
    orders_history: 'Тарих',
    profile_guest: 'Кунак',
    profile_edit: 'Профильне үзгәртү',
    menu_orders: 'Минем заказлар',
    menu_addresses: 'Китерү адреслары',
    menu_payment: 'Түләү ысуллары',
    menu_notifications: 'Белдерүләр',
    menu_language: 'Тел',
    menu_theme: 'Тема',
    menu_help: 'Ярдәм',
    menu_about: 'Кушымта турында',
    menu_logout: 'Чыгу',
    language_title: 'Телне сайлагыз',
    language_ru: 'Русча',
    language_en: 'English',
    language_kz: 'Қазақша',
    language_tt: 'Татарча',
    language_uz: "O'zbek",
    language_hy: 'Հայերեն',
    theme_light: 'Якты',
    theme_dark: 'Караңгы',
    theme_system: 'Система',
    profile_newbie: 'Яңа',
    profile_bronze: 'Бронза',
    profile_silver: 'Көмеш',
    profile_gold: 'Алтын',
    profile_status: 'статус',
    profile_total_orders: 'Барлык заказлар',
    profile_your_discount: 'Сезнең ташлама',
    profile_to_next_level: 'Киләсе дәрәҗәгә',
    profile_orders_left: 'заказ',
    auth_login: 'Керү',
    auth_register: 'Теркәлү',
    auth_email: 'Email',
    auth_password: 'Серсүз',
    auth_sign_in: 'Керү',
  },
  uz: {
    // Узбекский
    app_name: 'Sweet Bakery',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    delete: "O'chirish",
    edit: 'Tahrirlash',
    add: "Qo'shish",
    nav_home: 'Bosh sahifa',
    nav_cart: 'Savat',
    nav_favorites: 'Sevimlilar',
    nav_orders: 'Buyurtmalar',
    nav_profile: 'Profil',
    cart_title: 'Savat',
    cart_empty: 'Savat bo\'sh',
    cart_checkout: 'Rasmiylashtirish',
    favorites_title: 'Sevimlilar',
    orders_title: 'Mening buyurtmalarim',
    orders_active: 'Faol',
    orders_history: 'Tarix',
    profile_guest: 'Mehmon',
    profile_edit: 'Profilni tahrirlash',
    menu_orders: 'Mening buyurtmalarim',
    menu_addresses: 'Yetkazib berish manzillari',
    menu_payment: "To'lov usullari",
    menu_notifications: 'Bildirishnomalar',
    menu_language: 'Til',
    menu_theme: 'Mavzu',
    menu_help: 'Yordam',
    menu_about: 'Ilova haqida',
    menu_logout: 'Chiqish',
    language_title: 'Tilni tanlang',
    language_ru: 'Русский',
    language_en: 'English',
    language_kz: 'Қазақша',
    language_tt: 'Татарча',
    language_uz: "O'zbek",
    language_hy: 'Հայերեն',
    theme_light: 'Yorug\'',
    theme_dark: 'Qorong\'i',
    theme_system: 'Tizim',
    profile_newbie: 'Yangi',
    profile_bronze: 'Bronza',
    profile_silver: 'Kumush',
    profile_gold: 'Oltin',
    profile_status: 'status',
    profile_total_orders: 'Jami buyurtmalar',
    profile_your_discount: 'Sizning chegirma',
    profile_to_next_level: 'Keyingi darajaga',
    profile_orders_left: 'buyurtma',
    auth_login: 'Kirish',
    auth_register: "Ro'yxatdan o'tish",
    auth_email: 'Email',
    auth_password: 'Parol',
    auth_sign_in: 'Kirish',
  },
  hy: {
    // Армянский
    app_name: 'Sweet Bakery',
    save: 'Պահպանել',
    cancel: 'Չեղարկել',
    delete: 'Ջնջել',
    edit: 'Խմբագրել',
    add: 'Ավելացնել',
    nav_home: 'Գլխավոր',
    nav_cart: 'Զամբյուղ',
    nav_favorites: 'Ընտրյալներ',
    nav_orders: 'Պատվերներ',
    nav_profile: 'Պրոֆիլ',
    cart_title: 'Զամբյուղ',
    cart_empty: 'Զամբյուղը դատարկ է',
    cart_checkout: 'Ձևակերպել',
    favorites_title: 'Ընտրյալներ',
    orders_title: 'Իմ պատվերները',
    orders_active: 'Ակտիվ',
    orders_history: 'Պատմություն',
    profile_guest: 'Հյուր',
    profile_edit: 'Խմբագրել պրոֆիլը',
    menu_orders: 'Իմ պատվերները',
    menu_addresses: 'Առաքման հասցեներ',
    menu_payment: 'Վճարման եղանակներ',
    menu_notifications: 'Ծանուցումներ',
    menu_language: 'Լեզու',
    menu_theme: 'Թեմա',
    menu_help: 'Օգնություն',
    menu_about: 'Հավելվածի մասին',
    menu_logout: 'Դուրս գալ',
    language_title: 'Ընտրեք լեզուն',
    language_ru: 'Русский',
    language_en: 'English',
    language_kz: 'Қазақша',
    language_tt: 'Татарча',
    language_uz: "O'zbek",
    language_hy: 'Հայերեն',
    theme_light: 'Լուսավոր',
    theme_dark: 'Մուգ',
    theme_system: 'Համակարգ',
    profile_newbie: 'Նորեկ',
    profile_bronze: 'Բրոնզե',
    profile_silver: 'Արծաթե',
    profile_gold: 'Ոսկե',
    profile_status: 'կարգավիճակ',
    profile_total_orders: 'Ընդհանուր պատվերներ',
    profile_your_discount: 'Ձեր զեղչ',
    profile_to_next_level: 'Հաջորդ մակարդակին',
    profile_orders_left: 'պատվեր',
    auth_login: 'Մուտք',
    auth_register: 'Գրանցում',
    auth_email: 'Email',
    auth_password: 'Գաղտնաբառ',
    auth_sign_in: 'Մուտք',
  },
};


// Цвета для тем
export const lightColors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  accent: '#FF6B35',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  gradientStart: '#FF6B35',
  gradientEnd: '#E55A2B',
  gradientOrange: ['#FF6B35', '#FF8552', '#FFB347'] as string[],
};

export const darkColors = {
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  accent: '#FF6B35',
  background: '#0F0F1A',
  surface: '#1A1A2E',
  text: '#F8F9FA',
  textLight: '#B8B8B8',
  textMuted: '#9CA3AF',
  border: '#374151',
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  gradientStart: '#FF6B35',
  gradientEnd: '#E55A2B',
  gradientOrange: ['#FF6B35', '#FF8552', '#FFB347'] as string[],
};

interface SettingsContextType {
  // Тема
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  colors: typeof lightColors;
  
  // Язык
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.ru) => string;
  
  // Адреса
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  
  // Способы оплаты
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (id: string, method: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  
  // Уведомления
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  
  // Состояния
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [language, setLanguage] = useState<Language>('ru');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Определяем текущую тему
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  // Функция перевода
  const t = (key: keyof typeof translations.ru): string => {
    const translation = translations[language] as any;
    return translation[key] || translations.ru[key] || key;
  };

  // Управление адресами
  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };
    setAddresses(prev => [...prev, newAddress]);
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setAddresses(prev => prev.map(addr => 
      addr.id === id ? { ...addr, ...updates } : addr
    ));
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  // Управление способами оплаты
  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === id ? { ...method, ...updates } : method
    ));
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(method => ({
      ...method,
      isDefault: method.id === id,
    })));
  };

  return (
    <SettingsContext.Provider value={{
      themeMode,
      setThemeMode,
      isDark,
      colors,
      language,
      setLanguage,
      t,
      addresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      paymentMethods,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      setDefaultPaymentMethod,
      notificationsEnabled,
      setNotificationsEnabled,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
