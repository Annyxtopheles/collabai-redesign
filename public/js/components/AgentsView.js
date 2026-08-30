// Combined AI Agents & Templates Screen with Full Theme Support (Dark & Light)
function renderAgentsView(state) {
  const agents = state.agents || [];
  const activeFilter = state.agentFilter || 'All';
  const viewMode = state.agentsViewMode || 'grid';

  const templates = [
    { id: 't-1', name: 'Async Event Architect', description: 'Design event-driven worker pools with Kafka, Redis, and webhook dispatchers.', model: 'GPT-OSS 120B', tags: ['Architecture', 'Async'], icon: 'cpu' },
    { id: 't-2', name: 'FAANG Staff Resume Optimizer', description: 'Rewrites engineering bullet points to meet Staff level ATS parsing criteria.', model: 'Claude 3.5 Sonnet', tags: ['Career', 'ATS'], icon: 'file-text' },
    { id: 't-3', name: 'Accessible Semantic UI Palette', description: 'Generates WCAG AAA compliant color tokens with CSS variable exports.', model: 'GPT-OSS 120B', tags: ['Design', 'Tokens'], icon: 'palette' }
  ];

  const filteredAgents = agents.filter(a => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'GPT-OSS 120B') return a.model === 'GPT-OSS 120B';
    if (activeFilter === 'Claude 3.5') return (a.model || '').includes('Claude');
    if (activeFilter === 'Active') return a.chatCount > 0;
    return true;
  });

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('AI Agents')}

      <div class="p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-7">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">AI Agents & Templates</h1>
            <p class="text-[13.5px] text-app-textSecondary">Deploy specialized multi-agent personalities or start from pre-built templates</p>
          </div>
          <button 
            onclick="showCreateAgentModal()"
            class="btn-primary text-[13px] px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2">
            <span>Create Agent</span>
          </button>
        </div>

        <!-- Search Bar, Filter Tabs & Functional Grid/List Toggles -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="relative flex-1 flex items-center">
              <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
              <input 
                type="text" 
                placeholder="Search agents by name, model or tags..." 
                id="agents-search-input"
                oninput="filterAgentsSearch(this.value)"
                class="w-full bg-app-surface border border-app-borderSubtle text-app-textPrimary placeholder-app-textMuted text-[13.5px] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-app-borderActive transition-colors font-normal"
              />
            </div>
            <div class="flex items-center gap-1 bg-app-surface p-1 rounded-xl border border-app-borderSubtle">
              <button 
                onclick="appStore.setAgentsViewMode('grid')" 
                title="Grid view"
                class="p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-app-hover text-app-textPrimary' : 'text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="layout-grid" class="w-4 h-4"></i>
              </button>
              <button 
                onclick="appStore.setAgentsViewMode('list')" 
                title="List view"
                class="p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-app-hover text-app-textPrimary' : 'text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="list" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            ${['All', 'GPT-OSS 120B', 'Claude 3.5', 'Active'].map(f => `
              <button 
                onclick="appStore.setAgentFilter('${f}')"
                class="text-[12px] font-medium px-3 py-1 rounded-full transition-colors ${activeFilter === f ? 'btn-primary' : 'bg-app-surface text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary border border-app-borderSubtle'}">
                ${f}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Pre-configured Templates Section -->
        <div class="flex flex-col gap-3">
          <span class="text-[11px] font-medium uppercase tracking-wider text-app-textMuted">Featured Templates</span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            ${templates.map(t => `
              <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-app-borderMed transition-all cursor-pointer group shadow-sm" onclick="appStore.createConversation('${escapeHtml(t.name)}', '')">
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[13.5px] font-medium text-app-textPrimary group-hover:text-app-textPrimary">${t.name}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-app-input text-app-textMuted border border-app-borderSubtle">${t.model}</span>
                  </div>
                  <p class="text-[12px] text-app-textSecondary line-clamp-2 leading-relaxed">${t.description}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[11.5px]">
                  <span class="text-app-textPrimary font-medium group-hover:underline">Use Template →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Custom Agents Section (Grid vs List) -->
        <div class="flex flex-col gap-3 pt-2 border-t border-app-borderSubtle">
          <span class="text-[11px] font-medium uppercase tracking-wider text-app-textMuted">All Agents (${filteredAgents.length})</span>
          
          ${viewMode === 'grid' ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="agents-grid-container">
              ${filteredAgents.map(agent => renderAgentCardGrid(agent)).join('')}
            </div>
          ` : `
            <div class="flex flex-col gap-2.5" id="agents-grid-container">
              ${filteredAgents.map(agent => renderAgentCardList(agent)).join('')}
            </div>
          `}
        </div>

      </div>
    </div>
  `;
}

function renderAgentCardGrid(agent) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-app-borderMed transition-all group shadow-sm">
      <div class="flex flex-col gap-3.5">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
            <i data-lucide="${agent.icon || 'bot'}" class="w-5 h-5"></i>
          </div>
          <button class="text-app-textMuted hover:text-app-textPrimary p-1 rounded-lg hover:bg-app-hover transition-colors">
            <i data-lucide="settings" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-[15px] font-medium text-app-textPrimary tracking-tight">${escapeHtml(agent.name)}</h3>
            <span class="text-[10px] font-medium uppercase tracking-wider bg-app-input text-app-textSecondary px-1.5 py-0.5 rounded border border-app-borderSubtle">${agent.model || 'OPENAI'}</span>
          </div>
          <p class="text-[12.5px] text-app-textSecondary line-clamp-2 leading-relaxed font-normal">${escapeHtml(agent.description)}</p>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          ${(agent.tags || []).map(t => `
            <span class="text-[11px] bg-app-input text-app-textMuted px-2 py-0.5 rounded border border-app-borderSubtle">${t}</span>
          `).join('')}
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-app-borderSubtle text-[12px]">
        <span class="text-app-textMuted">${agent.chatCount || 0} chats</span>
        <button 
          onclick="appStore.createConversation('${escapeHtml(agent.name)}', '', '${agent.id}')"
          class="btn-primary text-[12px] px-3.5 py-1.5 rounded-xl transition-colors">
          Chat
        </button>
      </div>
    </div>
  `;
}

