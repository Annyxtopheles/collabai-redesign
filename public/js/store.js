// Persistent Reactive State Store with Multi-Theme Support (Dark, Light, Pink) & Ambient Particles
class CollabStore {
  constructor() {
    this.subscribers = [];
    this.state = this.loadState();
    this.applyTheme(this.state.theme || 'dark');
  }

  loadState() {
    const savedTheme = localStorage.getItem('collab_theme') || 'dark';
    const savedAmbientEffects = localStorage.getItem('collab_ambient_effects') !== 'false';
    const saved = localStorage.getItem('collab_ai_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          theme: parsed.theme || savedTheme,
          ambientEffectsEnabled: (parsed.ambientEffectsEnabled !== undefined) ? parsed.ambientEffectsEnabled : savedAmbientEffects,
          sidebarWidth: parsed.sidebarWidth || 260,
          sidebarCollapsed: parsed.sidebarCollapsed || false,
          selectedModel: parsed.selectedModel || 'openai/gpt-oss-120b',
          projectViewMode: parsed.projectViewMode || 'list',
          knowledgeViewMode: parsed.knowledgeViewMode || 'list',
          agentsViewMode: parsed.agentsViewMode || 'grid'
        };
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
      sidebarWidth: 260,
      searchQuery: '',
      theme: savedTheme,
      ambientEffectsEnabled: savedAmbientEffects,
      projectViewMode: 'list',
      knowledgeViewMode: 'list',
      agentsViewMode: 'grid',
      agents: DEFAULT_AGENTS,
      conversations: DEFAULT_CONVERSATIONS,
      projects: DEFAULT_PROJECTS,
      folders: DEFAULT_FOLDERS,
      selectedModel: 'openai/gpt-oss-120b',
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

  applyTheme(theme) {
    // Dynamically remove any existing theme classes
    if (typeof THEMES_CONFIG !== 'undefined') {
      THEMES_CONFIG.forEach(t => document.documentElement.classList.remove(t.id));
    } else {
      document.documentElement.classList.remove('dark', 'light', 'pink');
    }
    document.documentElement.classList.add(theme);
    localStorage.setItem('collab_theme', theme);

    if (typeof ambientStarfield !== 'undefined' && ambientStarfield.checkThemeState) {
      ambientStarfield.checkThemeState();
    }
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.applyTheme(theme);
    this.save();
  }

  toggleTheme() {
    const themes = (typeof THEMES_CONFIG !== 'undefined') ? THEMES_CONFIG.map(t => t.id) : ['dark', 'light', 'pink'];
    const currentIndex = themes.indexOf(this.state.theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    this.setTheme(nextTheme);
    return nextTheme;
  }

  setAmbientEffects(enabled) {
    this.state.ambientEffectsEnabled = enabled;
    localStorage.setItem('collab_ambient_effects', enabled ? 'true' : 'false');
    if (typeof ambientStarfield !== 'undefined' && ambientStarfield.checkThemeState) {
      ambientStarfield.checkThemeState();
    }
    this.save();
  }

  toggleAmbientEffects() {
    this.setAmbientEffects(!this.state.ambientEffectsEnabled);
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

  setSidebarWidth(width) {
    if (width < 140) {
      this.state.sidebarCollapsed = true;
    } else {
      this.state.sidebarCollapsed = false;
      this.state.sidebarWidth = Math.min(Math.max(width, 200), 400);
    }
    this.save();
  }

  setSelectedModel(modelId) {
    this.state.selectedModel = modelId;
    const conv = this.state.conversations.find(c => c.id === this.state.activeConversationId);
    if (conv) {
      conv.model = modelId;
    }
    this.save();
  }

  setAgentFilter(filter) {
    this.state.agentFilter = filter;
    this.save();
  }

  setProjectViewMode(mode) {
    this.state.projectViewMode = mode;
    this.save();
  }

  setKnowledgeViewMode(mode) {
    this.state.knowledgeViewMode = mode;
    this.save();
  }

  setAgentsViewMode(mode) {
    this.state.agentsViewMode = mode;
    this.save();
  }

  // Deep Search across thread titles AND internal message contents
  deepSearch(query) {
    if (!query || !query.trim()) {
      return this.state.conversations;
    }
    const q = query.toLowerCase().trim();
    return this.state.conversations.filter(conv => {
      const matchTitle = (conv.title || '').toLowerCase().includes(q);
      const matchMessages = (conv.messages || []).some(m => (m.content || '').toLowerCase().includes(q));
      return matchTitle || matchMessages;
    });
  }

  createConversation(title = 'New Conversation', initialMessage = '', agentId = 'aster-architect') {
    if (!initialMessage) {
      const existingEmpty = this.state.conversations.find(c => (!c.messages || c.messages.length === 0));
      if (existingEmpty) {
        this.state.activeConversationId = existingEmpty.id;
        this.state.currentRoute = '/conversations';
        this.save();
        return existingEmpty.id;
      }
    }

    const newId = 'conv-' + Date.now();
    const newConv = {
      id: newId,
      title: title.slice(0, 42) + (title.length > 42 ? '...' : ''),
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
      if (!conv.messages) conv.messages = [];
      conv.messages.push(message);
      conv.timestamp = Date.now();
      if (conv.messages.length === 1 && message.role === 'user') {
        conv.title = message.content.slice(0, 36) + (message.content.length > 36 ? '...' : '');
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
      color: '#ffffff',
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