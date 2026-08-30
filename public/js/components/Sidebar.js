// Sidebar.js - Single unified sidebar, search placed above recents, Theme-aware color tokens
let currentSearchQuery = '';

function renderSidebar(state) {
  const isCollapsed = state.sidebarCollapsed;
  const currentRoute = state.currentRoute;
  const activeConvId = state.activeConversationId;
  const firstName = (state.user && state.user.name ? state.user.name.split(' ')[0] : 'Sadman');
  const sidebarWidth = state.sidebarWidth || 260;

  // Primary Navigation Tabs
  const navItems = [
    { label: 'Agents', route: '/agents', icon: 'users' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Knowledge Base', route: '/knowledge-base', icon: 'database' }
  ];

  // Recents List (Deep Search filtered)
  const recents = currentSearchQuery 
    ? appStore.deepSearch(currentSearchQuery)
    : (state.conversations || []);

  if (isCollapsed) {
    return `
      <aside 
        id="main-sidebar-panel"
        class="w-[60px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-4 px-2 z-30 sidebar-panel select-none relative">
        <div class="flex flex-col items-center gap-4">
          <!-- Collapsed Logo Icon -->
          <div class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg hover:bg-app-hover transition-colors" onclick="appStore.toggleSidebar()" title="Expand Sidebar">
            <img src="/assets/collab-ai-icon.svg" class="h-6 w-6 object-contain logo-img" alt="Collab AI" />
          </div>

          <!-- New Chat Icon Button -->
          <button onclick="appStore.createConversation('New Chat', '')" title="New Chat" class="w-9 h-9 flex items-center justify-center rounded-lg btn-primary shadow-sm transition-colors">
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>

          <!-- Search Icon Button -->
          <button onclick="appStore.toggleSidebar(); setTimeout(() => document.getElementById('sidebar-search-input')?.focus(), 150)" title="Search chats" class="w-9 h-9 flex items-center justify-center rounded-lg text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary transition-colors">
            <i data-lucide="search" class="w-4 h-4"></i>
          </button>

          <!-- Nav Items -->
          <div class="flex flex-col items-center gap-1 w-full pt-2 border-t border-app-borderSubtle">
            ${navItems.map(item => {
              const active = currentRoute.startsWith(item.route);
              return `
                <button onclick="appStore.setRoute('${item.route}')" 
                  title="${item.label}"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-app-hover text-app-textPrimary' : 'text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary'}">
                  <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Bottom Profile -->
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center cursor-pointer hover:bg-app-hover transition-colors" onclick="toggleUserMenu(event)" title="${firstName}">
            <span class="text-xs font-medium text-app-textPrimary">${firstName[0]}</span>
          </div>
        </div>

        <!-- Resizer Handle on Collapsed Sidebar -->
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
        
        <!-- Header: Proportional Logo & Collapse Button -->
        <div class="flex items-center justify-between px-1 cursor-pointer">
          <div onclick="appStore.setRoute('/dashboard')" class="flex items-center">
            <img src="/assets/collab-ai-logo.svg" class="h-6 w-auto object-contain logo-img" alt="Collab AI" />
          </div>
          <button onclick="appStore.toggleSidebar()" class="text-app-textMuted hover:text-app-textPrimary p-1 rounded hover:bg-app-hover transition-colors" title="Collapse sidebar">
            <i data-lucide="panel-left-close" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- + New Chat Button -->
        <div class="pt-1">
          <button 
            onclick="appStore.createConversation('New Chat', '')"
            class="flex items-center justify-center gap-2 w-full btn-primary text-[13px] px-3 py-2 rounded-xl transition-all shadow-sm">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New chat</span>
          </button>
        </div>

        <!-- Navigation Tabs -->
        <nav class="flex flex-col gap-0.5 pt-1">
          ${navItems.map(item => {
            const active = currentRoute.startsWith(item.route);
            return `
              <button onclick="appStore.setRoute('${item.route}')" 
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${active ? 'bg-app-hover text-app-textPrimary font-medium' : 'text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5 ${active ? 'text-app-textPrimary' : 'text-app-textMuted'}"></i>
                <span class="truncate">${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Recents Section with Search Menu Placed Right Above Recents -->
        <div class="flex-1 flex flex-col min-h-0 pt-2 border-t border-app-borderSubtle">
          
          <div class="flex items-center justify-between px-1 pb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider text-app-textMuted">Recents</span>
            <span id="search-count-badge" class="text-[10.5px] text-app-textPrimary ${currentSearchQuery ? '' : 'hidden'}">${recents.length} found</span>
          </div>

          <!-- Search Menu placed near Recents -->
          <div class="relative flex items-center mb-2 px-0.5">
            <i data-lucide="search" class="w-3.5 h-3.5 text-app-textMuted absolute left-2.5 pointer-events-none"></i>
            <input 
              type="text" 
              id="sidebar-search-input"
              value="${currentSearchQuery}"
              oninput="handleSidebarSearch(this.value)"
              placeholder="Search recents & content..." 
              class="w-full bg-app-input border border-app-borderSubtle text-app-textPrimary placeholder-app-textMuted text-[12px] rounded-lg pl-7 pr-6 py-1.5 focus:outline-none focus:border-app-borderActive transition-colors font-normal"
            />
            <button 
              id="search-clear-btn"
              onclick="clearSidebarSearch()" 
              class="absolute right-2 text-app-textMuted hover:text-app-textPrimary text-xs ${currentSearchQuery ? '' : 'hidden'}">
              ✕
            </button>
          </div>

          <!-- Recents List Container -->
          <div class="flex-1 overflow-y-auto flex flex-col gap-0.5 pr-1" id="recents-list-container">
            ${renderRecentsListHtml(recents, currentRoute, activeConvId)}
          </div>
        </div>

      </div>

      <!-- Bottom Profile Pill -->
      <div class="pt-2 border-t border-app-borderSubtle">
        <div id="sidebar-profile-button" class="flex items-center justify-between p-1.5 rounded-lg bg-app-surface hover:bg-app-hover border border-app-borderSubtle cursor-pointer transition-colors" onclick="toggleUserMenu(event)">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-full bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary font-medium text-xs">
              ${firstName[0]}
            </div>
            <span class="text-[12.5px] font-normal text-app-textPrimary truncate">${firstName}</span>
          </div>
          <i data-lucide="chevron-up" class="w-3.5 h-3.5 text-app-textMuted"></i>
        </div>
      </div>

      <!-- Draggable Sidebar Resizer Handle -->
      <div class="resizer-handle" onmousedown="initSidebarResize(event)"></div>
    </aside>
  `;
}

function renderRecentsListHtml(recentsList, currentRoute, activeConvId) {
  if (!recentsList || recentsList.length === 0) {
    return `<div class="px-2 py-4 text-center text-app-textMuted text-[12px] font-normal">No recent chats</div>`;
  }

  return recentsList.map(conv => {
    const isActive = (currentRoute === '/conversations' || currentRoute.startsWith('/conversations')) && conv.id === activeConvId;
    return `
      <div 
        onclick="appStore.setRoute('/conversations', '${conv.id}')"
        title="${escapeHtml(conv.title || 'Untitled Thread')}"
        class="flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors group ${isActive ? 'bg-app-hover text-app-textPrimary font-medium' : 'text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary'}">
        <span class="text-[12.5px] truncate font-normal">${escapeHtml(conv.title || 'Untitled Thread')}</span>
      </div>
    `;
  }).join('');
}

// In-place DOM update so the search input NEVER loses focus while typing!
function handleSidebarSearch(val) {
  currentSearchQuery = val;
  const listContainer = document.getElementById('recents-list-container');
  const countBadge = document.getElementById('search-count-badge');
  const clearBtn = document.getElementById('search-clear-btn');

  const filtered = appStore.deepSearch(val);

  if (listContainer) {
    listContainer.innerHTML = renderRecentsListHtml(filtered, appStore.state.currentRoute, appStore.state.activeConversationId);
  }

  if (countBadge) {
    if (val.trim()) {
      countBadge.classList.remove('hidden');
      countBadge.innerText = `${filtered.length} found`;
    } else {
      countBadge.classList.add('hidden');
    }
  }

  if (clearBtn) {
    if (val) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
  }
}

function clearSidebarSearch() {
  const input = document.getElementById('sidebar-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  handleSidebarSearch('');
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