import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle, session } = useAuth();

  // Автоматический редирект если сессия появилась (например после Google Sign-In)
  useEffect(() => {
    if (session) {
      console.log('✅ LoginScreen: Session detected, redirecting to tabs...');
      router.replace('/(tabs)');
    }
  }, [session]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 LoginScreen: Starting email login...');
      await signIn(email, password);
      console.log('✅ LoginScreen: Email login successful');
      // Навигация произойдёт автоматически через useEffect выше или через _layout.tsx
    } catch (error: any) {
      console.error('❌ LoginScreen: Email login error:', error.message);
      Alert.alert('Ошибка входа', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      console.log('🔐 LoginScreen: Starting Google Sign-In...');
      await signInWithGoogle();
      console.log('✅ LoginScreen: Google Sign-In successful');
      // Навигация произойдёт автоматически через useEffect выше или через _layout.tsx
    } catch (error: any) {
      if (error.message !== 'Вход отменен') {
        Alert.alert('Ошибка', 'Не удалось войти через Google: ' + error.message);
      }
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🥐</Text>
          </View>
          <Text style={styles.title}>С возвращением!</Text>
          <Text style={styles.subtitle}>Войдите, чтобы продолжить</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={Colors.textMuted} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Забыли пароль?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Вход...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={[styles.socialBtn, googleLoading && styles.socialBtnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <Ionicons name="logo-google" size={20} color={Colors.text} />
            <Text style={styles.socialBtnText}>
              {googleLoading ? 'Загрузка...' : 'Войти через Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.socialBtn, styles.socialBtnDisabled]} disabled>
            <Ionicons name="logo-apple" size={20} color={Colors.textMuted} />
            <Text style={[styles.socialBtnText, { color: Colors.textMuted }]}>
              Скоро: Войти через Apple
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Нет аккаунта? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.footerLink}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: Colors.textMuted,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialBtnDisabled: {
    opacity: 0.5,
  },
  socialBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  footerLink: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '700',
  },
});
