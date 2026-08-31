// Scalable Themes Registry with Multi-Ambient Effect Mappings
const THEMES_CONFIG = [
  {
    id: 'dark',
    name: 'Dark Minimal',
    shortName: 'Dark',
    icon: 'moon',
    description: 'Pure #111111 dark canvas',
    badge: 'Classic',
    previewBg: '#111111',
    previewBorder: '#262626',
    previewText: '#EDEDED',
    previewAccent: '#EDEDED',
    ambientEffectName: 'Ambient Animation',
    ambientEffectDesc: 'Choose between Starfield or Cyber Glyph Matrix',
    ambientStyles: [
      { id: 'matrix', name: 'Glyph Matrix', icon: 'binary', desc: 'Cyber ASCII digital rain & code matrix' },
      { id: 'stars', name: 'Glittering Stars', icon: 'sparkles', desc: 'Micro-pinpoint serene starry twinkle' }
    ]
  },
  {
    id: 'light',
    name: 'Light Minimal',
    shortName: 'Light',
    icon: 'sun',
    description: 'Warm slate off-white clean canvas',
    badge: 'Clean',
    previewBg: '#F9F9F8',
    previewBorder: '#E5E5E5',
    previewText: '#18181B',
    previewAccent: '#18181B',
    ambientEffectName: 'Glyph Matrix',
    ambientEffectDesc: 'Subtle slate cyber ASCII digital rain & code grid',
    ambientStyles: [
      { id: 'matrix', name: 'Glyph Matrix', icon: 'binary', desc: 'Subtle slate ASCII cryptographic rain' }
    ]
  },
  {
    id: 'pink',
    name: 'Pink Wireframe',
    shortName: 'Pink',
    icon: 'sparkles',
    description: 'Warm cream canvas, bubblegum pop & falling sakura',
    badge: 'Sakura',
    previewBg: '#FAF6F0',
    previewBorder: '#000000',
    previewText: '#111111',
    previewAccent: '#FF5DA2',
    ambientEffectName: 'Falling Sakura',
    ambientEffectDesc: 'Slow drifting Japanese cherry blossom leaves',
    ambientStyles: [
      { id: 'sakura', name: 'Falling Sakura', icon: 'flower-2', desc: 'Multi-depth Japanese sakura petals' }
    ]
  }
];

// Default types, seeded data and available models
const AVAILABLE_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', provider: 'Groq Cloud', badge: 'Ultra-fast', desc: 'Flagship open weights model, fast reasoning & coding' },
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', provider: 'Groq Cloud', badge: 'Fast', desc: 'Exceptional general intelligence & math reasoning' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'Groq Cloud', badge: 'Lightweight', desc: 'Sub-100ms ultra low latency responses' },
  { id: 'claude-sonnet-4-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', badge: '200k', desc: 'Anthropic flagship creative & nuanced partner' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google', badge: 'Multimodal', desc: 'Next-gen Google multimodal reasoning engine' },
  { id: 'gpt-4.1', name: 'GPT-4.1 Turbo', provider: 'OpenAI', badge: '128k', desc: 'High capability standard for complex instructions' }
];

const DEFAULT_USER = {
  id: 'usr-1',
  name: 'Sadman Zaman Khan',
  shortName: 'Sadman',
  role: 'user',
  email: 'sadman@collabai.dev',
  avatarUrl: null
};