function renderAgentCardList(agent) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex items-center justify-between hover:border-app-borderMed transition-all group shadow-sm">
      <div class="flex items-center gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
          <i data-lucide="${agent.icon || 'bot'}" class="w-4 h-4"></i>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <h3 class="text-[14px] font-medium text-app-textPrimary group-hover:text-app-textPrimary">${escapeHtml(agent.name)}</h3>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-app-input text-app-textMuted border border-app-borderSubtle">${agent.model || 'OPENAI'}</span>
          </div>
          <p class="text-[12px] text-app-textSecondary font-normal line-clamp-1">${escapeHtml(agent.description)}</p>
        </div>
      </div>

      <button 
        onclick="appStore.createConversation('${escapeHtml(agent.name)}', '', '${agent.id}')"
        class="btn-primary text-[12px] px-3.5 py-1.5 rounded-xl transition-colors">
        Chat
      </button>
    </div>
  `;
}

function filterAgentsSearch(query) {
  const container = document.getElementById('agents-grid-container');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const filtered = appStore.state.agents.filter(a => (a.name || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q));
  const viewMode = appStore.state.agentsViewMode || 'grid';

  if (viewMode === 'grid') {
    container.innerHTML = filtered.map(a => renderAgentCardGrid(a)).join('');
  } else {
    container.innerHTML = filtered.map(a => renderAgentCardList(a)).join('');
  }
  lucide.createIcons();
}

function showCreateAgentModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onclick="closeModal()">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-app-borderSubtle pb-3">
          <h2 class="text-[16px] font-semibold text-app-textPrimary">Create New AI Agent</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-app-textPrimary p-1 rounded-lg hover:bg-app-hover">✕</button>
        </div>

        <form onsubmit="handleCreateAgentSubmit(event)" class="flex flex-col gap-4 text-[13px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Agent Name</label>
            <input type="text" id="new-agent-name" required placeholder="e.g. Lead Generation Advisor" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Model Engine</label>
            <select id="new-agent-model" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3 py-2 focus:outline-none focus:border-app-borderActive">
              <option value="GPT-OSS 120B">GPT-OSS 120B (Groq)</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
              <option value="Qwen 3.6 27B">Qwen 3.6 27B</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">System Instructions / Prompt</label>
            <textarea id="new-agent-prompt" rows="3" placeholder="Define the agent's core personality, rules, and capabilities..." class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Tags (comma separated)</label>
            <input type="text" id="new-agent-tags" placeholder="Marketing, Analytics, Python" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-app-borderSubtle">
            <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-xl bg-app-input border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-1.5 rounded-xl">Create Agent</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function handleCreateAgentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-agent-name').value.trim();
  const model = document.getElementById('new-agent-model').value;
  const prompt = document.getElementById('new-agent-prompt').value.trim();
  const tags = document.getElementById('new-agent-tags').value.split(',').map(s => s.trim()).filter(Boolean);

  appStore.createAgent({
    name,
    model,
    modelProvider: model,
    description: prompt || 'Custom tailored AI agent.',
    tags: tags.length > 0 ? tags : ['General', 'Assistant'],
    color: '#ffffff',
    icon: 'bot'
  });

  closeModal();
  showToast(`Agent "${name}" created successfully!`);
}