import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/context/AuthContext';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, signInWithGoogle, session } = useAuth();

  // ВАЖНО: Следим за сессией. Как только вошли - сразу на главную!
  useEffect(() => {
    if (session) {
      console.log('✅ Register: Session detected, redirecting to tabs');
      router.replace('/(tabs)');
    }
  }, [session]);

  const handleRegister = async () => {
    if (__DEV__) console.log('Register button clicked!');
    
    if (!fullName || !email || !password || !confirmPassword) {
      alert('Заполните все обязательные поля');
      return;
    }

    if (password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }

    if (!agreedToTerms) {
      alert('Примите условия использования');
      return;
    }

    setLoading(true);
    try {
      console.log('Calling signUp...', { email, fullName, phone });
      await signUp(email, password, fullName, phone);
      
      // Показываем сообщение о подтверждении email
      Alert.alert(
        '📧 Проверьте почту!',
        `Мы отправили письмо на ${email}.\n\nПожалуйста, перейдите по ссылке в письме для подтверждения вашего аккаунта.\n\nПосле подтверждения вы сможете войти в приложение.`,
        [
          {
            text: 'Понятно',
            onPress: () => router.replace('/auth/login'),
          }
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Проверяем, если пользователь уже существует
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        Alert.alert(
          'Аккаунт существует',
          'Пользователь с таким email уже зарегистрирован. Попробуйте войти.',
          [
            { text: 'Войти', onPress: () => router.replace('/auth/login') },
            { text: 'Отмена', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Ошибка регистрации', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) {
      alert('Примите условия использования');
      return;
    }

    setGoogleLoading(true);
    try {
      // Нативный Google Sign-In - без браузера!
      await signInWithGoogle();
      // Редирект произойдет автоматически через Redirect компонент выше
      // когда session обновится в AuthContext
    } catch (error: any) {
      // Не показываем ошибку если пользователь отменил
      if (error.message !== 'Вход отменен') {
        Alert.alert('Ошибка', 'Не удалось войти через Google: ' + error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🥐</Text>
            </View>
            <Text style={styles.title}>Создать аккаунт</Text>
            <Text style={styles.subtitle}>Присоединяйтесь к нам!</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Полное имя *"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email *"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Телефон (необязательно)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Пароль *"
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

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Подтвердите пароль *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Требования к паролю:</Text>
              <View style={styles.requirement}>
                <Ionicons 
                  name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={password.length >= 6 ? Colors.green : Colors.textMuted} 
                />
                <Text style={styles.requirementText}>Минимум 6 символов</Text>
              </View>
              <View style={styles.requirement}>
                <Ionicons 
                  name={password === confirmPassword && password.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={password === confirmPassword && password.length > 0 ? Colors.green : Colors.textMuted} 
                />
                <Text style={styles.requirementText}>Пароли совпадают</Text>
              </View>
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}>
                {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.checkboxText}>
                Я согласен с{' '}
                <Text style={styles.link}>условиями использования</Text>
                {' '}и{' '}
                <Text style={styles.link}>политикой конфиденциальности</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerBtnText}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
                {googleLoading ? 'Загрузка...' : 'Регистрация через Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialBtn, styles.socialBtnDisabled]} disabled>
              <Ionicons name="logo-apple" size={20} color={Colors.textMuted} />
              <Text style={[styles.socialBtnText, { color: Colors.textMuted }]}>
                Скоро: Регистрация через Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Войти</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
  header: {
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
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
    marginBottom: 24,
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
  requirements: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginLeft: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  link: {
    color: Colors.accent,
    fontWeight: '600',
  },
  registerBtn: {
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
  registerBtnDisabled: {
    opacity: 0.6,
  },
  registerBtnText: {
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
