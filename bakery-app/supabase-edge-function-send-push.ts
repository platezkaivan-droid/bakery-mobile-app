// ============================================
// SUPABASE EDGE FUNCTION: send-push-notification
// ============================================
// Этот файл нужно создать в Supabase Dashboard:
// Edge Functions → Create new function → Название: send-push-notification
// ============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// 🔥 ВАЖНО: Замени на свой Firebase Server Key
// Получить можно в Firebase Console → Project Settings → Cloud Messaging → Server Key
const FIREBASE_SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY_HERE'

serve(async (req) => {
  try {
    // Получаем данные из запроса
    const { fcmToken, title, body, data } = await req.json()

    if (!fcmToken) {
      return new Response(
        JSON.stringify({ error: 'FCM token is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Отправляем push-уведомление через Firebase Cloud Messaging
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: title || 'Новое уведомление',
          body: body || '',
          sound: 'default',
          badge: '1',
          priority: 'high',
        },
        data: data || {},
        priority: 'high',
        content_available: true,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('FCM Error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send push notification', details: result }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Push notification sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, result }), 
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-push-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================
// КАК ИСПОЛЬЗОВАТЬ:
// ============================================
// 1. Создай эту функцию в Supabase Dashboard
// 2. Замени FIREBASE_SERVER_KEY на свой ключ
// 3. Deploy функцию
// 4. Функция будет автоматически вызываться триггером из БД
// ============================================
