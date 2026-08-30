// Secondary Conversations Sidebar Panel with #141414 neutral dark style
function renderConversationDrawer(state) {
  const conversations = state.conversations || [];
  const activeId = state.activeConversationId;

  return `
    <aside class="w-[280px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col h-full z-20 select-none">
      <div class="flex items-center justify-between px-4 py-4 border-b border-app-borderSubtle">
        <h2 class="text-[16px] font-bold text-white tracking-tight">Conversations</h2>
        <button onclick="appStore.createConversation('New Chat', '')" title="Create New Chat" class="p-1 text-app-textSecondary hover:text-white rounded hover:bg-app-hover transition-colors">
          <i data-lucide="plus" class="w-5 h-5"></i>
        </button>
      </div>

      <div class="p-3">
        <div class="relative flex items-center">
          <i data-lucide="search" class="w-3.5 h-3.5 text-app-textMuted absolute left-3 pointer-events-none"></i>
          <input 
            type="text" 
            placeholder="Search chats..." 
            id="chat-search-input"
            oninput="filterConversationList(this.value)"
            class="w-full bg-app-input border border-app-borderSubtle text-app-textPrimary placeholder-app-textMuted text-[13px] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-app-borderActive transition-colors"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1" id="conversations-list-container">
        ${conversations.map(conv => {
          const isActive = conv.id === activeId;
          const relativeTime = formatRelativeTime(conv.timestamp);
          return `
            <div 
              onclick="appStore.setRoute('/conversations', '${conv.id}')"
              class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${isActive ? 'bg-app-surface border-l-2 border-app-accent text-white font-medium shadow-sm' : 'text-app-textSecondary hover:bg-app-hover/60 hover:text-white'}">
              <span class="text-[13.5px] truncate max-w-[190px]">${conv.title || 'Untitled Thread'}</span>
              <span class="text-[11.5px] text-app-textMuted group-hover:text-app-textSecondary font-mono ml-2 shrink-0">${relativeTime}</span>
            </div>
          `;
        }).join('')}
      </div>
    </aside>
  `;
}

function filterConversationList(query) {
  const container = document.getElementById('conversations-list-container');
  if (!container) return;
  const lower = (query || '').toLowerCase();
  const filtered = appStore.state.conversations.filter(c => (c.title || '').toLowerCase().includes(lower));
  
  container.innerHTML = filtered.map(conv => {
    const isActive = conv.id === appStore.state.activeConversationId;
    return `
      <div 
        onclick="appStore.setRoute('/conversations', '${conv.id}')"
        class="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${isActive ? 'bg-app-surface border-l-2 border-app-accent text-white font-medium' : 'text-app-textSecondary hover:bg-app-hover/60 hover:text-white'}">
        <span class="text-[13.5px] truncate max-w-[190px]">${conv.title || 'Untitled Thread'}</span>
        <span class="text-[11.5px] text-app-textMuted group-hover:text-app-textSecondary font-mono ml-2 shrink-0">${formatRelativeTime(conv.timestamp)}</span>
      </div>
    `;
  }).join('');
}