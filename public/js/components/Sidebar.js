// Sidebar.js - Single unified sidebar, proportional logo, draggable resizer from both expanded & collapsed states
let currentSearchQuery = '';

function renderSidebar(state) {
  const isCollapsed = state.sidebarCollapsed;
  const currentRoute = state.currentRoute;
  const activeConvId = state.activeConversationId;
  const firstName = (state.user && state.user.name ? state.user.name.split(' ')[0] : 'Sadman');
  const sidebarWidth = state.sidebarWidth || 260;

  // Primary Navigation Tabs
  const navItems = [
    { label: 'Explore Agents', route: '/explore', icon: 'compass' },
    { label: 'Agents', route: '/agents', icon: 'users' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Knowledge Base', route: '/knowledge-base', icon: 'database' }
  ];

  // Recents List (Deep Search filtered if query active)
  const recents = currentSearchQuery 
    ? appStore.deepSearch(currentSearchQuery)
    : (state.conversations || []);

  if (isCollapsed) {
    return `
      <aside 
        id="main-sidebar-panel"
        class="w-[60px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-4 px-2 z-30 sidebar-panel select-none relative">
        <div class="flex flex-col items-center gap-4">
          <!-- Collapsed Logo Icon (w-6 h-6) -->
          <div class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg hover:bg-app-hover transition-colors" onclick="appStore.toggleSidebar()" title="Expand Sidebar">
            <img src="/logo-icon.png" class="h-6 w-6 object-contain" alt="Collab AI" />
          </div>

          <!-- New Chat Icon Button -->
          <button onclick="appStore.createConversation('New Chat', '')" title="New Chat" class="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] transition-colors">
            <i data-lucide="plus" class="w-4 h-4 text-white"></i>
          </button>

          <!-- Search Icon Button -->
          <button onclick="appStore.toggleSidebar(); setTimeout(() => document.getElementById('sidebar-search-input')?.focus(), 150)" title="Search chats" class="w-9 h-9 flex items-center justify-center rounded-lg text-app-textSecondary hover:bg-app-hover hover:text-white transition-colors">
            <i data-lucide="search" class="w-4 h-4"></i>
          </button>

          <!-- Nav Items -->
          <div class="flex flex-col items-center gap-1 w-full pt-2 border-t border-app-borderSubtle">
            ${navItems.map(item => {
              const active = currentRoute.startsWith(item.route);
              return `
                <button onclick="appStore.setRoute('${item.route}')" 
                  title="${item.label}"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                  <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Bottom Profile -->
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.14] transition-colors" onclick="toggleUserMenu(event)" title="${firstName}">
            <span class="text-xs font-normal text-white">${firstName[0]}</span>
          </div>
        </div>

        <!-- Resizer Handle on Collapsed Sidebar (Drag to open/expand) -->
        <div class="resizer-handle" onmousedown="initSidebarResize(event)"></div>
      </aside>
    `;
  }

  return `
    <aside 
      id="main-sidebar-panel"
      style="width: ${sidebarWidth}px" 
      class="bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-4 px-3 z-30 select-none relative sidebar-panel">
      
      <div class="flex flex-col gap-3 min-h-0 flex-1">
        
        <!-- Header: Bigger Logo (Matching standalone icon proportion) & Collapse Button -->
        <div class="flex items-center justify-between px-1 cursor-pointer">
          <div onclick="appStore.setRoute('/dashboard')" class="flex items-center">
            <img src="/logo.png" class="h-7 object-contain" alt="Collab AI" />
          </div>
          <button onclick="appStore.toggleSidebar()" class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover transition-colors" title="Collapse sidebar">
            <i data-lucide="panel-left-close" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- + New Chat Button -->
        <div class="flex flex-col gap-1.5 pt-1">
          <button 
            onclick="appStore.createConversation('New Chat', '')"
            class="flex items-center gap-2.5 w-full bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white font-normal text-[13px] px-3 py-2 rounded-xl transition-colors shadow-sm">
            <i data-lucide="plus" class="w-4 h-4 text-white"></i>
            <span>New chat</span>
          </button>

          <!-- Search Chats & Content -->
          <div class="relative flex items-center">
            <i data-lucide="search" class="w-3.5 h-3.5 text-app-textMuted absolute left-3 pointer-events-none"></i>
            <input 
              type="text" 
              id="sidebar-search-input"
              value="${currentSearchQuery}"
              oninput="handleSidebarSearch(this.value)"
              placeholder="Search chats & content..." 
              class="w-full bg-app-input border border-app-borderSubtle text-white placeholder-app-textMuted text-[12.5px] rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-app-borderActive transition-colors font-normal"
            />
            ${currentSearchQuery ? `
              <button onclick="handleSidebarSearch('')" class="absolute right-2.5 text-app-textMuted hover:text-white text-xs">✕</button>
            ` : ''}
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex flex-col gap-0.5 pt-1">
          ${navItems.map(item => {
            const active = currentRoute.startsWith(item.route);
            return `
              <button onclick="appStore.setRoute('${item.route}')" 
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${active ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5 ${active ? 'text-white' : 'text-app-textMuted'}"></i>
                <span class="truncate">${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Recents List Section -->
        <div class="flex-1 flex flex-col min-h-0 pt-2 border-t border-app-borderSubtle">
          <div class="flex items-center justify-between px-2 pb-1.5">
            <span class="text-[11px] font-normal uppercase tracking-wider text-app-textMuted">Recents</span>
            ${currentSearchQuery ? `<span class="text-[10.5px] text-white">${recents.length} found</span>` : ''}
          </div>

          <div class="flex-1 overflow-y-auto flex flex-col gap-0.5 pr-1" id="recents-list-container">
            ${recents.length === 0 ? `
              <div class="px-2 py-4 text-center text-app-textMuted text-[12px] font-normal">
                ${currentSearchQuery ? 'No matching conversations found' : 'No recent chats'}
              </div>
            ` : recents.map(conv => {
              const isActive = (currentRoute === '/conversations' || currentRoute.startsWith('/conversations')) && conv.id === activeConvId;
              return `
                <div 
                  onclick="appStore.setRoute('/conversations', '${conv.id}')"
                  title="${conv.title || 'Untitled Thread'}"
                  class="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors group ${isActive ? 'bg-white/[0.08] text-white font-normal' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                  <span class="text-[12.5px] truncate font-normal">${conv.title || 'Untitled Thread'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Bottom Profile Pill (No redundant Settings button hovering above) -->
      <div class="pt-2 border-t border-app-borderSubtle">
        <div id="sidebar-profile-button" class="flex items-center justify-between p-1.5 rounded-lg bg-app-surface hover:bg-app-hover border border-app-borderSubtle cursor-pointer transition-colors" onclick="toggleUserMenu(event)">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white font-normal text-xs">
              ${firstName[0]}
            </div>
            <span class="text-[12.5px] font-normal text-white truncate">${firstName}</span>
          </div>
          <i data-lucide="chevron-up" class="w-3.5 h-3.5 text-app-textMuted"></i>
        </div>
      </div>

      <!-- Draggable Sidebar Resizer Handle -->
      <div class="resizer-handle" onmousedown="initSidebarResize(event)"></div>
    </aside>
  `;
}

function handleSidebarSearch(val) {
  currentSearchQuery = val;
  const input = document.getElementById('sidebar-search-input');
  if (input && input.value !== val) input.value = val;
  renderApp();
}

function initSidebarResize(e) {
  e.preventDefault();
  const sidebar = document.getElementById('main-sidebar-panel');
  if (!sidebar) return;

  sidebar.classList.remove('sidebar-panel');
  const startX = e.clientX;
  const isCurrentlyCollapsed = appStore.state.sidebarCollapsed;
  const startWidth = isCurrentlyCollapsed ? 60 : sidebar.getBoundingClientRect().width;

  function onMouseMove(moveEvent) {
    const delta = moveEvent.clientX - startX;
    const newWidth = startWidth + delta;

    if (newWidth < 130) {
      sidebar.style.width = '60px';
    } else {
      if (appStore.state.sidebarCollapsed) {
        appStore.state.sidebarCollapsed = false;
      }
      sidebar.style.width = Math.min(Math.max(newWidth, 180), 400) + 'px';
    }
  }

  function onMouseUp() {
    sidebar.classList.add('sidebar-panel');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    const finalWidth = sidebar.getBoundingClientRect().width;
    appStore.setSidebarWidth(finalWidth);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}