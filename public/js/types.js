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
