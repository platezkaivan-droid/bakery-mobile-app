// Комбинированный сервер: статика + push API
// Запуск: node admin-server.js
// Или: start-admin.bat

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const PUSH_PORT = 3001;

// Firebase Service Account
const SERVICE_ACCOUNT = {
  project_id: "bakery-app-6452b",
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
  token_uri: "https://oauth2.googleapis.com/token"
};

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Base64 URL encode
function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Create JWT
function createJWT() {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: SERVICE_ACCOUNT.client_email,
    sub: SERVICE_ACCOUNT.client_email,
    aud: SERVICE_ACCOUNT.token_uri,
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(SERVICE_ACCOUNT.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signature}`;
}

// Get OAuth2 access token
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const jwt = createJWT();
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.access_token);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Send FCM message
async function sendFCM(token, title, body) {
  const accessToken = await getAccessToken();
  
  const message = {
    message: {
      token: token,
      notification: { title, body },
      android: {
        priority: 'high',
        notification: { sound: 'default', channel_id: 'default' }
      },
      data: { type: 'support_chat' }
    }
  };

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(message);
    
    const options = {
      hostname: 'fcm.googleapis.com',
      path: `/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('FCM Response:', res.statusCode, data);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Static file server + Push API
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Push API endpoint
  if (req.method === 'POST' && req.url === '/send-push') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { fcm_token, title, message } = JSON.parse(body);
        
        if (!fcm_token) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'fcm_token required' }));
          return;
        }

        console.log('📤 Sending push to:', fcm_token.substring(0, 30) + '...');
        const success = await sendFCM(fcm_token, title || '💬 Поддержка', message || '');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success }));
      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/admin-chat.html' : req.url;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   АДМИН-ПАНЕЛЬ ЧАТА ПОДДЕРЖКИ');
  console.log('   ========================================');
  console.log('');
  console.log(`   📱 Открой в браузере: http://localhost:${PORT}`);
  console.log(`   📤 Push API: http://localhost:${PORT}/send-push`);
  console.log('');
  console.log('   Нажми Ctrl+C чтобы остановить');
  console.log('');
});
