// Main Application Controller & Router
let isUserMenuOpen = false;

function renderApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  const state = appStore.state;

  if (!state.isAuthenticated || state.currentRoute === '/login') {
    root.innerHTML = renderLoginView();
    lucide.createIcons();
    return;
  }

  let viewHtml = '';
  const route = state.currentRoute;

  if (route.startsWith('/conversations')) {
    viewHtml = renderConversationsView(state);
  } else if (route.startsWith('/agents') || route.startsWith('/explore')) {
    viewHtml = renderAgentsView(state);
  } else if (route.startsWith('/projects')) {
    viewHtml = renderProjectsView(state);
  } else if (route.startsWith('/knowledge-base')) {
    viewHtml = renderKnowledgeBaseView(state);
  } else if (route.startsWith('/bug-reports')) {
    viewHtml = renderBugReportsView(state);
  } else if (route.startsWith('/settings')) {
    viewHtml = renderSettingsView(state);
  } else if (route.startsWith('/admin')) {
    viewHtml = renderAdminUsersView(state);
  } else if (route.startsWith('/docs')) {
    viewHtml = renderDocsView(state);
  } else if (route.startsWith('/academy')) {
    viewHtml = renderAcademyView(state);
  } else {
    viewHtml = renderDashboardView(state);
  }

  root.innerHTML = `
    ${renderSidebar(state)}
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden content-area bg-app-canvas">
      ${viewHtml}
    </div>
  `;

  lucide.createIcons();
}

// Functioning Profile Dropdown Menu with Multi-Theme Switcher & Notifications
function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const container = document.getElementById('modal-container');
  if (!container) return;

  if (isUserMenuOpen) {
    closeModal();
    return;
  }

  isUserMenuOpen = true;
  const user = appStore.state.user || DEFAULT_USER;
  const currentTheme = appStore.state.theme || 'dark';
  const firstName = user.name.split(' ')[0];
  const isAdmin = user.role === 'admin' || user.email === 'sadman@collabai.dev';

  container.innerHTML = `
    <div class="fixed inset-0 bg-transparent z-40" onclick="closeModal()"></div>

    <div class="fixed bottom-14 left-2.5 w-80 bg-app-surface border border-app-borderSubtle rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-1.5 text-[12.5px] font-normal select-none animate-fade-in">
      
      <!-- User Profile Header -->
      <div class="px-2.5 py-2 border-b border-app-borderSubtle flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary font-medium text-xs">
          ${firstName[0]}
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="font-medium text-app-textPrimary truncate text-[13px]">${escapeHtml(user.name)}</span>
            ${isAdmin ? `<span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 font-medium">ADMIN</span>` : ''}
          </div>
          <span class="text-[11px] text-app-textMuted truncate">${escapeHtml(user.email)}</span>
        </div>
      </div>

      <!-- Multi-Theme Switcher Segmented Control (Dark / Light / Pink Wireframe) -->
      <div class="p-2 bg-app-elevated rounded-xl flex flex-col gap-1.5 border border-app-borderSubtle">
        <div class="flex items-center justify-between px-1 text-[11px] text-app-textMuted font-medium uppercase tracking-wider">
          <span>Theme Style</span>
          <span class="text-app-textSecondary capitalize">${currentTheme === 'pink' ? 'Pink Wireframe' : currentTheme + ' Mode'}</span>
        </div>
        <div class="grid grid-cols-3 gap-1 bg-app-input p-1 rounded-xl border border-app-borderSubtle text-[11.5px]">
          
          <button 
            onclick="switchTheme('dark')" 
            class="flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${currentTheme === 'dark' ? 'bg-app-surface text-app-textPrimary shadow-sm font-semibold' : 'text-app-textMuted hover:text-app-textPrimary'}">
            <i data-lucide="moon" class="w-3.5 h-3.5"></i>
            <span>Dark</span>
          </button>

          <button 
            onclick="switchTheme('light')" 
            class="flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${currentTheme === 'light' ? 'bg-app-surface text-app-textPrimary shadow-sm font-semibold' : 'text-app-textMuted hover:text-app-textPrimary'}">
            <i data-lucide="sun" class="w-3.5 h-3.5"></i>
            <span>Light</span>
          </button>

          <button 
            onclick="switchTheme('pink')" 
            class="flex items-center justify-center gap-1 py-1.5 rounded-lg transition-all ${currentTheme === 'pink' ? 'bg-[#FF5DA2] text-black border border-black shadow-sm font-bold' : 'text-app-textMuted hover:text-[#FF5DA2]'}">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Pink</span>
          </button>

        </div>
      </div>

      <!-- Menu Items -->
      <div class="flex flex-col gap-0.5 py-0.5">
        
        <!-- Notifications Action Item -->
        <button onclick="showToast('You have 0 unread notifications'); closeModal()" class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <div class="flex items-center gap-2.5">
            <i data-lucide="bell" class="w-3.5 h-3.5 text-app-textMuted"></i>
            <span>Notifications</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-app-input border border-app-borderSubtle text-app-textMuted">0 unread</span>
        </button>

        ${isAdmin ? `
          <button onclick="appStore.setRoute('/admin'); fetchAdminUsers(); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 text-left transition-colors font-normal">
            <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-500"></i>
            <span>User Access & Approvals</span>
          </button>
        ` : ''}

        <button onclick="appStore.setRoute('/settings'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="settings" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Settings & Preferences</span>
        </button>

        <button onclick="appStore.setRoute('/settings'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="key" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>API Key & Provider Settings</span>
        </button>

        <button onclick="showToast('Active Workspace: CollabAI Team'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="building" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Workspace</span>
        </button>

        <button onclick="appStore.setRoute('/bug-reports'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="life-buoy" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Bug Reports & Support</span>
        </button>
      </div>

      <!-- Sign Out Button -->
      <div class="border-t border-app-borderSubtle pt-0.5">
        <button onclick="appStore.logout(); closeModal()" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-left transition-colors font-normal">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function switchTheme(themeName) {
  appStore.setTheme(themeName);
  showToast(`Switched to ${themeName} theme`);
  closeModal();
}

