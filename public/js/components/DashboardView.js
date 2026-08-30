// DashboardView.js - Ivory off-white typography, btn-primary buttons, clean shortcuts
function renderDashboardView(state) {
  const user = state.user || DEFAULT_USER;
  const agents = state.agents || [];
  const conversations = state.conversations || [];
  const projects = state.projects || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Overview')}

      <div class="p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-7">
        
        <!-- Welcome Greeting -->
        <div class="flex flex-col gap-1">
          <h1 class="text-[24px] font-semibold text-white tracking-tight">Welcome back, ${user.name}!</h1>
          <p class="text-[14px] text-app-textSecondary font-normal">You have 12 active automations running across ${projects.length} projects.</p>
        </div>

        <!-- Global Chat Shortcut Composer -->
        <div class="w-full bg-app-surface border border-app-borderSubtle rounded-xl p-3.5 flex flex-col gap-3 shadow-lg">
          <div class="flex items-center gap-2.5">
            <button class="p-1.5 text-app-textMuted hover:text-white rounded-lg hover:bg-app-hover transition-colors">
              <i data-lucide="paperclip" class="w-4 h-4"></i>
            </button>
            <button class="p-1.5 text-app-textMuted hover:text-white rounded-lg hover:bg-app-hover transition-colors">
              <i data-lucide="wrench" class="w-4 h-4"></i>
            </button>
            <input 
              type="text" 
              id="dashboard-composer-input"
              onkeydown="if(event.key==='Enter') handleDashboardSend()"
              placeholder="Ask anything, mention @agent, or start a new conversation..." 
              class="flex-1 bg-transparent text-white text-[14px] placeholder-app-textMuted focus:outline-none font-normal"
            />
            <div class="flex items-center gap-2">
              <span class="text-[10.5px] font-mono text-app-textMuted bg-app-input px-2 py-0.5 rounded border border-app-borderSubtle">⌘K</span>
              <button 
                onclick="handleDashboardSend()"
                class="btn-primary text-[13px] px-4 py-1.5 rounded-lg transition-all shadow-sm">
                Send
              </button>
            </div>
          </div>

          <!-- Sub-toolbar with Model Selector & Filter Pills -->
          <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[12px]">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 bg-app-input px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary cursor-pointer">
                <span>GPT-OSS 120B · Groq</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
              </div>
              <div class="flex items-center gap-0.5 bg-app-input p-0.5 rounded-md border border-app-borderSubtle">
                <button class="btn-primary px-2.5 py-0.5 rounded text-[11px] font-medium">Chat</button>
                <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px] font-normal">Deep Search</button>
                <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px] font-normal">Templates</button>
              </div>
            </div>

            <button class="text-app-textMuted hover:text-white p-1">
              <i data-lucide="mic" class="w-3.5 h-3.5"></i>
            </button>
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