const DEFAULT_PROMPT_TEMPLATES = [
  {
    id: 'tmpl-1',
    title: 'Async System Architecture RFC',
    category: 'Architecture',
    icon: 'cpu',
    prompt: 'Draft an engineering RFC for a distributed, event-driven worker pool utilizing Kafka, Redis, and dead-letter queues. Include failure recovery and scaling strategies.'
  },
  {
    id: 'tmpl-2',
    title: 'Staff AI Engineer Resume Review',
    category: 'Career',
    icon: 'file-text',
    prompt: 'Review and optimize my engineering achievements for a Staff AI / Infrastructure role. Rewrite bullet points using Google XYZ format with quantified business impact.'
  },
  {
    id: 'tmpl-3',
    title: 'WCAG AAA Color Token Palette',
    category: 'Design',
    icon: 'palette',
    prompt: 'Generate an accessible, high-contrast dark mode color palette with semantic CSS variable tokens adhering to WCAG AAA contrast ratios.'
  },
  {
    id: 'tmpl-4',
    title: 'FastAPI Backend with Pydantic v2',
    category: 'Code',
    icon: 'code',
    prompt: 'Write a production-ready FastAPI endpoint with Pydantic v2 validation models, JWT verification, rate limiting, and pytest test fixtures.'
  },
  {
    id: 'tmpl-5',
    title: 'Multi-Agent Orchestration Layout',
    category: 'Agents',
    icon: 'bot',
    prompt: 'Design a multi-agent orchestration architecture where a Planner agent breaks down user intent, delegates to specialist workers, and synthesizes output.'
  }
];

const DEFAULT_AGENTS = [
  {
    id: 'aster-architect',
    name: 'Aster Architect',
    description: 'Specializes in asynchronous event pipelines, edge routers, and fault-tolerant system layouts.',
    model: 'GPT-OSS 120B',
    modelProvider: 'Groq',
    tags: ['Architecture', 'Pipelines', 'Async'],
    color: '#ffffff',
    icon: 'cpu',
    chatCount: 42,
    lastAccessed: '2m ago',
    createdDate: 'Jan 10'
  },
  {
    id: 'resume-agent',
    name: 'Resume Review Agent',
    description: 'Staff-level technical resume and portfolio optimizer aligning with FAANG ATS rubrics.',
    model: 'Claude 3.5 Sonnet',
    modelProvider: 'Anthropic',
    tags: ['Career', 'ATS', 'Executive'],
    color: '#ffffff',
    icon: 'file-text',
    chatCount: 88,
    lastAccessed: '1h ago',
    createdDate: 'Jan 08'
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generates accessible, high-contrast semantic design tokens with WCAG AAA compliance.',
    model: 'GPT-OSS 120B',
    modelProvider: 'Groq',
    tags: ['Design', 'Tokens', 'WCAG'],
    color: '#ffffff',
    icon: 'palette',
    chatCount: 19,
    lastAccessed: '3h ago',
    createdDate: 'Jan 14'
  },
  {
    id: 'brand-lead',
    name: 'Personal Brand Strategist',
    description: 'Builds authority frameworks, content cadences, and speaking outreach strategies.',
    model: 'Claude 3.5 Sonnet',
    modelProvider: 'Anthropic',
    tags: ['Branding', 'Leadership', 'Content'],
    color: '#ffffff',
    icon: 'sparkles',
    chatCount: 31,
    lastAccessed: '5h ago',
    createdDate: 'Jan 18'
  },
  {
    id: 'reasoning-advisor',
    name: 'Reasoning Advisor',
    description: 'Multi-step logic auditor, trade-off evaluator, and decision tree simulator.',
    model: 'Qwen 3.6 27B',
    modelProvider: 'Groq',
    tags: ['Logic', 'Decision Trees', 'RFC'],
    color: '#ffffff',
    icon: 'bot',
    chatCount: 64,
    lastAccessed: '1d ago',
    createdDate: 'Jan 12'
  }
];

