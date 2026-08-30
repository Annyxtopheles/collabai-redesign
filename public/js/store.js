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
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          sidebarWidth: parsed.sidebarWidth || 230
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
      sidebarWidth: 230,
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

  setSidebarWidth(width) {
    if (width < 140) {
      this.state.sidebarCollapsed = true;
    } else {
      this.state.sidebarCollapsed = false;
      this.state.sidebarWidth = Math.min(Math.max(width, 180), 380);
    }
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

  // Deduplicate New Chat: reuse existing empty chat if available
  createConversation(title = 'New Conversation', initialMessage = '', agentId = 'aster-architect') {
    // If no initial message, check if an empty conversation already exists
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
      if (!conv.messages) conv.messages = [];
      conv.messages.push(message);
      conv.timestamp = Date.now();
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