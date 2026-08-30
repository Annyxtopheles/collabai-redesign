// DashboardView.js - Zero-Flicker In-Place Model & Plus Menus, Working Deep Search & Templates Modal
let dashboardComposerMode = 'chat'; // 'chat' | 'search'
let deepSearchResults = [];

function renderDashboardView(state) {
  const user = state.user || DEFAULT_USER;
  const agents = state.agents || [];
  const conversations = state.conversations || [];
  const projects = state.projects || [];
  const activeModelId = state.selectedModel || 'openai/gpt-oss-120b';
  const activeModel = AVAILABLE_MODELS.find(m => m.id === activeModelId) || AVAILABLE_MODELS[0];

  const placeholderText = dashboardComposerMode === 'search'
    ? 'Deep search across all workspace docs, past chats & agents...'
    : 'Ask anything, mention @agent, or start a new conversation...';

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Overview')}

      <div class="p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-7 animate-fade-in">
        
        <!-- Welcome Greeting -->
        <div class="flex flex-col gap-1">
          <h1 class="text-[24px] font-semibold text-white tracking-tight">Welcome back, ${escapeHtml(user.name)}!</h1>
          <p class="text-[14px] text-app-textSecondary font-normal">You have 12 active automations running across ${projects.length} projects.</p>
        </div>

        <!-- Global Chat Shortcut Composer -->
        <div class="w-full bg-app-surface border border-app-borderSubtle rounded-2xl p-3.5 flex flex-col gap-3 shadow-xl relative">
          
          <!-- Zero-Flicker In-Place Dropdown Model Picker for Dashboard -->
          <div id="dashboard-model-dropdown-menu" class="hidden absolute bottom-[65px] left-3.5 w-72 bg-app-surface border border-app-borderSubtle rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
            <div class="px-2.5 py-1.5 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Select Model Provider</div>
            ${AVAILABLE_MODELS.map(m => `
              <div 
                onclick="selectDashboardModel('${m.id}')"
                class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${m.id === activeModelId ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                <div class="flex flex-col">
                  <span class="font-normal text-white">${m.name}</span>
                  <span class="text-[11px] text-app-textMuted">${m.provider}</span>
                </div>
                <span class="text-[10.5px] px-1.5 py-0.5 rounded bg-app-input border border-app-borderSubtle text-app-textMuted">${m.badge}</span>
              </div>
            `).join('')}
          </div>

          <!-- Zero-Flicker In-Place Gemini-style Plus (+) Attachment & Tools Menu -->
          <div id="dashboard-plus-dropdown-menu" class="hidden absolute bottom-[105px] left-3.5 w-64 bg-app-surface border border-app-borderSubtle rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
            <div class="px-2.5 py-1 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Tools & Attachments</div>
            
            <button onclick="triggerDashboardFileUpload(); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
              <i data-lucide="upload" class="w-3.5 h-3.5 text-white"></i>
              <span>Upload files (PDF, Code, CSV)</span>
            </button>

            <button onclick="appStore.setRoute('/knowledge-base'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
              <i data-lucide="database" class="w-3.5 h-3.5 text-white"></i>
              <span>Attach from Knowledge Base</span>
            </button>

            <button onclick="setDashboardMode('search'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
              <i data-lucide="search" class="w-3.5 h-3.5 text-white"></i>
              <span>Enable Deep Search Tool</span>
            </button>

            <button onclick="openTemplatesModal(); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
              <i data-lucide="layout-template" class="w-3.5 h-3.5 text-white"></i>
              <span>Prompt Templates Library</span>
            </button>

            <button onclick="appStore.setRoute('/agents'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
              <i data-lucide="bot" class="w-3.5 h-3.5 text-white"></i>
              <span>Mention @Agent</span>
            </button>
          </div>

          <!-- Main Input Line -->
          <div class="flex items-center gap-2.5">
            
            <!-- Gemini-style Plus (+) Button -->
            <button 
              id="dashboard-plus-btn"
              onclick="toggleDashboardPlusMenu(event)" 
              class="w-8 h-8 rounded-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-app-textSecondary hover:text-white flex items-center justify-center transition-colors shrink-0" 
              title="Add attachment or tool">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>

            <input 
              type="file" 
              id="dashboard-file-upload-input" 
              class="hidden" 
              onchange="handleDashboardFileSelected(this)" 
            />

            <input 
              type="text" 
              id="dashboard-composer-input"
              oninput="handleDashboardInput(this.value)"
              onkeydown="if(event.key==='Enter') handleDashboardSend()"
              placeholder="${placeholderText}" 
              class="flex-1 bg-transparent text-white text-[14px] placeholder-app-textMuted focus:outline-none font-normal"
            />

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[10.5px] font-mono text-app-textMuted bg-app-input px-2 py-0.5 rounded border border-app-borderSubtle hidden sm:inline-block">⌘K</span>
              
              <!-- Modern Arrow-Up Send Icon Button -->
              <button 
                onclick="handleDashboardSend()"
                class="w-8 h-8 rounded-full btn-primary flex items-center justify-center transition-all shadow-sm hover:scale-105"
                title="Send message">
                <i data-lucide="arrow-up" class="w-4 h-4 text-app-surface"></i>
              </button>
            </div>
          </div>

          <!-- Deep Search Results Live Panel -->
          ${dashboardComposerMode === 'search' && deepSearchResults.length > 0 ? `
            <div class="bg-app-input border border-app-borderSubtle rounded-xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto animate-fade-in text-[12.5px]">
              <div class="px-2 py-1 text-[11px] text-app-textMuted uppercase font-medium">Search Results (${deepSearchResults.length})</div>
              ${deepSearchResults.map(res => `
                <div 
                  onclick="appStore.setRoute('/conversations', '${res.id}')"
                  class="flex items-center justify-between p-2 rounded-lg bg-app-surface hover:bg-app-hover cursor-pointer text-white transition-colors">
                  <div class="flex items-center gap-2">
                    <i data-lucide="message-square" class="w-3.5 h-3.5 text-app-textMuted"></i>
                    <span class="truncate font-medium">${escapeHtml(res.title)}</span>
                  </div>
                  <span class="text-[11px] text-app-textMuted">${res.messages ? res.messages.length : 0} messages</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Sub-toolbar with Model Selector & Filter Mode Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[12px]">
            <div class="flex items-center gap-2 flex-wrap">
              <button 
                type="button"
                id="dashboard-model-picker-btn"
                onclick="toggleDashboardModelPicker(event)"
                class="flex items-center gap-1.5 bg-app-input hover:bg-app-hover px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary hover:text-white cursor-pointer transition-colors">
                <span id="dashboard-active-model-name" class="font-normal text-white">${activeModel.name}</span>
                <span id="dashboard-active-model-provider" class="text-[10px] text-app-textMuted">· ${activeModel.provider}</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-app-textMuted"></i>
              </button>

              <!-- Functional Mode Selector (Chat / Deep Search / Templates Modal Trigger) -->
              <div class="flex items-center gap-0.5 bg-app-input p-0.5 rounded-md border border-app-borderSubtle">
                <button 
                  onclick="setDashboardMode('chat')"
                  class="px-2.5 py-0.5 rounded text-[11.5px] transition-colors ${dashboardComposerMode === 'chat' ? 'btn-primary font-medium' : 'text-app-textMuted hover:text-white'}">
                  Chat
                </button>
                <button 
                  onclick="setDashboardMode('search')"
                  class="px-2.5 py-0.5 rounded text-[11.5px] transition-colors ${dashboardComposerMode === 'search' ? 'btn-primary font-medium' : 'text-app-textMuted hover:text-white'}">
                  Deep Search
                </button>
                <button 
                  onclick="openTemplatesModal()"
                  class="px-2.5 py-0.5 rounded text-[11.5px] transition-colors text-app-textMuted hover:text-white">
                  Templates
                </button>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-app-textMuted hidden sm:inline-block">Groq Cloud 60fps</span>
            </div>
          </div>

          <!-- Suggested Prompt Tags -->
          <div class="flex items-center gap-2 pt-0.5 flex-wrap">
            <button onclick="setDashboardPrompt('#Resume Review')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Resume Review</button>
            <button onclick="setDashboardPrompt('#Color Palette Gen')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Color Palette Gen</button>
            <button onclick="setDashboardPrompt('#Aster Architect')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Aster Architect</button>
            <button onclick="setDashboardPrompt('#New Agent')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#New Agent</button>
          </div>
        </div>

        <!-- 4 Stat Cards Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Total Conversations</span>
            <span class="text-[24px] font-semibold text-white tracking-tight">${conversations.length > 5 ? 659 : conversations.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Active Agents</span>
            <span class="text-[24px] font-semibold text-white tracking-tight">${agents.length > 5 ? 11 : agents.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Projects</span>
            <span class="text-[24px] font-semibold text-white tracking-tight">${projects.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Usage This Month</span>
            <span class="text-[24px] font-semibold text-white tracking-tight">659</span>
          </div>
        </div>

        <!-- Two Column Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <!-- Left: Most Accessed Agents List with White Monochrome Icons -->
          <div class="lg:col-span-2 bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-3.5">
            <h2 class="text-[15px] font-semibold text-white">Most Accessed Agents</h2>
            <div class="flex flex-col divide-y divide-app-borderSubtle">
              ${agents.slice(0, 5).map(agent => `
                <div class="flex items-center justify-between py-3 cursor-pointer hover:bg-app-hover/50 px-2 rounded-lg transition-colors" onclick="appStore.createConversation('${escapeHtml(agent.name)}', '', '${agent.id}')">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
                      <i data-lucide="${agent.icon}" class="w-4 h-4 text-white"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[13.5px] font-medium text-white">${escapeHtml(agent.name)}</span>
                      <span class="text-[11.5px] text-app-textMuted">${agent.chatCount || 42} chats</span>
                    </div>
                  </div>
                  <span class="text-[11.5px] text-app-textMuted font-mono">${agent.lastAccessed || '1h ago'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Quick Actions & Recent Activity -->
          <div class="flex flex-col gap-4">
            
            <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-2.5">
              <h2 class="text-[15px] font-semibold text-white mb-0.5">Quick Actions</h2>
              <button onclick="appStore.createConversation('New Chat', '')" class="w-full btn-primary text-[13px] py-2 rounded-lg transition-all shadow-sm">
                Start New Chat
              </button>
              <button onclick="showCreateAgentModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-white font-medium text-[13px] py-2 rounded-lg transition-colors">
                Create Agent
              </button>
              <button onclick="showCreateProjectModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-white font-medium text-[13px] py-2 rounded-lg transition-colors">
                New Project
              </button>
            </div>

            <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-2.5">
              <h2 class="text-[15px] font-semibold text-white mb-0.5">Recent Activity</h2>
              <div class="flex flex-col gap-2.5 text-[12.5px]">
                <div class="flex flex-col">
                  <span class="text-white font-medium">"How do I optimize my resume for..."</span>
                  <span class="text-app-textMuted text-[11px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-white font-medium">"Generate a tech-themed color palette..."</span>
                  <span class="text-app-textMuted text-[11px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-white font-medium">"What are the core architectural..."</span>
                  <span class="text-app-textMuted text-[11px]">In Conversations • 2h ago</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}

function setDashboardMode(mode) {
  dashboardComposerMode = mode;
  renderApp();
  setTimeout(() => {
    const input = document.getElementById('dashboard-composer-input');
    if (input) input.focus();
  }, 100);
}

function openTemplatesModal() {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onclick="closeModal()">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fade-in" onclick="event.stopPropagation()">
        
        <div class="flex items-center justify-between border-b border-app-borderSubtle pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
              <i data-lucide="layout-template" class="w-4 h-4 text-white"></i>
            </div>
            <div class="flex flex-col">
              <h2 class="text-[15.5px] font-semibold text-white">Prompt Templates Library</h2>
              <span class="text-[12px] text-app-textSecondary">Click any template to populate the chat composer</span>
            </div>
          </div>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white p-1 rounded-lg hover:bg-app-hover">✕</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          ${DEFAULT_PROMPT_TEMPLATES.map(tmpl => `
            <div 
              onclick="applyPromptTemplate('${escapeHtml(tmpl.prompt)}')"
              class="p-4 bg-app-input hover:bg-app-hover border border-app-borderSubtle hover:border-app-borderMed rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-2.5 text-[12.5px] group">
              <div class="flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-white group-hover:text-white">${tmpl.title}</span>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-app-surface border border-app-borderSubtle text-app-textMuted">${tmpl.category}</span>
                </div>
                <p class="text-[12px] text-app-textSecondary line-clamp-2 leading-relaxed">${tmpl.prompt}</p>
              </div>
              <span class="text-[11.5px] text-white group-hover:underline">Use Template →</span>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
  lucide.createIcons();
}

function applyPromptTemplate(promptText) {
  closeModal();
  dashboardComposerMode = 'chat';
  const input = document.getElementById('dashboard-composer-input');
  if (input) {
    input.value = promptText;
    input.focus();
  }
  showToast('Template applied to composer!');
}

function handleDashboardInput(val) {
  if (dashboardComposerMode === 'search') {
    deepSearchResults = appStore.deepSearch(val);
    renderApp();
    setTimeout(() => {
      const input = document.getElementById('dashboard-composer-input');
      if (input) {
        input.value = val;
        input.focus();
      }
    }, 50);
  }
}

// In-place dropdown toggles without full-page re-rendering
function toggleDashboardPlusMenu(e) {
  if (e) e.stopPropagation();
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) plusMenu.classList.toggle('hidden');
  lucide.createIcons();
}

function toggleDashboardModelPicker(e) {
  if (e) e.stopPropagation();
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  if (plusMenu) plusMenu.classList.add('hidden');
  if (modelMenu) modelMenu.classList.toggle('hidden');
  lucide.createIcons();
}

function closeDashboardMenus() {
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) plusMenu.classList.add('hidden');
}

// In-place model selection with zero flicker
function selectDashboardModel(modelId) {
  closeDashboardMenus();
  appStore.state.selectedModel = modelId;
  localStorage.setItem('collab_ai_state', JSON.stringify(appStore.state));

  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (model) {
    const nameEl = document.getElementById('dashboard-active-model-name');
    const provEl = document.getElementById('dashboard-active-model-provider');
    if (nameEl) nameEl.innerText = model.name;
    if (provEl) provEl.innerText = '· ' + model.provider;
  }
  showToast(`Switched model to ${modelId}`);
}

function triggerDashboardFileUpload() {
  const input = document.getElementById('dashboard-file-upload-input');
  if (input) input.click();
}

function handleDashboardFileSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast(`Attached "${file.name}" to context.`);
    const composer = document.getElementById('dashboard-composer-input');
    if (composer) {
      composer.value = `[Attached: ${file.name}] ` + composer.value;
      composer.focus();
    }
  }
}

function setDashboardPrompt(tag) {
  const input = document.getElementById('dashboard-composer-input');
  if (input) {
    input.value = tag + ' ';
    input.focus();
  }
}

function handleDashboardSend() {
  const input = document.getElementById('dashboard-composer-input');
  if (!input || !input.value.trim()) return;
  const prompt = input.value.trim();
  const convId = appStore.createConversation(prompt, prompt);
  setTimeout(() => triggerConversationStreaming(convId, prompt), 100);
}