const DEFAULT_CONVERSATIONS = [
  {
    id: 'conv-1',
    title: 'Drafting the architecture for Aster...',
    model: 'GPT-OSS 120B',
    agentId: 'aster-architect',
    timestamp: Date.now() - 120000,
    messages: [
      {
        id: 'm-1',
        role: 'user',
        content: 'Can you draft a detailed system architecture for the Aster workflow processor with async event handling?'
      },
      {
        id: 'm-2',
        role: 'assistant',
        content: `### Aster Workflow Architecture

To achieve high-throughput, non-blocking orchestration across distributed services, the Aster Workflow Engine utilizes an event-driven architecture.

#### 1. Core Component Hierarchy
- **Ingress Gateway (Edge Router)**: Terminates incoming HTTPS/gRPC requests, validates cryptographic signatures, and issues monotonic sequence IDs.
- **Buffer & Event Bus**: Apache Kafka / Redis Streams cluster partitioned by \`tenant_id\` ensuring FIFO execution per workflow.
- **Worker Dispatcher**: Lightweight supervisor managing asynchronous task workers with automatic retry backoff.

\`\`\`json
{
  "engine": "Aster-Core-v4",
  "concurrency": "10,000 req/sec",
  "p99_latency": "14.2ms",
  "fault_tolerance": "active-active multi-region"
}
\`\`\`

#### 2. Fault Tolerance & Dead-Letter Queues
Failed task executions are routed to an exponential-backoff retry queue up to 3 attempts. Unrecoverable payloads trigger telemetry events to the monitoring mesh.`,
        sources: [
          'Aster Engine Specifications v4.2',
          'Distributed Queue Benchmark Report'
        ],
        suggestions: [
          'Detail the Redis Streams partition strategy',
          'Show the Go worker implementation',
          'Add Prometheus metrics schema'
        ]
      }
    ]
  },
  {
    id: 'conv-2',
    title: 'Your Personal Brand Strategy',
    model: 'Claude 3.5 Sonnet',
    agentId: 'brand-lead',
    timestamp: Date.now() - 3600000,
    messages: [
      {
        id: 'm-2-1',
        role: 'user',
        content: 'How should I position my personal brand as a senior AI systems consultant?'
      },
      {
        id: 'm-2-2',
        role: 'assistant',
        content: `### Strategic Personal Brand Positioning

To establish your positioning as a premier Senior AI Consultant, your brand must anchor itself at the intersection of business value and deep technical realism.

#### 1. Core Pillars & Positioning
- **Strategic Translation**: Demystifying neural networks into measurable business key results.
- **Pragmatic Governance**: Championing ethical and scalable guardrails that protect intellectual property.
- **Human-in-the-Loop Workflow**: Standardizing AI augmentation to double team velocity safely.

#### 2. Content Strategy & Outposts
Publish systematic post-mortems of failed enterprise AI implementations. Detail the architecture, the specific operational bottlenecks, and how they could be re-engineered.`,
        sources: [
          'Executive Brand Playbook 2026'
        ],
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
    title: 'Reviewing my tech resume for Google Staff Role',
    model: 'GPT-OSS 120B',
    agentId: 'resume-agent',
    timestamp: Date.now() - 3600000 * 5,
    messages: []
  },
  {
    id: 'conv-4',
    title: 'Design a tech-themed color palette with WCAG AAA',
    model: 'GPT-OSS 120B',
    agentId: 'color-palette',
    timestamp: Date.now() - 3600000 * 48,
    messages: []
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Project X-2',
    icon: 'box',
    color: '#ffffff',
    itemCount: 4,
    threadCount: 30,
    instructionCount: 1,
    modifiedDate: '2/10/2026'
  },
  {
    id: 'proj-2',
    name: 'Project K-1',
    icon: 'box',
    color: '#ffffff',
    itemCount: 2,
    threadCount: 12,
    instructionCount: 1,
    modifiedDate: '2/08/2026'
  }
];

const DEFAULT_FOLDERS = [
  { id: 'f-1', name: 'Knowledge Files', items: 3, size: '4.2 MB', modified: 'Feb 10, 2026' },
  { id: 'f-2', name: 'System Architecture Specs', items: 12, size: '18.5 MB', modified: 'Feb 08, 2026' },
  { id: 'f-3', name: 'Brand Guidelines', items: 5, size: '8.1 MB', modified: 'Jan 28, 2026' },
  { id: 'f-4', name: 'User Research & Personas', items: 8, size: '12.4 MB', modified: 'Jan 22, 2026' },
  { id: 'f-5', name: 'Agent Prompt Templates', items: 14, size: '2.8 MB', modified: 'Jan 15, 2026' },
  { id: 'f-6', name: 'Meeting Transcripts', items: 6, size: '6.7 MB', modified: 'Jan 10, 2026' },
  { id: 'f-7', name: 'Code Snippets & RFCs', items: 22, size: '34.0 MB', modified: 'Jan 05, 2026' }
];