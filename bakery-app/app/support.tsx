import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, IMessage, Bubble, InputToolbar, Send } from 'react-native-gifted-chat';
import { supabase } from '../src/lib/supabase';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/context/AuthContext';
import { useSettings } from '../src/context/SettingsContext';

export default function SupportChat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isDark, colors } = useSettings();

  // Цвета для темной/светлой темы (используем тему из настроек)
  const theme = {
    background: colors.background,
    surface: colors.surface,
    bubbleLeft: colors.surface,
    textLeft: colors.text,
    bubbleRight: colors.accent,
    textRight: '#ffffff',
    inputBackground: colors.surface,
    inputBorder: colors.border,
    inputText: colors.text,
    textMuted: colors.textMuted,
    headerBg: colors.surface,
    headerText: colors.text,
  };

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    // Загружаем историю сообщений
    fetchMessages();

    // Подписываемся на обновления (Realtime)
    const channel = supabase
      .channel('support_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Форматируем сообщение для GiftedChat
          const formattedMessage: IMessage = {
            _id: newMessage.id,
            text: newMessage.text,
            createdAt: new Date(newMessage.created_at),
            user: {
              _id: newMessage.is_admin ? 'admin' : user.id,
              name: newMessage.is_admin ? 'Поддержка' : 'Вы',
              avatar: newMessage.is_admin 
                ? 'https://ui-avatars.com/api/?name=Support&background=FF6B35&color=fff' 
                : undefined,
            },
          };

          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [formattedMessage])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
      return;
    }

    // Превращаем формат Supabase в формат GiftedChat
    const formattedMessages = data.map((msg) => ({
      _id: msg.id,
      text: msg.text,
      createdAt: new Date(msg.created_at),
      user: {
        _id: msg.is_admin ? 'admin' : user.id,
        name: msg.is_admin ? 'Поддержка' : 'Вы',
        avatar: msg.is_admin 
          ? 'https://ui-avatars.com/api/?name=Support&background=FF6B35&color=fff' 
          : undefined,
      },
    }));

    setMessages(formattedMessages);
    setLoading(false);
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (!user) return;

    const msg = newMessages[0];

    // Отправляем в Supabase
    const { error } = await supabase.from('support_messages').insert({
      user_id: user.id,
      text: msg.text,
      is_admin: false,
    });

    if (error) {
      console.error('Ошибка отправки:', error);
      alert('Не удалось отправить сообщение');
    }
  }, [user]);

  if (loading || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.inputBorder }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.background }]} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.headerText} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.headerText }]}>Поддержка</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>Обычно отвечаем в течение часа</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Chat */}
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: user.id,
        }}
        placeholder="Напишите сообщение..."
        locale="ru"
        messagesContainerStyle={{ backgroundColor: theme.background }}
        renderAvatar={(props) => {
          if (props.currentMessage?.user._id === 'admin') {
            return (
              <View style={[styles.adminAvatar, { backgroundColor: colors.accent }]}>
                <Ionicons name="headset" size={20} color="#fff" />
              </View>
            );
          }
          return null;
        }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: theme.bubbleLeft },
              right: { backgroundColor: theme.bubbleRight },
            }}
            textStyle={{
              left: { color: theme.textLeft },
              right: { color: theme.textRight },
            }}
            timeTextStyle={{
              left: { color: isDark ? '#999' : Colors.textMuted },
              right: { color: 'rgba(255,255,255,0.7)' },
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: theme.inputBackground,
              borderTopColor: theme.inputBorder,
              borderTopWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: 20,
              minHeight: 60,
            }}
            primaryStyle={{ alignItems: 'center' }}
          />
        )}
        textInputStyle={{ 
          color: theme.inputText,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          lineHeight: 22,
          minHeight: 44,
          backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
          borderRadius: 22,
          marginRight: 8,
        }}
        renderSend={(props) => (
          <Send {...props}>
            <View style={{ 
              marginRight: 4, 
              marginBottom: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons name="send" size={20} color="#fff" />
            </View>
          </Send>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  adminAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    marginVertical: 4,
  },
  adminBubble: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  adminText: {
    color: Colors.text,
    fontSize: 15,
  },
  userText: {
    color: '#fff',
    fontSize: 15,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputToolbar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
