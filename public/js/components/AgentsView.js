// AI Agents Grid Screen matching Screenshot 4
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

      <div class="p-10 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <h1 class="text-[28px] font-bold text-white tracking-tight">AI Agents</h1>
          <button 
            onclick="showCreateAgentModal()"
            class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] px-5 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <span>Create Agent</span>
          </button>
        </div>

        <!-- Search & Filter Tabs -->
        <div class="flex flex-col gap-4">
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search agents by name, model or tags..." 
              id="agents-search-input"
              oninput="filterAgentsSearch(this.value)"
              class="w-full bg-app-surface border border-app-borderSubtle text-white placeholder-app-textMuted text-[14px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors"
            />
          </div>

          <div class="flex items-center gap-2">
            ${['All', 'GPT-5-mini', 'GPT-4.1', 'Active'].map(f => `
              <button 
                onclick="appStore.setAgentFilter('${f}')"
                class="text-[12.5px] font-semibold px-3.5 py-1 rounded-full transition-colors ${activeFilter === f ? 'bg-app-accent text-white' : 'bg-app-surface text-app-textSecondary hover:bg-app-hover hover:text-white border border-app-borderSubtle'}">
                ${f}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Agent Cards Grid (Screenshot 4) in #171717 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="agents-grid-container">
          ${filteredAgents.map(agent => renderAgentCard(agent)).join('')}
        </div>

      </div>
    </div>
  `;
}

function renderAgentCard(agent) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 flex flex-col justify-between gap-5 hover:border-app-borderMed transition-all group">
      <div class="flex flex-col gap-4">
        
        <!-- Card Top Icon & Badges -->
        <div class="flex items-center justify-between">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center border" style="background-color: ${agent.color}20; border-color: ${agent.color}45">
            <i data-lucide="${agent.icon || 'bot'}" class="w-6 h-6" style="color: ${agent.color}"></i>
          </div>
          <button class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover">
            <i data-lucide="settings" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Name & Model Pill -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h3 class="text-[16px] font-bold text-white tracking-tight">${agent.name}</h3>
            <span class="text-[10px] font-bold uppercase tracking-wider bg-app-input text-app-textSecondary px-2 py-0.5 rounded border border-app-borderSubtle">${agent.model || 'OPENAI'}</span>
          </div>
          <p class="text-[13px] text-app-textSecondary line-clamp-2 leading-relaxed">${agent.description}</p>
        </div>

        <!-- Tag Chips -->
        <div class="flex items-center gap-1.5 flex-wrap">
          ${(agent.tags || []).map(t => `
            <span class="text-[11.5px] bg-app-input text-app-textMuted px-2.5 py-0.5 rounded-md border border-app-borderSubtle">${t}</span>
          `).join('')}
        </div>
      </div>

      <!-- Card Footer with Blue Chat CTA -->
      <div class="flex items-center justify-between pt-3 border-t border-app-borderSubtle text-[12px]">
        <span class="text-app-textMuted">Created ${agent.createdDate || 'Jan 12'}</span>
        <button 
          onclick="appStore.createConversation('${agent.name}', '', '${agent.id}')"
          class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[12.5px] px-4 py-1.5 rounded-lg transition-colors">
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
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-white">Create New AI Agent</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="handleCreateAgentSubmit(event)" class="flex flex-col gap-4 text-[13.5px]">
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

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-semibold">Create Agent</button>
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
    color: '#3B82F6',
    icon: 'bot'
  });

  closeModal();
  showToast(`Agent "${name}" created successfully!`);
}