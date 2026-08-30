// Sidebar.js - Matches Figma design exactly with pure #111111/#141414 and official Collab AI logo
function renderSidebar(state) {
  const isCollapsed = state.sidebarCollapsed;
  const currentRoute = state.currentRoute;

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
    { name: 'Resume Review Agent', color: '#EF4444' },
    { name: 'Color Palette Generator', color: '#3B82F6' },
    { name: 'Aster Architect', color: '#10B981' },
    { name: 'Reasoning Advisor', color: '#8B5CF6' }
  ];

  if (isCollapsed) {
    return `
      <aside class="w-[68px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-5 px-3 z-30 transition-all duration-200">
        <div class="flex flex-col items-center gap-6">
          <div class="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg hover:bg-app-hover" onclick="appStore.setRoute('/dashboard')">
            <img src="/logo.png" class="h-6 object-contain" alt="Collab AI" />
          </div>
          <div class="flex flex-col items-center gap-2 w-full">
            ${navItems.map(item => {
              const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations');
              return `
                <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                  title="${item.label}"
                  class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${active ? 'bg-app-hover text-white border-l-2 border-app-accent' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                  <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="flex flex-col items-center gap-3">
          <button onclick="appStore.toggleSidebar()" title="Expand Sidebar" class="w-9 h-9 flex items-center justify-center text-app-textMuted hover:text-white rounded-lg hover:bg-app-hover">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
          <div class="w-8 h-8 rounded-full bg-app-elevated flex items-center justify-center border border-app-borderSubtle cursor-pointer" onclick="appStore.setRoute('/dashboard')" title="Sadman Zan">
            <span class="text-xs font-bold text-white">SZ</span>
          </div>
        </div>
      </aside>
    `;
  }

  return `
    <aside class="w-[240px] bg-app-sidebar border-r border-app-borderSubtle flex flex-col justify-between py-6 px-4 z-30 transition-all duration-200 select-none">
      <div class="flex flex-col gap-6">
        <!-- Logo & Branding using official logo -->
        <div class="flex items-center justify-between px-2 cursor-pointer" onclick="appStore.setRoute('/dashboard')">
          <div class="flex items-center gap-2">
            <img src="/logo.png" class="h-6 object-contain" alt="Collab AI" />
          </div>
          <button onclick="appStore.toggleSidebar()" class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover">
            <i data-lucide="panel-left-close" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1">
          ${navItems.map(item => {
            const active = currentRoute.startsWith(item.route) || (item.route === '/conversations/new' && currentRoute === '/conversations' && state.conversations.length === 0);
            return `
              <button onclick="${item.isSpecial ? "appStore.createConversation('New Chat', '')" : `appStore.setRoute('${item.route}')`}" 
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${active ? 'bg-app-hover text-white font-semibold relative' : 'text-app-textSecondary hover:bg-app-hover hover:text-white'}">
                ${active ? '<span class="absolute left-0 top-1.5 bottom-1.5 w-1 bg-app-accent rounded-r"></span>' : ''}
                <i data-lucide="${item.icon}" class="w-4 h-4 ${active ? 'text-white' : 'text-app-textMuted'}"></i>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </nav>

        <!-- Most Accessed Agents -->
        <div class="flex flex-col gap-2 pt-3 border-t border-app-borderSubtle">
          <span class="text-[10.5px] font-bold uppercase tracking-wider text-app-textMuted px-3">MOST ACCESSED</span>
          <div class="flex flex-col gap-0.5">
            ${mostAccessed.map(agent => `
              <div onclick="appStore.createConversation('${agent.name}', '', 'resume-agent')" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-app-textSecondary hover:bg-app-hover hover:text-white cursor-pointer transition-colors">
                <span class="w-2 h-2 rounded-full" style="background-color: ${agent.color}"></span>
                <span class="truncate">${agent.name}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Bottom Links & User Profile Card in brand #171717 -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1 border-t border-app-borderSubtle pt-3">
          ${bottomItems.map(item => {
            const active = currentRoute === item.route;
            return `
              <button onclick="appStore.setRoute('${item.route}')" class="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[12.5px] transition-colors ${active ? 'text-white font-semibold' : 'text-app-textMuted hover:text-app-textSecondary hover:bg-app-hover/50'}">
                <i data-lucide="${item.icon}" class="w-3.5 h-3.5"></i>
                <span>${item.label}</span>
              </button>
            `;
          }).join('')}
        </div>

        <div class="flex items-center justify-between p-2.5 rounded-lg bg-app-surface border border-app-borderSubtle cursor-pointer hover:border-app-borderMed transition-colors" onclick="renderUserMenu()">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-app-elevated border border-app-borderSubtle flex items-center justify-center text-white font-bold text-xs">
              SZ
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-[13px] font-semibold text-white truncate leading-tight">Sadman Zan</span>
              <span class="text-[11px] text-app-textMuted leading-tight">user</span>
            </div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-app-textMuted"></i>
        </div>
      </div>
    </aside>
  `;
}