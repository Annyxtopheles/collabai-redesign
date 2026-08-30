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
    model: 'Claude 3.5 Sonnet',
    agentId: 'brand-lead',
    timestamp: Date.now() - 3600000,
    messages: [
      {
        id: 'm-3',
        role: 'user',
        content: 'Can you formulate a high-level personal brand strategy for a Senior AI Consultant?'
      },
      {
        id: 'm-4',
        role: 'assistant',
        pipeline: ['Claude-3.5-Sonnet', 'Content Strategy', 'Brand Lead'],
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