function closeModal() {
  isUserMenuOpen = false;
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-3.5 py-2 rounded-xl border text-[12.5px] font-normal shadow-2xl flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 ${
    type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-app-surface border-app-borderSubtle text-app-textPrimary'
  }`;
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-octagon' : 'check'}" class="w-3.5 h-3.5 text-app-textPrimary"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Global click handler to close open in-place popups without re-rendering the whole page
document.addEventListener('click', (e) => {
  if (!e.target.closest('#chat-model-picker-btn') && !e.target.closest('#chat-model-dropdown-menu')) {
    const chatModelMenu = document.getElementById('chat-model-dropdown-menu');
    if (chatModelMenu) chatModelMenu.classList.add('hidden');
  }
  if (!e.target.closest('#chat-plus-btn') && !e.target.closest('#chat-plus-dropdown-menu')) {
    const chatPlusMenu = document.getElementById('chat-plus-dropdown-menu');
    if (chatPlusMenu) chatPlusMenu.classList.add('hidden');
  }
  if (!e.target.closest('#dashboard-model-picker-btn') && !e.target.closest('#dashboard-model-dropdown-menu')) {
    const dashModelMenu = document.getElementById('dashboard-model-dropdown-menu');
    if (dashModelMenu) dashModelMenu.classList.add('hidden');
  }
  if (!e.target.closest('#dashboard-plus-btn') && !e.target.closest('#dashboard-plus-dropdown-menu')) {
    const dashPlusMenu = document.getElementById('dashboard-plus-dropdown-menu');
    if (dashPlusMenu) dashPlusMenu.classList.add('hidden');
  }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('sidebar-search-input') || document.getElementById('dashboard-composer-input') || document.getElementById('chat-textarea-input');
    if (searchInput) searchInput.focus();
  }
});

appStore.subscribe(() => {
  renderApp();
});

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});