import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { DemoBonusProvider } from '../src/context/DemoBonusContext';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';

function AppContent() {
  const { colors, isDark } = useSettings();
  
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="cart" options={{ presentation: 'modal' }} />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <DemoBonusProvider>
          <FavoritesProvider>
            <CartProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </CartProvider>
          </FavoritesProvider>
        </DemoBonusProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
