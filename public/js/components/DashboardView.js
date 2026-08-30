// DashboardView.js - Matches Screenshot 9 with #171717 cards and clean layout
function renderDashboardView(state) {
  const user = state.user || DEFAULT_USER;
  const agents = state.agents || [];
  const conversations = state.conversations || [];
  const projects = state.projects || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('Overview')}

      <div class="p-10 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
        
        <!-- Welcome Greeting -->
        <div class="flex flex-col gap-1.5">
          <h1 class="text-[31px] font-bold text-white tracking-tight">Welcome back, ${user.name}!</h1>
          <p class="text-[15px] text-app-textSecondary">You have 12 active automations running across ${projects.length} projects.</p>
        </div>

        <!-- Global Chat Shortcut Composer -->
        <div class="w-full bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
          <div class="flex items-center gap-3">
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
              class="flex-1 bg-transparent text-white text-[14.5px] placeholder-app-textMuted focus:outline-none"
            />
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-mono text-app-textMuted bg-app-input px-2 py-1 rounded border border-app-borderSubtle">⌘K</span>
              <button 
                onclick="handleDashboardSend()"
                class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] px-5 py-2 rounded-lg transition-colors shadow-sm">
                Send
              </button>
            </div>
          </div>

          <!-- Sub-toolbar with Model Selector & Filter Pills -->
          <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[12px]">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1.5 bg-app-input px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary cursor-pointer">
                <span>claude-sonnet-4-5 · Anthropic</span>
                <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
              </div>
              <div class="flex items-center gap-1 bg-app-input p-0.5 rounded-md border border-app-borderSubtle">
                <button class="bg-app-accent text-white px-2 py-0.5 rounded text-[11px] font-semibold">Chat</button>
                <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px]">Deep Search</button>
                <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px]">Templates</button>
              </div>
            </div>

            <button class="text-app-textMuted hover:text-white p-1">
              <i data-lucide="mic" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Suggested Prompt Tags -->
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <button onclick="setDashboardPrompt('#Resume Review')" class="text-[12px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-3 py-1 rounded-md border border-app-borderSubtle transition-colors">#Resume Review</button>
            <button onclick="setDashboardPrompt('#Color Palette Gen')" class="text-[12px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-3 py-1 rounded-md border border-app-borderSubtle transition-colors">#Color Palette Gen</button>
            <button onclick="setDashboardPrompt('#Aster Architect')" class="text-[12px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-3 py-1 rounded-md border border-app-borderSubtle transition-colors">#Aster Architect</button>
            <button onclick="setDashboardPrompt('#New Agent')" class="text-[12px] bg-app-input hover:bg-app-hover text-app-textSecondary hover:text-white px-3 py-1 rounded-md border border-app-borderSubtle transition-colors">#New Agent</button>
          </div>
        </div>

        <!-- 4 Stat Cards Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-1">
            <span class="text-[13px] text-app-textSecondary font-medium">Total Conversations</span>
            <span class="text-[28px] font-bold text-white tracking-tight">${conversations.length > 5 ? 659 : conversations.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-1">
            <span class="text-[13px] text-app-textSecondary font-medium">Active Agents</span>
            <span class="text-[28px] font-bold text-white tracking-tight">${agents.length > 5 ? 11 : agents.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-1">
            <span class="text-[13px] text-app-textSecondary font-medium">Projects</span>
            <span class="text-[28px] font-bold text-white tracking-tight">${projects.length}</span>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-1">
            <span class="text-[13px] text-app-textSecondary font-medium">Usage This Month</span>
            <span class="text-[28px] font-bold text-white tracking-tight">659</span>
          </div>
        </div>

        <!-- Two Column Content Area -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left: Most Accessed Agents List (2 cols) -->
          <div class="lg:col-span-2 bg-app-surface border border-app-borderSubtle rounded-2xl p-6 flex flex-col gap-4">
            <h2 class="text-[17px] font-bold text-white">Most Accessed Agents</h2>
            <div class="flex flex-col divide-y divide-app-borderSubtle">
              ${agents.slice(0, 5).map(agent => `
                <div class="flex items-center justify-between py-3.5 cursor-pointer hover:bg-app-hover/50 px-2 rounded-lg transition-colors" onclick="appStore.createConversation('${agent.name}', '', '${agent.id}')">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white" style="background-color: ${agent.color}20; border: 1px solid ${agent.color}40">
                      <i data-lucide="${agent.icon}" class="w-5 h-5" style="color: ${agent.color}"></i>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[14.5px] font-semibold text-white">${agent.name}</span>
                      <span class="text-[12.5px] text-app-textMuted">${agent.chatCount || 42} chats</span>
                    </div>
                  </div>
                  <span class="text-[12px] text-app-textMuted font-mono">${agent.lastAccessed || '1h ago'}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Right: Quick Actions & Recent Activity (1 col) -->
          <div class="flex flex-col gap-6">
            
            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 flex flex-col gap-3">
              <h2 class="text-[17px] font-bold text-white mb-1">Quick Actions</h2>
              <button onclick="appStore.createConversation('New Chat', '')" class="w-full bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors">
                Start New Chat
              </button>
              <button onclick="showCreateAgentModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-white font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors">
                Create Agent
              </button>
              <button onclick="showCreateProjectModal()" class="w-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-white font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors">
                New Project
              </button>
            </div>

            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 flex flex-col gap-3">
              <h2 class="text-[17px] font-bold text-white mb-1">Recent Activity</h2>
              <div class="flex flex-col gap-3 text-[13px]">
                <div class="flex flex-col">
                  <span class="text-white font-medium">"How do I optimize my resume for..."</span>
                  <span class="text-app-textMuted text-[11.5px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-white font-medium">"Generate a tech-themed color palette..."</span>
                  <span class="text-app-textMuted text-[11.5px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-white font-medium">"What are the core architectural..."</span>
                  <span class="text-app-textMuted text-[11.5px]">In Conversations • 2h ago</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-white font-medium">"Review the prompt logic for banana..."</span>
                  <span class="text-app-textMuted text-[11.5px]">In Conversations • 2h ago</span>
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