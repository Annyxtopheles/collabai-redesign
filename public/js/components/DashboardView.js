// DashboardView.js - High Z-Index Layering, In-Place Templates Popover (Zero Lightbox), Direct Anchoring
let dashboardComposerMode = 'chat'; // 'chat' | 'search'

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
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-transparent select-none relative z-10">
      ${renderHeaderBreadcrumb('Overview')}

      <div class="p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-7 animate-fade-in relative z-10">
        
        <!-- Welcome Greeting -->
        <div class="flex flex-col gap-1">
          <h1 class="text-[24px] font-semibold text-app-textPrimary tracking-tight">Welcome back, ${escapeHtml(user.name)}!</h1>
          <p class="text-[14px] text-app-textSecondary font-normal">You have 12 active automations running across ${projects.length} projects.</p>
        </div>

        <!-- Global Chat Shortcut Composer (High z-index z-30) -->
        <div id="dashboard-prompt-card" class="w-full border-glow-card bg-app-surface border border-app-borderSubtle rounded-2xl p-3.5 flex flex-col gap-3 relative z-30">
          <span class="edge-light"></span>

          <!-- Main Input Line -->
          <div class="flex items-center gap-2.5 relative z-10">
            
            <!-- Gemini-style Plus (+) Button with Directly Anchored Dropdown -->
            <div class="relative shrink-0 z-50">
              <button 
                id="dashboard-plus-btn"
                onclick="toggleDashboardPlusMenu(event)" 
                class="w-8 h-8 rounded-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary flex items-center justify-center transition-colors shrink-0" 
                title="Add attachment or tool">
                <i data-lucide="plus" class="w-4 h-4"></i>
              </button>

              <!-- Directly Anchored Plus Dropdown (Opens Downwards with z-50) -->
              <div id="dashboard-plus-dropdown-menu" class="hidden absolute top-full left-0 mt-2 w-64 bg-app-surface border border-app-borderSubtle rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
                <div class="px-2.5 py-1 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Tools & Attachments</div>
                
                <button onclick="triggerDashboardFileUpload(); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="upload" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Upload files (PDF, Code, CSV)</span>
                </button>

                <button onclick="appStore.setRoute('/knowledge-base'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="database" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Attach from Knowledge Base</span>
                </button>

                <button onclick="setDashboardMode('search'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="search" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Enable Deep Search Tool</span>
                </button>

                <button onclick="toggleDashboardTemplates(event); closeDashboardPlusMenu()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="layout-template" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Browse Templates Popover</span>
                </button>

                <button onclick="appStore.setRoute('/agents'); closeDashboardMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="bot" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Mention @Agent</span>
                </button>
              </div>
            </div>

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
              class="flex-1 bg-transparent text-app-textPrimary text-[14px] placeholder-app-textMuted focus:outline-none font-normal"
            />

            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[10.5px] font-mono text-app-textMuted bg-app-input px-2 py-0.5 rounded border border-app-borderSubtle hidden sm:inline-block">⌘K</span>
              
              <!-- Modern Arrow-Up Send Icon Button -->
              <button 
                onclick="handleDashboardSend()"
                class="w-8 h-8 rounded-full btn-primary flex items-center justify-center transition-all hover:scale-105"
                title="Send message">
                <i data-lucide="arrow-up" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <!-- Deep Search Results Live Panel (In-place DOM container) -->
          <div id="dashboard-search-results-panel" class="hidden bg-app-input border border-app-borderSubtle rounded-2xl p-2 flex flex-col gap-1 max-h-48 overflow-y-auto animate-fade-in text-[12.5px]"></div>

          <!-- Sub-toolbar with Model Selector & In-Place Filter Mode Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[12px] relative z-40">
            <div class="flex items-center gap-2 flex-wrap">
              
              <!-- Model Picker Button with Directly Anchored Dropdown -->
              <div class="relative z-50">
                <button 
                  type="button"
                  id="dashboard-model-picker-btn"
                  onclick="toggleDashboardModelPicker(event)"
                  class="flex items-center gap-1.5 bg-app-input hover:bg-app-hover px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary cursor-pointer transition-colors">
                  <span id="dashboard-active-model-name" class="font-normal text-app-textPrimary">${activeModel.name}</span>
                  <span id="dashboard-active-model-provider" class="text-[10px] text-app-textMuted">· ${activeModel.provider}</span>
                  <i data-lucide="chevron-down" class="w-3.5 h-3.5 text-app-textMuted"></i>
                </button>

                <!-- Directly Anchored Model Selector Dropdown with high z-50 -->
                <div id="dashboard-model-dropdown-menu" class="hidden absolute top-full left-0 mt-1.5 w-72 bg-app-surface border border-app-borderSubtle rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
                  <div class="px-2.5 py-1.5 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Select Model Provider</div>
                  ${AVAILABLE_MODELS.map(m => `
                    <div 
                      onclick="selectDashboardModel('${m.id}')"
                      class="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${m.id === activeModelId ? 'bg-app-hover text-app-textPrimary font-medium' : 'text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary'}">
                      <div class="flex flex-col">
                        <span class="text-app-textPrimary">${m.name}</span>
                        <span class="text-[11px] text-app-textMuted">${m.provider}</span>
                      </div>
                      <span class="text-[10.5px] px-1.5 py-0.5 rounded bg-app-input border border-app-borderSubtle text-app-textMuted">${m.badge}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- In-Place Zero-Flicker Mode & Popover Selector -->
              <div class="flex items-center gap-0.5 bg-app-input p-0.5 rounded-md border border-app-borderSubtle">
                <button 
                  id="dashboard-mode-chat-btn"
                  onclick="setDashboardMode('chat')"
                  class="px-2.5 py-0.5 rounded text-[11.5px] transition-all ${dashboardComposerMode === 'chat' ? 'btn-primary font-medium' : 'text-app-textMuted hover:text-app-textPrimary'}">
                  Chat
                </button>
                <button 
                  id="dashboard-mode-search-btn"
                  onclick="setDashboardMode('search')"
                  class="px-2.5 py-0.5 rounded text-[11.5px] transition-all ${dashboardComposerMode === 'search' ? 'btn-primary font-medium' : 'text-app-textMuted hover:text-app-textPrimary'}">
                  Deep Search
                </button>

                <!-- In-Place Sleek Templates Popover Trigger (Zero Lightbox) -->
                <div class="relative z-50">
                  <button 
                    id="dashboard-templates-btn"
                    onclick="toggleDashboardTemplates(event)"
                    class="px-2.5 py-0.5 rounded text-[11.5px] transition-all text-app-textMuted hover:text-app-textPrimary flex items-center gap-1">
                    <span>Templates</span>
                    <i data-lucide="chevron-down" class="w-3 h-3 text-app-textMuted"></i>
                  </button>

                  <!-- Directly Anchored Sleek Templates Popover Menu -->
                  <div id="dashboard-templates-dropdown-menu" class="hidden absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 w-80 max-w-[90vw] bg-app-surface border border-app-borderSubtle rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 animate-fade-in text-[12.5px]">
                    <div class="px-2.5 py-1 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle flex items-center justify-between">
                      <span>Prompt Templates</span>
                      <span class="text-[10px] text-app-textSecondary">Click to insert</span>
                    </div>

                    <div class="flex flex-col gap-1 max-h-72 overflow-y-auto pr-0.5 pt-1">
                      ${DEFAULT_PROMPT_TEMPLATES.map(tmpl => `
                        <div 
                          onclick="applyPromptTemplate('${escapeHtml(tmpl.prompt)}')"
                          class="p-2.5 rounded-xl bg-app-input hover:bg-app-hover border border-transparent hover:border-app-borderSubtle cursor-pointer transition-all flex flex-col gap-1 text-[12px] group">
                          <div class="flex items-center justify-between">
                            <span class="font-medium text-app-textPrimary group-hover:text-app-textPrimary truncate">${tmpl.title}</span>
                            <span class="text-[9.5px] px-1.5 py-0.2 rounded bg-app-surface border border-app-borderSubtle text-app-textMuted shrink-0">${tmpl.category}</span>
                          </div>
                          <p class="text-[11px] text-app-textSecondary line-clamp-2 leading-relaxed font-normal">${tmpl.prompt}</p>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] text-app-textMuted hidden sm:inline-block">Groq Cloud 60fps</span>
            </div>
          </div>

          <!-- Suggested Prompt Tags -->
          <div class="flex items-center gap-2 pt-0.5 flex-wrap">
            <button onclick="setDashboardPrompt('#Resume Review')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-app-textPrimary px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Resume Review</button>
            <button onclick="setDashboardPrompt('#Color Palette Gen')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-app-textPrimary px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Color Palette Gen</button>
            <button onclick="setDashboardPrompt('#Aster Architect')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-app-textPrimary px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#Aster Architect</button>
            <button onclick="setDashboardPrompt('#New Agent')" class="text-[11.5px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-app-textPrimary px-2.5 py-1 rounded-md border border-app-borderSubtle transition-colors font-normal">#New Agent</button>
          </div>
        </div>

        <!-- 4 Stat Cards Row (Lower z-index z-10) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Total Conversations</span>
            <span class="text-[24px] font-semibold text-app-textPrimary tracking-tight">${conversations.length > 5 ? 659 : conversations.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Active Agents</span>
            <span class="text-[24px] font-semibold text-app-textPrimary tracking-tight">${agents.length > 5 ? 11 : agents.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Projects</span>
            <span class="text-[24px] font-semibold text-app-textPrimary tracking-tight">${projects.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-0.5">
            <span class="text-[12.5px] text-app-textSecondary font-normal">Usage This Month</span>
            <span class="text-[24px] font-semibold text-app-textPrimary tracking-tight">659</span>
          </div>
        </div>

        <!-- Two Column Content Area (Lower z-index z-10) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
          
          <!-- Left: Most Accessed Agents List with Solid Opaque Background -->
          <div class="lg:col-span-2 bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col gap-3.5">
            <h2 class="text-[15px] font-semibold text-app-textPrimary">Most Accessed Agents</h2>
            <div class="flex flex-col divide-y divide-app-borderSubtle">
              ${agents.slice(0, 5).map(agent => `
                <div class="flex items-center justify-between py-3 cursor-pointer hover:bg-app-hover px-2 rounded-xl transition-colors" onclick="appStore.createConversation('${escapeHtml(agent.name)}', '', '${agent.id}')">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
                      <i data-lucide="${agent.icon}" class="w-4 h-4"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[13.5px] font-medium text-app-textPrimary">${escapeHtml(agent.name)}</span>
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
            
            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col gap-2.5">
              <h2 class="text-[15px] font-semibold text-app-textPrimary mb-0.5">Quick Actions</h2>
              <button onclick="appStore.createConversation('New Chat', '')" class="w-full btn-primary text-[13px] py-2 rounded-xl transition-all">
                Start New Chat
              </button>
              <button onclick="showCreateAgentModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-app-textPrimary font-medium text-[13px] py-2 rounded-xl transition-colors">
                Create Agent
              </button>
              <button onclick="showCreateProjectModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-app-textPrimary font-medium text-[13px] py-2 rounded-xl transition-colors">
                New Project
              </button>
            </div>

            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col gap-2.5">
              <h2 class="text-[15px] font-semibold text-app-textPrimary mb-0.5">Recent Activity</h2>
              <div class="flex flex-col gap-2.5 text-[12.5px]">
                <div class="flex flex-col">
                  <span class="text-app-textPrimary font-medium">"How do I optimize my resume for..."</span>
                  <span class="text-app-textMuted text-[11px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-app-textPrimary font-medium">"Generate a tech-themed color palette..."</span>
                  <span class="text-app-textMuted text-[11px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-app-textPrimary font-medium">"What are the core architectural..."</span>
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

// In-place zero-flicker mode switching
function setDashboardMode(mode) {
  dashboardComposerMode = mode;
  const chatBtn = document.getElementById('dashboard-mode-chat-btn');
  const searchBtn = document.getElementById('dashboard-mode-search-btn');
  const input = document.getElementById('dashboard-composer-input');
  const resultsPanel = document.getElementById('dashboard-search-results-panel');

  if (chatBtn && searchBtn && input) {
    if (mode === 'chat') {
      chatBtn.className = 'px-2.5 py-0.5 rounded text-[11.5px] transition-all btn-primary font-medium';
      searchBtn.className = 'px-2.5 py-0.5 rounded text-[11.5px] transition-all text-app-textMuted hover:text-app-textPrimary';
      input.placeholder = 'Ask anything, mention @agent, or start a new conversation...';
      if (resultsPanel) resultsPanel.classList.add('hidden');
    } else if (mode === 'search') {
      searchBtn.className = 'px-2.5 py-0.5 rounded text-[11.5px] transition-all btn-primary font-medium';
      chatBtn.className = 'px-2.5 py-0.5 rounded text-[11.5px] transition-all text-app-textMuted hover:text-app-textPrimary';
      input.placeholder = 'Deep search across all workspace docs, past chats & agents...';
      handleDashboardInput(input.value);
    }
    input.focus();
  }
}

// In-place Sleek Templates Popover Toggle (No Lightbox)
function toggleDashboardTemplates(e) {
  if (e) e.stopPropagation();
  const tmplMenu = document.getElementById('dashboard-templates-dropdown-menu');
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');

  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) plusMenu.classList.add('hidden');

  if (tmplMenu) {
    tmplMenu.classList.toggle('hidden');
  }
  lucide.createIcons();
}

function applyPromptTemplate(promptText) {
  closeDashboardMenus();
  setDashboardMode('chat');
  const input = document.getElementById('dashboard-composer-input');
  if (input) {
    input.value = promptText;
    input.focus();
  }
  showToast('Template applied to composer!');
}

// In-place live search rendering with zero page flicker
function handleDashboardInput(val) {
  if (dashboardComposerMode === 'search') {
    const resultsPanel = document.getElementById('dashboard-search-results-panel');
    if (!resultsPanel) return;

    if (!val || !val.trim()) {
      resultsPanel.classList.add('hidden');
      return;
    }

    const filtered = appStore.deepSearch(val);
    if (filtered.length === 0) {
      resultsPanel.classList.remove('hidden');
      resultsPanel.innerHTML = `<div class="px-3 py-2 text-center text-app-textMuted text-[12px]">No matching conversations found</div>`;
      return;
    }

    resultsPanel.classList.remove('hidden');
    resultsPanel.innerHTML = `
      <div class="px-2 py-1 text-[11px] text-app-textMuted uppercase font-medium">Search Results (${filtered.length})</div>
      ${filtered.map(res => `
        <div 
          onclick="appStore.setRoute('/conversations', '${res.id}')"
          class="flex items-center justify-between p-2 rounded-xl bg-app-surface hover:bg-app-hover cursor-pointer text-app-textPrimary transition-colors">
          <div class="flex items-center gap-2">
            <i data-lucide="message-square" class="w-3.5 h-3.5 text-app-textMuted"></i>
            <span class="truncate font-medium">${escapeHtml(res.title)}</span>
          </div>
          <span class="text-[11px] text-app-textMuted">${res.messages ? res.messages.length : 0} msgs</span>
        </div>
      `).join('')}
    `;
    lucide.createIcons();
  }
}

// In-place directly anchored toggle functions for Dashboard menus
function toggleDashboardPlusMenu(e) {
  if (e) e.stopPropagation();
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const tmplMenu = document.getElementById('dashboard-templates-dropdown-menu');

  if (modelMenu) modelMenu.classList.add('hidden');
  if (tmplMenu) tmplMenu.classList.add('hidden');
  if (plusMenu) {
    plusMenu.classList.toggle('hidden');
  }
  lucide.createIcons();
}

function closeDashboardPlusMenu() {
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  if (plusMenu) plusMenu.classList.add('hidden');
}

function toggleDashboardModelPicker(e) {
  if (e) e.stopPropagation();
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  const tmplMenu = document.getElementById('dashboard-templates-dropdown-menu');

  if (plusMenu) plusMenu.classList.add('hidden');
  if (tmplMenu) tmplMenu.classList.add('hidden');
  if (modelMenu) {
    modelMenu.classList.toggle('hidden');
  }
  lucide.createIcons();
}

function closeDashboardMenus() {
  const modelMenu = document.getElementById('dashboard-model-dropdown-menu');
  const plusMenu = document.getElementById('dashboard-plus-dropdown-menu');
  const tmplMenu = document.getElementById('dashboard-templates-dropdown-menu');
  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) plusMenu.classList.add('hidden');
  if (tmplMenu) tmplMenu.classList.add('hidden');
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