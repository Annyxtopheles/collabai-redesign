// AI Agents Grid Screen - Clean typography & all-white monochrome icons
function renderAgentsView(state) {
  const agents = state.agents || [];
  const activeFilter = state.agentFilter || 'All';

  const filteredAgents = agents.filter(a => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'GPT-5-mini') return a.model === 'GPT-5-mini' || a.modelProvider === 'GPT-5-mini';
    if (activeFilter === 'GPT-4.1') return a.model === 'GPT-4.1' || a.modelProvider === 'GPT-4.1';
    if (activeFilter === 'Active') return a.chatCount > 0;
    return true;
  });

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('AI Agents')}

      <div class="p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <h1 class="text-[22px] font-semibold text-white tracking-tight">AI Agents</h1>
          <button 
            onclick="showCreateAgentModal()"
            class="bg-app-accent hover:bg-app-accentHover text-white font-medium text-[13px] px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <span>Create Agent</span>
          </button>
        </div>

        <!-- Search & Filter Tabs -->
        <div class="flex flex-col gap-3">
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search agents by name, model or tags..." 
              id="agents-search-input"
              oninput="filterAgentsSearch(this.value)"
              class="w-full bg-app-surface border border-app-borderSubtle text-white placeholder-app-textMuted text-[13.5px] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-app-borderActive transition-colors"
            />
          </div>

          <div class="flex items-center gap-1.5">
            ${['All', 'GPT-5-mini', 'GPT-4.1', 'Active'].map(f => `
              <button 
                onclick="appStore.setAgentFilter('${f}')"
                class="text-[12px] font-medium px-3 py-1 rounded-full transition-colors ${activeFilter === f ? 'bg-app-accent text-white' : 'bg-app-surface text-app-textSecondary hover:bg-app-hover hover:text-white border border-app-borderSubtle'}">
                ${f}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Agent Cards Grid with White Icon + Low Opacity White Background -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="agents-grid-container">
          ${filteredAgents.map(agent => renderAgentCard(agent)).join('')}
        </div>

      </div>
    </div>
  `;
}

function renderAgentCard(agent) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-app-borderMed transition-all group">
      <div class="flex flex-col gap-3.5">
        
        <!-- Monochrome Card Icon: Pure White Icon + Low Opacity White Background -->
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
            <i data-lucide="${agent.icon || 'bot'}" class="w-5 h-5 text-white"></i>
          </div>
          <button class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover transition-colors">
            <i data-lucide="settings" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Name & Model Pill -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-[15px] font-medium text-white tracking-tight">${agent.name}</h3>
            <span class="text-[10px] font-medium uppercase tracking-wider bg-app-input text-app-textSecondary px-1.5 py-0.5 rounded border border-app-borderSubtle">${agent.model || 'OPENAI'}</span>
          </div>
          <p class="text-[12.5px] text-app-textSecondary line-clamp-2 leading-relaxed font-normal">${agent.description}</p>
        </div>

        <!-- Tag Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          ${(agent.tags || []).map(t => `
            <span class="text-[11px] bg-app-input text-app-textMuted px-2 py-0.5 rounded border border-app-borderSubtle">${t}</span>
          `).join('')}
        </div>
      </div>

      <!-- Card Footer with Blue Chat CTA -->
      <div class="flex items-center justify-between pt-3 border-t border-app-borderSubtle text-[12px]">
        <span class="text-app-textMuted">Created ${agent.createdDate || 'Jan 12'}</span>
        <button 
          onclick="appStore.createConversation('${agent.name}', '', '${agent.id}')"
          class="bg-app-accent hover:bg-app-accentHover text-white font-medium text-[12px] px-3.5 py-1.5 rounded-lg transition-colors">
          Chat
        </button>
      </div>
    </div>
  `;
}

function showCreateAgentModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-semibold text-white">Create New AI Agent</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form onsubmit="handleCreateAgentSubmit(event)" class="flex flex-col gap-4 text-[13px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Agent Name</label>
            <input type="text" id="new-agent-name" required placeholder="e.g. Lead Generation Advisor" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Model Engine</label>
            <select id="new-agent-model" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3 py-2 focus:outline-none focus:border-app-borderActive">
              <option value="GPT-4.1">GPT-4.1</option>
              <option value="GPT-5-mini">GPT-5-mini</option>
              <option value="Claude-3.5-Sonnet">Claude-3.5-Sonnet</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">System Instructions / Prompt</label>
            <textarea id="new-agent-prompt" rows="3" placeholder="Define the agent's core personality, rules, and system capabilities..." class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive resize-none"></textarea>
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Tags (comma separated)</label>
            <input type="text" id="new-agent-tags" placeholder="Marketing, Analytics, Python" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium">Create Agent</button>
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