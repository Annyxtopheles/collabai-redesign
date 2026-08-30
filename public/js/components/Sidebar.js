// Sidebar.js - Minimalist, refined typography, white agent icons, clean profile menu
function renderSidebar(state) {
  const isCollapsed = state.sidebarCollapsed;
  const currentRoute = state.currentRoute;
  const firstName = (state.user && state.user.name ? state.user.name.split(' ')[0] : 'Sadman');

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
      <aside class="w-[68px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-5 px-3 z-30 transition-all duration-200">
        <div class="flex flex-col items-center gap-6">
          <div class="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg hover:bg-app-hover transition-colors" onclick="appStore.setRoute('/dashboard')">
            <img src="/logo.png" class="h-5 object-contain" alt="Collab AI" />
          </div>
          <div class="flex flex-col items-center gap-1.5 w-full">
            ${navItems.map(item => {
              const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations');
              return `
                <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                  title="${item.label}"
                  class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-white/[0.08] text-white' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                  <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="flex flex-col items-center gap-3">
          <button onclick="appStore.toggleSidebar()" title="Expand Sidebar" class="w-9 h-9 flex items-center justify-center text-app-textMuted hover:text-white rounded-lg hover:bg-app-hover transition-colors">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
          <div class="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center cursor-pointer hover:bg-white/[0.14] transition-colors" onclick="toggleUserMenu(event)" title="Sadman">
            <span class="text-xs font-medium text-white">${firstName[0]}</span>
          </div>
        </div>
      </aside>
    `;
  }

  return `
    <aside class="w-[230px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-5 px-3 z-30 transition-all duration-200 select-none relative">
      <div class="flex flex-col gap-5">
        <!-- Logo & Branding -->
        <div class="flex items-center justify-between px-2 cursor-pointer" onclick="appStore.setRoute('/dashboard')">
          <img src="/logo.png" class="h-5 object-contain" alt="Collab AI" />
          <button onclick="appStore.toggleSidebar()" class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover transition-colors">
            <i data-lucide="panel-left-close" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-0.5">
          ${navItems.map(item => {
            const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations' && state.conversations.length === 0);
            return `
              <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${active ? 'bg-white/[0.08] text-white font-medium' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                <i data-lucide="${item.icon}" class="w-4 h-4 ${active ? 'text-white' : 'text-app-textMuted'}"></i>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Most Accessed Agents -->
        <div class="flex flex-col gap-1.5 pt-3 border-t border-app-borderSubtle">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-app-textMuted px-3">MOST ACCESSED</span>
          <div class="flex flex-col gap-0.5">
            ${mostAccessed.map(agent => `
              <div onclick="appStore.createConversation('${agent.name}', '', 'resume-agent')" class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] text-app-textSecondary hover:bg-app-hover hover:text-white cursor-pointer transition-colors">
                <span class="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                <span class="truncate">${agent.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Bottom Links & User Profile -->
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-0.5 border-t border-app-borderSubtle pt-2.5">
          ${bottomItems.map(item => {
            const active = currentRoute === item.route;
            return `
              <button onclick="appStore.setRoute('${item.route}')" class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors ${active ? 'text-white font-medium' : 'text-app-textMuted hover:text-app-textSecondary hover:bg-app-hover/50'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Clean Profile Pill (First Name only, no 'user', functional popup trigger) -->
        <div id="sidebar-profile-button" class="flex items-center justify-between p-2 rounded-lg bg-app-surface hover:bg-app-hover border border-app-borderSubtle cursor-pointer transition-colors" onclick="toggleUserMenu(event)">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white font-medium text-xs">
              ${firstName[0]}
            </div>
            <span class="text-[13px] font-medium text-white truncate">${firstName}</span>
          </div>
          <i data-lucide="chevron-up" class="w-3.5 h-3.5 text-app-textMuted"></i>
        </div>
      </div>
    </aside>
  `;
}