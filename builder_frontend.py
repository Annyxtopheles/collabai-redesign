import os

BASE_DIR = r"C:\Users\Zaman\.gemini\antigravity\scratch\collab-ai"

def write(rel_path, content):
    full = os.path.join(BASE_DIR, rel_path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote: {rel_path}")

# ==========================================
# 1. public/index.html
# ==========================================
index_html = r"""<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CollabAI — AI Agent Collaboration Platform</title>
  
  <!-- Inter & Cousine Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cousine:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

  <!-- Tailwind CSS Play CDN with custom config -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['Cousine', 'monospace']
          },
          colors: {
            app: {
              deepest: '#0D0D0F',
              primary: '#111114',
              surface: '#141417',
              elevated: '#171717',
              secondary: '#1A1A1F',
              tertiary: '#1E1E24',
              muted: '#252528',
              borderSubtle: '#2A2A2F',
              borderMed: '#323237',
              borderActive: '#3C3C3C',
              accent: '#315EFF',
              accentHover: '#254cd9',
              accentLight: '#60A5FA',
              textPrimary: '#FFFFFF',
              textSecondary: '#A3A3A3',
              textTertiary: '#999999',
              textMuted: '#888888',
              textDisabled: '#6B6B6B',
              success: '#34D399',
              purple: '#A78BFA',
              error: '#F87171',
              indigo: '#4F46E5',
              cyan: '#0891B2'
            }
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Marked for Markdown Parsing -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <link rel="stylesheet" href="/css/app.css" />
</head>
<body class="bg-app-deepest text-app-textPrimary font-sans antialiased overflow-hidden select-none">
  <div id="app-root" class="h-screen w-screen flex overflow-hidden">
    <!-- Rendered Dynamically by app.js -->
  </div>

  <!-- Notification Toast Container -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Global Modal Container -->
  <div id="modal-container" class="relative z-50"></div>

  <!-- Core Scripts -->
  <script src="/js/types.js"></script>
  <script src="/js/utils/time.js"></script>
  <script src="/js/store.js"></script>
  <script src="/js/components/Sidebar.js"></script>
  <script src="/js/components/ConversationDrawer.js"></script>
  <script src="/js/components/HeaderBreadcrumb.js"></script>
  <script src="/js/components/LoginView.js"></script>
  <script src="/js/components/DashboardView.js"></script>
  <script src="/js/components/ConversationsView.js"></script>
  <script src="/js/components/AgentsView.js"></script>
  <script src="/js/components/ProjectsView.js"></script>
  <script src="/js/components/KnowledgeBaseView.js"></script>
  <script src="/js/components/BugReportsView.js"></script>
  <script src="/js/app.js"></script>
</body>
</html>
"""
write("public/index.html", index_html)

# ==========================================
# 2. public/css/app.css
# ==========================================
app_css = r"""
/* CollabAI Custom Styles & Visual Tokens */
@layer base {
  * {
    border-color: #2A2A2F;
  }
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #2A2A2F;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #3C3C3C;
}

/* Skeleton pulse animation */
@keyframes shimmer {
  0% { opacity: 0.35; transform: translateX(-10%); }
  50% { opacity: 0.75; transform: translateX(0%); }
  100% { opacity: 0.35; transform: translateX(10%); }
}
.skeleton-shimmer {
  animation: shimmer 1.8s infinite ease-in-out;
}

/* Pipeline Connector Line */
.pipeline-step::after {
  content: '›';
  position: absolute;
  right: -13px;
  top: 50%;
  transform: translateY(-50%);
  color: #6B6B6B;
  font-size: 16px;
}
.pipeline-step:last-child::after {
  display: none;
}

/* Markdown rendered styles */
.prose-custom h3 {
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  margin-top: 14px;
  margin-bottom: 8px;
}
.prose-custom h4 {
  font-size: 15px;
  font-weight: 600;
  color: #FFFFFF;
  margin-top: 14px;
  margin-bottom: 6px;
}
.prose-custom p {
  color: #D4D4D8;
  font-size: 14.5px;
  line-height: 1.6;
  margin-bottom: 10px;
}
.prose-custom ul {
  list-style-type: disc;
  padding-left: 20px;
  margin-bottom: 12px;
}
.prose-custom li {
  color: #D4D4D8;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.5;
}
.prose-custom strong {
  color: #FFFFFF;
  font-weight: 600;
}
.prose-custom pre {
  background-color: #111216;
  border: 1px solid #2A2A2F;
  border-radius: 8px;
  padding: 14px 16px;
  overflow-x: auto;
  font-family: 'Cousine', monospace;
  font-size: 13px;
  color: #34D399;
  line-height: 1.5;
  margin: 12px 0;
}
.prose-custom code:not(pre code) {
  background-color: #1E1E24;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Cousine', monospace;
  font-size: 12px;
  color: #60A5FA;
}

/* Citation mark styling */
.citation-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #60A5FA;
  font-weight: 700;
  font-size: 11px;
  cursor: pointer;
  margin: 0 2px;
  vertical-align: super;
}
.citation-tag:hover {
  text-decoration: underline;
}
"""
write("public/css/app.css", app_css)

# ==========================================
# 3. public/js/types.js
# ==========================================
types_js = r"""
// Initial Seed Data & Types
const DEFAULT_USER = {
  name: 'Sadman Zaman Khan',
  shortName: 'Sadman Zan',
  email: 'sadman@collabai.dev',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
};

const DEFAULT_AGENTS = [
  {
    id: 'resume-agent',
    name: 'Resume Review Agent',
    model: 'GPT-4.1',
    modelProvider: 'GPT-4.1',
    description: 'Expert resume analysis and feedback system optimized for tech roles.',
    tags: ['File Search', 'Analysis'],
    color: '#EF4444',
    icon: 'file-text',
    createdDate: 'Jan 12',
    chatCount: 142,
    lastAccessed: '2m ago'
  },
  {
    id: 'meridian-notes',
    name: 'Meridian Notes',
    model: 'OPENAI',
    modelProvider: 'OpenAI',
    description: 'Intelligent meeting note taker and summarizer for cross-functional teams.',
    tags: ['Voice', 'Text'],
    color: '#3B82F6',
    icon: 'mic',
    createdDate: 'Jan 12',
    chatCount: 45,
    lastAccessed: 'Yesterday'
  },
  {
    id: 'prompt-retriever',
    name: 'Prompt Retriever',
    model: 'GPT-4.1',
    modelProvider: 'GPT-4.1',
    description: 'Specialized prompt engineering tool for high-density logic retrieval.',
    tags: ['Retrieval', 'Logic'],
    color: '#F59E0B',
    icon: 'terminal',
    createdDate: 'Jan 12',
    chatCount: 21,
    lastAccessed: '2 days ago'
  },
  {
    id: 'aster-architect',
    name: 'Aster Architect',
    model: 'OPENAI',
    modelProvider: 'OpenAI',
    description: 'Generates high-level system designs and architectural diagrams.',
    tags: ['Diagrams', 'Logic'],
    color: '#10B981',
    icon: 'network',
    createdDate: 'Jan 12',
    chatCount: 76,
    lastAccessed: '5h ago'
  },
  {
    id: 'reasoning-advisor',
    name: 'Reasoning Advisor',
    model: 'GPT-4.1',
    modelProvider: 'GPT-4.1',
    description: 'Philosophical reasoning and structured psychological analysis.',
    tags: ['Reasoning', 'Ethics'],
    color: '#8B5CF6',
    icon: 'brain-circuit',
    createdDate: 'Jan 12',
    chatCount: 45,
    lastAccessed: 'Yesterday'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    model: 'OPENAI',
    modelProvider: 'OpenAI',
    description: 'Generates semantic color tokens based on UI/UX context.',
    tags: ['Design', 'Image Gen'],
    color: '#EC4899',
    icon: 'palette',
    createdDate: 'Jan 12',
    chatCount: 89,
    lastAccessed: '1h ago'
  }
];

const DEFAULT_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Drafting the architecture for Aster...',
    model: 'claude-sonnet-4-5',
    agentId: 'aster-architect',
    timestamp: Date.now() - 1000 * 60 * 2, // 2m
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Can you draft a detailed system architecture for the Aster workflow processor?'
      },
      {
        id: 'm2',
        role: 'assistant',
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
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Your Personal Brand Strategy',
    model: 'claude-sonnet-4-5',
    agentId: 'color-palette',
    timestamp: Date.now() - 1000 * 60 * 60, // 1h
    messages: [
      {
        id: 'm2-1',
        role: 'user',
        content: 'Can you formulate a high-level personal brand strategy for my transition to a Senior AI Consultant role? Highlight specific focus points.'
      },
      {
        id: 'm2-2',
        role: 'assistant',
        pipeline: ['Brand Strategist', 'Market Intelligence', 'Content Critic'],
        sources: ['Executive Branding Framework v3', 'Tech Leadership Index'],
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
      }
    ]
  },
  {
    id: 'conv-3',
    title: 'Reviewing my tech resume for Goog...',
    model: 'gpt-5-mini',
    agentId: 'resume-agent',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3h
    messages: []
  },
  {
    id: 'conv-4',
    title: 'Generating primary color palette...',
    model: 'gpt-5-mini',
    agentId: 'color-palette',
    timestamp: Date.now() - 1000 * 60 * 60 * 5, // 5h
    messages: []
  },
  {
    id: 'conv-5',
    title: 'System design for scalable API...',
    model: 'claude-sonnet-4-5',
    agentId: 'aster-architect',
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2d
    messages: []
  },
  {
    id: 'conv-6',
    title: 'User research summary...',
    model: 'gpt-4.1',
    agentId: 'reasoning-advisor',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1w
    messages: []
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Project X-2',
    icon: 'box',
    color: '#8B5CF6',
    itemCount: 0,
    threadCount: 38,
    instructionCount: 1,
    modifiedDate: '11/2/2025'
  },
  {
    id: 'proj-2',
    name: 'Project K-1',
    icon: 'layers',
    color: '#06B6D4',
    itemCount: 0,
    threadCount: 32,
    instructionCount: 1,
    modifiedDate: '9/11/2025'
  }
];

const DEFAULT_FOLDERS = [
  { id: 'f-1', name: 'Sadman_Khan_Aster_Architect', items: 1, size: '0.24 MB', modified: 'Jan 30' },
  { id: 'f-2', name: 'Sadman_Khan_Color_Palette', items: 6, size: '48.94 MB', modified: 'Jan 30' },
  { id: 'f-3', name: 'Sadman_Khan_Dr_Empathy', items: 10, size: '117.36 MB', modified: 'Jan 30' },
  { id: 'f-4', name: 'Sadman_Khan_Reasoning_Advisor', items: 18, size: '930.41 MB', modified: 'Jan 30' },
  { id: 'f-5', name: 'Aster Architect', items: 1, size: '0.22 MB', modified: 'Jan 21' },
  { id: 'f-6', name: 'Reasoning Advisor', items: 12, size: '89.97 MB', modified: 'Jan 20' },
  { id: 'f-7', name: 'Color Palette Generator', items: 6, size: '46.35 MB', modified: 'Jan 19' }
];
"""
write("public/js/types.js", types_js)

# ==========================================
# 4. public/js/utils/time.js
# ==========================================
time_js = r"""
// Relative time utility matching Figma screenshot: 2m, 1h, 5h, 2d, 1w, Yrs
function formatRelativeTime(timestamp) {
  if (!timestamp) return 'now';
  const now = Date.now();
  const diffMs = now - Number(timestamp);
  
  if (diffMs < 0) return 'now';
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffYear = Math.floor(diffDay / 365);

  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 52) return `${diffWeek}w`;
  return 'Yrs';
}
"""
write("public/js/utils/time.js", time_js)

# ==========================================
# 5. public/js/store.js
# ==========================================
store_js = r"""
// Persistent Reactive State Store
class CollabStore {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
  }

  loadState() {
    const saved = localStorage.getItem('collab_ai_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state, using default', e);
      }
    }
    return {
      user: DEFAULT_USER,
      isAuthenticated: true,
      currentRoute: '/dashboard',
      activeConversationId: 'conv-1',
      sidebarCollapsed: false,
      agents: DEFAULT_AGENTS,
      conversations: DEFAULT_CONVERSATIONS,
      projects: DEFAULT_PROJECTS,
      folders: DEFAULT_FOLDERS,
      selectedModel: 'claude-sonnet-4-5',
      agentFilter: 'All',
      bugs: [
        {
          id: 'b-1',
          title: 'Prompt retriever memory leak on 200k context sessions',
          description: 'When running extended sessions with Prompt Retriever, token garbage collection is delayed.',
          priority: 'High',
          category: 'Performance',
          status: 'In Review',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        }
      ]
    };
  }

  save() {
    localStorage.setItem('collab_ai_state', JSON.stringify(this.state));
    this.notify();
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  setRoute(route, conversationId = null) {
    this.state.currentRoute = route;
    if (conversationId) {
      this.state.activeConversationId = conversationId;
    }
    this.save();
  }

  toggleSidebar() {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    this.save();
  }

  setSelectedModel(model) {
    this.state.selectedModel = model;
    this.save();
  }

  setAgentFilter(filter) {
    this.state.agentFilter = filter;
    this.save();
  }

  createConversation(title = 'New Conversation', initialMessage = '', agentId = 'aster-architect') {
    const newId = 'conv-' + Date.now();
    const newConv = {
      id: newId,
      title: title.slice(0, 36) + (title.length > 36 ? '...' : ''),
      model: this.state.selectedModel,
      agentId: agentId,
      timestamp: Date.now(),
      messages: initialMessage ? [
        { id: 'm-' + Date.now(), role: 'user', content: initialMessage }
      ] : []
    };
    this.state.conversations.unshift(newConv);
    this.state.activeConversationId = newId;
    this.state.currentRoute = '/conversations';
    this.save();
    return newId;
  }

  addMessage(conversationId, message) {
    const conv = this.state.conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messages.push(message);
      conv.timestamp = Date.now();
      // Auto-update title if it was first message
      if (conv.messages.length === 1 && message.role === 'user') {
        conv.title = message.content.slice(0, 34) + (message.content.length > 34 ? '...' : '');
      }
      this.save();
    }
  }

  createAgent(agent) {
    this.state.agents.unshift({
      id: 'agent-' + Date.now(),
      createdDate: 'Today',
      chatCount: 0,
      lastAccessed: 'Just now',
      ...agent
    });
    this.save();
  }

  createProject(name) {
    this.state.projects.unshift({
      id: 'proj-' + Date.now(),
      name: name,
      icon: 'box',
      color: '#3B82F6',
      itemCount: 0,
      threadCount: 0,
      instructionCount: 1,
      modifiedDate: new Date().toLocaleDateString()
    });
    this.save();
  }

  createFolder(name) {
    this.state.folders.unshift({
      id: 'f-' + Date.now(),
      name: name,
      items: 0,
      size: '0.00 MB',
      modified: 'Today'
    });
    this.save();
  }

  submitBug(bug) {
    this.state.bugs.unshift({
      id: 'bug-' + Date.now(),
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      ...bug
    });
    this.save();
  }

  login(user = DEFAULT_USER) {
    this.state.user = user;
    this.state.isAuthenticated = true;
    this.state.currentRoute = '/dashboard';
    this.save();
  }

  logout() {
    this.state.isAuthenticated = false;
    this.state.currentRoute = '/login';
    this.save();
  }
}

const appStore = new CollabStore();
"""
write("public/js/store.js", store_js)
