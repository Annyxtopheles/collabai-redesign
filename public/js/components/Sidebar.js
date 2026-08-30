// Sidebar.js - Regular weight typography, cube logo on collapse, single header toggle, draggable resizer
function renderSidebar(state) {
  const isCollapsed = state.sidebarCollapsed;
  const currentRoute = state.currentRoute;
  const firstName = (state.user && state.user.name ? state.user.name.split(' ')[0] : 'Sadman');
  const sidebarWidth = state.sidebarWidth || 230;

  const navItems = [
    { label: 'New Chat', route: '/conversations/new', icon: 'plus', isSpecial: true },
    { label: 'Explore Agents', route: '/explore', icon: 'compass' },
    { label: 'Conversations', route: '/conversations', icon: 'message-square' },
    { label: 'Agents', route: '/agents', icon: 'users' },
    { label: 'Projects', route: '/projects', icon: 'folder' },
    { label: 'Knowledge Base', route: '/knowledge-base', icon: 'database' }
  ];

  const bottomItems = [
    { label: 'Report Bugs', route: '/bug-reports', icon: 'alert-circle' },
    { label: 'Academy', route: '/academy', icon: 'book-open' },
    { label: 'Documentations', route: '/docs', icon: 'file-text' }
  ];

  const mostAccessed = [
    { name: 'Resume Review Agent' },
    { name: 'Color Palette Generator' },
    { name: 'Aster Architect' },
    { name: 'Reasoning Advisor' }
  ];

  if (isCollapsed) {
    return `
      <aside class="w-[64px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-4 px-2.5 z-30 panel-transition select-none">
        <div class="flex flex-col items-center gap-5">
          <!-- Collapsed Logo: Cube Icon Monogram -->
          <div class="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg hover:bg-app-hover transition-colors" onclick="appStore.toggleSidebar()" title="Expand Sidebar">
            <img src="/logo-icon.png" class="h-6 w-6 object-contain" alt="Collab AI" />
          </div>

          <!-- Nav Items -->
          <div class="flex flex-col items-center gap-1 w-full">
            ${navItems.map(item => {
              const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations');
              return `
                <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                  title="${item.label}"
                  class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                  <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Bottom Profile Initial (No second collapse button) -->
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.14] transition-colors" onclick="toggleUserMenu(event)" title="${firstName}">
            <span class="text-xs font-normal text-white">${firstName[0]}</span>
          </div>
        </div>
      </aside>
    `;
  }

  return `
    <aside 
      id="main-sidebar-panel"
      style="width: ${sidebarWidth}px" 
      class="bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-4 px-3 z-30 select-none relative panel-transition">
      
      <div class="flex flex-col gap-4">
        <!-- Logo & Single Collapse Button at Top -->
        <div class="flex items-center justify-between px-1.5 cursor-pointer">
          <div onclick="appStore.setRoute('/dashboard')" class="flex items-center">
            <img src="/logo.png" class="h-5 object-contain" alt="Collab AI" />
          </div>
          <button onclick="appStore.toggleSidebar()" class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover transition-colors" title="Collapse sidebar">
            <i data-lucide="panel-left-close" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-0.5">
          ${navItems.map(item => {
            const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations' && state.conversations.length === 0);
            return `
              <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${active ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5 ${active ? 'text-white' : 'text-app-textMuted'}"></i>
                <span class="truncate">${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Most Accessed Agents -->
        <div class="flex flex-col gap-1 pt-2.5 border-t border-app-borderSubtle">
          <span class="text-[10px] font-normal uppercase tracking-wider text-app-textMuted px-2.5">MOST ACCESSED</span>
          <div class="flex flex-col gap-0.5">
            ${mostAccessed.map(agent => `
              <div onclick="appStore.createConversation('${agent.name}', '', 'resume-agent')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12.5px] text-app-textSecondary hover:bg-app-hover hover:text-white cursor-pointer transition-colors font-normal">
                <span class="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                <span class="truncate">${agent.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Bottom Links & Profile -->
      <div class="flex flex-col gap-2.5">
        <div class="flex flex-col gap-0.5 border-t border-app-borderSubtle pt-2">
          ${bottomItems.map(item => {
            const active = currentRoute === item.route;
            return `
              <button onclick="appStore.setRoute('${item.route}')" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] font-normal transition-colors ${active ? 'text-white' : 'text-app-textMuted hover:text-app-textSecondary hover:bg-app-hover/50'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
                <span class="truncate">${item.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Clean Profile Pill (First Name only, no 'user', functional popup) -->
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

// Draggable Sidebar Resize logic
function initSidebarResize(e) {
  e.preventDefault();
  const sidebar = document.getElementById('main-sidebar-panel');
  if (!sidebar) return;

  sidebar.classList.remove('panel-transition');
  const startX = e.clientX;
  const startWidth = sidebar.getBoundingClientRect().width;

  function onMouseMove(moveEvent) {
    const newWidth = startWidth + (moveEvent.clientX - startX);
    if (newWidth < 130) {
      appStore.setSidebarWidth(100);
      onMouseUp();
    } else {
      sidebar.style.width = Math.min(Math.max(newWidth, 180), 380) + 'px';
    }
  }

  function onMouseUp() {
    sidebar.classList.add('panel-transition');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    const finalWidth = sidebar.getBoundingClientRect().width;
    appStore.setSidebarWidth(finalWidth);
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}