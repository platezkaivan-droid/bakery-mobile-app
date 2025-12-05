// Supabase Edge Function для отправки Push уведомлений через FCM v1 API
// Деплой: supabase functions deploy send-push

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Firebase Service Account credentials
const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "bakery-app-6452b",
  private_key_id: "6f505a729dd52e2e30f1a2a33d96a34499148f00",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCWA9M1syUBVNcd
i0hmqpMlwWnKtOf1fUhYnBuSrJnodDUekfFnTbr3vygs4UV9dvqcIjuXBauyo/EW
fBf9UF162pmuXAz8BPhl0GX+ZQoaNb0v7Vw4xPudw06jcTBmgsOhsIDp+++EapmY
UedNoiOF5MvdCZIbaEip7MBgoF3RJPbRFFw4koFr57ta5qXN/LOAgyF6AJ2xe5UE
yjf6rUWH0QrUECDwedVyivKDmb6ZeY82pa2px6deMcwBwgvEKxt6FR+fc+CzcGt/
QosJWYbCdRE24P2DZhHH7BdUv+M9Vc42+8pn4+FOdr3OGaNPJTReLX1YtiIVerYC
G/lqNMjdAgMBAAECggEAHBFfJT79f4BGN2rmAv+LRJcpmhm7BL2KGborlofgzBNi
FPQtfKyYfN4xQCRuAgmO3kOxbpJLC8OMyi4xtt2gf+oCsxLaAxVS/Im/a5ewCjNf
0GXSyXRht6ThQ8dbzPJOdCQ4Go9ewyHG1y8L3gSmLNkgI500zxf18IUxgWK/6u98
F6l3nfLJHxicKBErvVwFISazBqVexod8PZDRmQeDa4qV3MvCJEVkErNffHV/pE7c
+LNcZSfxBbCd3120MB11T/84oRqdV2kK2oHMbuc+Twaxsr9sw4JF8wLnfk+pu+1Y
Y3Vczp5rNkxYgrwnxK1I6fQFxW7M1ubkqemXqY2xAQKBgQDRfGreBpfotTm/vRZT
OyBDa7Xo9uJguDtelnhL3jPgzvWUiWjD6w2wHVnq04o8OIyoD7+AZwlAksLTU6T3
k+Qb8bbbkg+opKKp6IfJSxUVATxPN5rzmst0+zF27h/aKmqEcIJTKVp/Ag+1d6Qg
edNBjSHyixPjsVZZH8lkiM5OvQKBgQC3UvWV7J2LRVyzky4mbXQfovslxyD23nr8
1C4dLTHbk5yXapAAs0IiEvAY2kEctY1h67mvURm3TlfOd1cAm/iNbXeDuM/FRdQu
VAh8KitIVALro3j9cjTzSg9LkjF3m6TspRNehpSJPawUFw+eSmvC+zK20wzL/Rij
hEjx7bCUoQKBgC0kvbbo/tWEMFS0f9oh1LsSvBnfEju7l/ezP2tCEDXzA5Ml5XDK
96ErQhRLz+9YVF9nPWKDUcgbmGaIEPXVZgPrm/dHS56RFAi/dnuXdYyYPpHnrrmu
cwfblfZGLJEMMPYndL5NHBZgsFfv12u0NSVcL6Of+wJHVg9QvUqv/J2VAoGBAJBx
51toAoJX9sDveO+CUnsS+fw8ODcL+a/4pxUKJTyzxDByIGDM3ZDnhxKt9ZvfWTUM
fVQr/K04J2thEMZEHsWguQiqt9riOFsAj2b1+wCUYXC1b4GTWTFQ61hKKnvpwTtM
nkReme7BDzMNMJsyXFJXhxASnwSjuaQteSRWeknBAoGBAJvCz4+YRIze8ktrhM4/
n2pcd/bzo9Jg+olDbES7TM7u/k/cW+A8vVkKWC8pBhVYC3mUeB1xygRF9LORETtW
8HTtG1qi3saQjqtK3ZDwMZJfAGK5i7VqlRDXpgj5d5O72cl9GERAxUtASCOTxlFW
zTdAVhNVNqmDRfj2tVbv/VEB
-----END PRIVATE KEY-----`,
  client_email: "firebase-adminsdk-fbsvc@bakery-app-6452b.iam.gserviceaccount.com",
  client_id: "114395371205673261840",
  token_uri: "https://oauth2.googleapis.com/token",
}

// Генерация JWT для OAuth2
async function createJWT(): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: SERVICE_ACCOUNT.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signatureInput = `${headerB64}.${payloadB64}`
  
  // Import private key
  const pemContents = SERVICE_ACCOUNT.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\n/g, '')
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  )
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  return `${headerB64}.${payloadB64}.${signatureB64}`
}

// Получение OAuth2 access token
async function getAccessToken(): Promise<string> {
  const jwt = await createJWT()
  
  const response = await fetch(SERVICE_ACCOUNT.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  })
  
  const data = await response.json()
  return data.access_token
}

// Отправка push через FCM v1 API
async function sendFCMMessage(token: string, title: string, body: string, data?: object): Promise<boolean> {
  try {
    const accessToken = await getAccessToken()
    
    const message = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body
        },
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'default'
          }
        },
        data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : undefined
      }
    }
    
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }
    )
    
    const result = await response.json()
    console.log('FCM Response:', result)
    
    return response.ok
  } catch (error) {
    console.error('FCM Error:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, title, body, data } = await req.json()
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Получаем FCM токен пользователя из Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://qkyhwdmhkoizxjazwnti.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')
    
    const supabase = createClient(supabaseUrl, supabaseKey!)
    
    const { data: tokens, error } = await supabase
      .from('user_fcm_tokens')
      .select('fcm_token')
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (error || !tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'FCM token not found for user', details: error }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const fcmToken = tokens[0].fcm_token
    const success = await sendFCMMessage(fcmToken, title || '💬 Новое сообщение', body || '', data)
    
    return new Response(
      JSON.stringify({ success, message: success ? 'Push sent' : 'Failed to send push' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
