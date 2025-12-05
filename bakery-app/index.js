import messaging from '@react-native-firebase/messaging';
import 'expo-router/entry';

// Background Message Handler - работает когда приложение закрыто или свернуто
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Сообщение получено в фоне!', remoteMessage);
  
  // Android автоматически покажет уведомление, если в payload есть поле "notification"
  // Здесь можно добавить дополнительную логику, например, сохранение в локальную БД
});

console.log('✅ Background message handler зарегистрирован');
