import os

BASE_DIR = r"C:\Users\Zaman\.gemini\antigravity\scratch\collab-ai"

def write(path, content):
    full = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote: {path}")

# ==========================================
# 1. server.js
# ==========================================
server_js = """
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

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

const AGENT_RESPONSES = {
  aster: {
    title: 'System Architecture Design: Aster Processor',
    pipeline: ['Aster Architect', 'Knowledge Base', 'Reasoning Advisor'],
    sources: ['Aster Architecture Docs', 'API Schema Reference'],
    content: `### System Architecture Design: Aster Processor

The Aster workflow processor utilizes an asynchronous event-driven layout. Below are the primary modular layers and API schemas.

\`\`\`json
# Layer 1: Ingestion Edge & Webhook Dispatcher
POST /api/v1/workflows/trigger
Payload: { "workflow_id": "uuid-9081", "async": true, "context": {} }
Response: 202 Accepted • { "job_id": "job-5502", "status": "queued" }

# Layer 2: Async Queue Broker (Redis Cache) [2]
GET /api/v1/jobs/:job_id/status
Response: 200 OK • { "job_id": "job-5502", "progress": "42%", "active_nodes": 2 }
\`\`\`

#### Key Scalability Considerations
- **Idempotency Keys**: Restrict repeated HTTP execution by caching unique transaction tokens at the ingress API edge. [1]
- **Node Quarantine**: Isolate heavy tasks dynamically into separate memory pools to prevent main queue starvation.`,
    suggestions: [
      'Show the error-handling flow',
      'Add rate limiting to this endpoint',
      'Detail the retry strategy'
    ]
  },
  brand: {
    title: 'Your Personal Brand Strategy',
    pipeline: ['Claude-sonnet-4-5', 'Content Strategy', 'Brand Lead'],
    sources: ['Executive Branding Guide', 'Market Positioning 2026'],
    content: `### Your Personal Brand Strategy

To establish your positioning as a premier Senior AI Consultant, your brand must anchor itself at the intersection of business value and deep technical realism.

#### 1. Core Pillars & Positioning
- **Strategic Translation**: Demystifying neural networks into measurable business key results.
- **Pragmatic Governance**: Championing ethical and scalable guardrails that protect intellectual property.
- **Human-in-the-Loop Workflow**: Standardizing AI augmentation to double team velocity safely.

#### 2. Content Strategy & Outposts
Publish systematic post-mortems of failed enterprise AI implementations. Detail the architecture, the specific operational bottlenecks, and how they could be re-engineered.`,
    suggestions: [
      'Draft the LinkedIn headline',
      'Outline a 90-day content calendar',
      'Suggest 5 speaking topics'
    ]
  },
  resume: {
    title: 'Reviewing my tech resume for Google Staff Role',
    pipeline: ['Resume Review Agent', 'FAANG ATS Engine', 'Career Coach'],
    sources: ['Staff SWE Hiring Rubric', 'ATS Keyword Index'],
    content: `### Tech Resume Optimization: Staff AI Engineer

Your resume demonstrates high-impact systems leadership. Here is the structured breakdown to maximize recruiter and hiring manager conversion:

#### 1. Quantifiable Metric Elevators
- **Current**: "Engineered real-time data pipelines for computer vision inference."
- **Elevated**: "Architected streaming inference pipeline scaling to **180k QPS** with **P99 latency sub-14ms**, reducing GPU cloud expenditures by **$1.2M annually**." [1]

#### 2. Leadership & Cross-Functional Scale
- Emphasize ownership of technical RFCs across multiple squads.
- Highlight mentoring of 8+ senior engineers and standardizing testing frameworks across the organization.`,
    suggestions: [
      'Rewrite the summary paragraph for Staff level',
      'Generate action verbs list for AI engineering',
      'Audit against FAANG ATS keywords'
    ]
  }
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { message, agentId } = payload;

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });

        let key = 'aster';
        const msg = (message || '').toLowerCase();
        if (msg.includes('brand') || msg.includes('consultant')) {
          key = 'brand';
        } else if (msg.includes('resume') || msg.includes('cv') || msg.includes('job') || agentId === 'resume-agent') {
          key = 'resume';
        }

        const data = AGENT_RESPONSES[key] || AGENT_RESPONSES['aster'];

        res.write('event: pipeline\\ndata: ' + JSON.stringify({
          pipeline: data.pipeline,
          sources: data.sources,
          suggestions: data.suggestions
        }) + '\\n\\n');

        const words = data.content.split(' ');
        let i = 0;
        const timer = setInterval(() => {
          if (i < words.length) {
            const chunk = (i === 0 ? '' : ' ') + words[i];
            res.write('event: token\\ndata: ' + JSON.stringify({ token: chunk }) + '\\n\\n');
            i++;
          } else {
            clearInterval(timer);
            res.write('event: done\\ndata: ' + JSON.stringify({ status: 'done' }) + '\\n\\n');
            res.end();
          }
        }, 25);

        req.on('close', () => clearInterval(timer));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

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

  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log('CollabAI server ready on port ' + PORT);
});
"""
write("server.js", server_js)
