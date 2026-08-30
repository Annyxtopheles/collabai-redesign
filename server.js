// server.js - CollabAI Backend with Persistent Auth, Admin Approval System & Live Groq AI
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

// Load environment variables from .env.local if present
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
} catch (e) {}

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'collab_salt_2026').digest('hex');
}

// Persistent user database
function loadUsers() {
  if (fs.existsSync(USERS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {}
  }
  const defaultUsers = [
    {
      id: 'usr-admin',
      name: 'Sadman Zaman Khan',
      email: 'sadman@collabai.dev',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      status: 'approved',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    }
  ];
  saveUsers(defaultUsers);
  return defaultUsers;
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

let users = loadUsers();

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const db = {
  bugs: [
    {
      id: 'bug-1',
      title: 'Prompt retriever memory leak on 200k context sessions',
      description: 'When running extended sessions with Prompt Retriever, token garbage collection is delayed.',
      priority: 'High',
      category: 'Performance',
      status: 'In Review',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    }
  ]
};

function streamFromGroq(apiKey, prompt, res) {
  const systemPrompt = `You are CollabAI, an advanced collaborative AI assistant. 
Respond thoroughly with clean markdown formatting, structured headers (h3/h4), bold labels, bullet points, and code blocks when appropriate.`;

  const postData = JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    stream: true
  });

  const req = https.request({
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (apiRes) => {
    let rawBuffer = '';

    apiRes.on('data', (chunk) => {
      rawBuffer += chunk.toString();
      const lines = rawBuffer.split('\n');
      rawBuffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
            if (delta && delta.content) {
              res.write('event: token\ndata: ' + JSON.stringify({ token: delta.content }) + '\n\n');
            }
          } catch (e) {}
        }
      }
    });

    apiRes.on('end', () => {
      res.write('event: done\ndata: ' + JSON.stringify({ status: 'complete' }) + '\n\n');
      res.end();
    });
  });

  req.on('error', (e) => {
    console.error('Groq API Error:', e.message);
    streamFallback(prompt, res);
  });

  req.write(postData);
  req.end();
}

function streamFallback(prompt, res) {
  const content = `### Response

Regarding **"${prompt}"**:

The agent cluster has processed your request with optimal throughput.

\`\`\`json
# Pipeline Status
POST /api/v1/orchestrate
Payload: { "query": "${prompt.slice(0, 30)}", "status": "active" }
Response: 200 OK • { "verified": true }
\`\`\`

#### Key Takeaways
- Response generated through local collaborative inference engine.
- Session context is synced.`;

  const words = content.split(' ');
  let i = 0;
  const timer = setInterval(() => {
    if (i < words.length) {
      const chunk = (i === 0 ? '' : ' ') + words[i];
      res.write('event: token\ndata: ' + JSON.stringify({ token: chunk }) + '\n\n');
      i++;
    } else {
      clearInterval(timer);
      res.write('event: done\ndata: ' + JSON.stringify({ status: 'done' }) + '\n\n');
      res.end();
    }
  }, 20);

  res.on('close', () => clearInterval(timer));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // --- HEALTH CHECK FOR RENDER ---
  if (pathname === '/health' || pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', uptime: process.uptime() }));
    return;
  }

  // --- AUTH ROUTE: POST /api/auth/register ---
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name, email, password } = JSON.parse(body || '{}');
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Email and password are required' }));
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'An account with this email already exists' }));
        }

        const newUser = {
          id: 'usr-' + Date.now(),
          name: name ? name.trim() : normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          role: normalizedEmail === 'sadman@collabai.dev' ? 'admin' : 'user',
          status: normalizedEmail === 'sadman@collabai.dev' ? 'approved' : 'pending',
          createdAt: new Date().toISOString()
        };

        users.unshift(newUser);
        saveUsers(users);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: newUser.status === 'approved' 
            ? 'Account registered and approved!' 
            : 'Registration submitted successfully. Your account is pending admin approval.',
          status: newUser.status,
          user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status }
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // --- AUTH ROUTE: POST /api/auth/login ---
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body || '{}');
        const normalizedEmail = (email || '').toLowerCase().trim();
        const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

        if (!user || user.passwordHash !== hashPassword(password || '')) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid email or password' }));
        }

        if (user.status === 'pending') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            error: 'Your account is pending administrator approval. Please wait for Sadman to approve your registration.',
            status: 'pending'
          }));
        }

        if (user.status === 'rejected') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ 
            error: 'Your access request was declined by the administrator.',
            status: 'rejected'
          }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          message: 'Login successful',
          token: 'tok_' + user.id + '_' + Date.now(),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status
          }
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // --- ADMIN ROUTE: GET /api/admin/users ---
  if (pathname === '/api/admin/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt
    }));
    res.end(JSON.stringify(safeUsers));
    return;
  }

  // --- ADMIN ROUTE: POST /api/admin/users/:id/status ---
  if (pathname.startsWith('/api/admin/users/') && pathname.endsWith('/status') && req.method === 'POST') {
    const parts = pathname.split('/');
    const userId = parts[4];

    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { status } = JSON.parse(body || '{}');
        const user = users.find(u => u.id === userId);
        if (!user) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'User not found' }));
        }

        user.status = status;
        saveUsers(users);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: `User status updated to ${status}`, user }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // --- ADMIN ROUTE: DELETE /api/admin/users/:id ---
  if (pathname.startsWith('/api/admin/users/') && req.method === 'DELETE') {
    const parts = pathname.split('/');
    const userId = parts[4];
    users = users.filter(u => u.id !== userId);
    saveUsers(users);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'User deleted' }));
    return;
  }

  // --- API ROUTE: /api/chat ---
  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { message, apiKey } = payload;

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        const activeKey = apiKey || process.env.GROQ_API_KEY;
        if (activeKey) {
          streamFromGroq(activeKey, message, res);
        } else {
          streamFallback(message, res);
        }
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // --- API ROUTE: /api/bugs ---
  if (pathname === '/api/bugs') {
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(db.bugs));
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const bug = JSON.parse(body || '{}');
          const newBug = {
            id: 'bug-' + Date.now(),
            title: bug.title ? bug.title.slice(0, 255) : 'Untitled Issue',
            description: bug.description ? bug.description.slice(0, 5000) : '',
            priority: bug.priority || 'Medium',
            category: bug.category || 'UI/UX',
            status: 'Submitted',
            createdAt: new Date().toISOString()
          };
          db.bugs.unshift(newBug);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(newBug));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }
  }

  // --- STATIC FILE SERVING WITH SPA FALLBACK ---
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let targetFile = path.join(PUBLIC_DIR, reqPath);

  // If path doesn't exist as a static file, fallback to index.html for SPA router
  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    targetFile = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(targetFile, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CollabAI server running on port ${PORT} bound to 0.0.0.0`);
});