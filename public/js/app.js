// Main Application Controller & Router
let isUserMenuOpen = false;

// Windows-Style Smart Dropdown Positioning (Upwards/Downwards based on viewport space)
function positionDropdown(menuEl, triggerBtn) {
  if (!menuEl || !triggerBtn) return;
  const rect = triggerBtn.getBoundingClientRect();
  const menuHeight = menuEl.offsetHeight || 280;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;

  menuEl.style.position = 'fixed';
  menuEl.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - 300))}px`;
  menuEl.style.zIndex = '9999';

  // If there is enough room below or more space below than above, open downwards; otherwise open upwards
  if (spaceBelow >= menuHeight || spaceBelow > spaceAbove) {
    menuEl.style.top = `${rect.bottom + 6}px`;
    menuEl.style.bottom = 'auto';
  } else {
    menuEl.style.bottom = `${window.innerHeight - rect.top + 6}px`;
    menuEl.style.top = 'auto';
  }
}

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
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden content-area bg-transparent relative z-10">
      ${viewHtml}
    </div>
  `;

  lucide.createIcons();
}

// Functioning Profile Dropdown Menu with Scalable Multi-Theme Switcher & Ambient Toggle
function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const container = document.getElementById('modal-container');
  if (!container) return;

  if (isUserMenuOpen) {
    closeModal();
    return;
  }

  isUserMenuOpen = true;
  renderUserMenuContent();
}

function renderUserMenuContent() {
  const container = document.getElementById('modal-container');
  if (!container || !isUserMenuOpen) return;

  const user = appStore.state.user || DEFAULT_USER;
  const currentTheme = appStore.state.theme || 'dark';
  const ambientEnabled = appStore.state.ambientEffectsEnabled !== false;
  const firstName = user.name.split(' ')[0];
  const isAdmin = user.role === 'admin' || user.email === 'sadman@collabai.dev';
  const themes = (typeof THEMES_CONFIG !== 'undefined') ? THEMES_CONFIG : [
    { id: 'dark', name: 'Dark Minimal', shortName: 'Dark', icon: 'moon', ambientEffectName: 'Glittering Stars' },
    { id: 'light', name: 'Light Minimal', shortName: 'Light', icon: 'sun', ambientEffectName: null },
    { id: 'pink', name: 'Pink Wireframe', shortName: 'Pink', icon: 'sparkles', ambientEffectName: 'Falling Sakura' }
  ];

  const activeThemeMeta = themes.find(t => t.id === currentTheme) || themes[0];

  container.innerHTML = `
    <div class="fixed inset-0 bg-transparent z-40" onclick="closeModal()"></div>

    <div class="fixed bottom-14 left-2.5 w-84 bg-app-surface border border-app-borderSubtle rounded-2xl p-2.5 shadow-2xl z-50 flex flex-col gap-2 text-[12.5px] font-normal select-none animate-fade-in" onclick="event.stopPropagation()">
      
      <!-- User Profile Header -->
      <div class="px-2.5 py-2 border-b border-app-borderSubtle flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary font-medium text-xs flex-shrink-0">
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

      <!-- Scalable Theme Switcher with Live In-Place Preview -->
      <div class="p-2.5 bg-app-elevated rounded-xl flex flex-col gap-2 border border-app-borderSubtle">
        <div class="flex items-center justify-between px-0.5 text-[11px] text-app-textMuted font-medium uppercase tracking-wider">
          <span>Theme & Appearance</span>
          <span class="text-app-textSecondary capitalize font-semibold">${escapeHtml(activeThemeMeta.name || currentTheme)}</span>
        </div>

        <!-- Dynamically Scaled Theme Grid (Supports 4 Themes: Dark, Light, Pink, CRT) -->
        <div class="grid grid-cols-4 gap-1.5 bg-app-input p-1.5 rounded-xl border border-app-borderSubtle text-[11px]">
          ${themes.map(t => {
            const isActive = currentTheme === t.id;
            let activeStyle = 'bg-app-surface text-app-textPrimary shadow-sm font-semibold';
            if (t.id === 'pink' && isActive) {
              activeStyle = 'bg-[#FF5DA2] text-black border border-black shadow-sm font-bold';
            } else if (t.id === 'crt' && isActive) {
              activeStyle = 'bg-[#163016] text-[#33FF66] border border-[#33FF66] font-semibold shadow-[0_0_8px_rgba(51,255,102,0.25)]';
            }
            return `
              <button 
                onclick="switchTheme('${t.id}')" 
                title="${escapeHtml(t.description || t.name)}"
                class="flex items-center justify-center gap-1 py-2 px-1 rounded-lg transition-all ${isActive ? activeStyle : 'text-app-textMuted hover:text-app-textPrimary hover:bg-app-hover'}">
                <i data-lucide="${t.icon || 'palette'}" class="w-3.5 h-3.5"></i>
                <span class="truncate">${escapeHtml(t.shortName || t.name)}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Theme Ambient Background Effects Control (CRT Raster, Vortex/Glyph/Stars, Sakura) -->
        <div class="flex flex-col gap-1.5 pt-1.5 border-t border-app-borderSubtle text-[11.5px]">
          <div class="flex items-center justify-between px-0.5">
            <div class="flex items-center gap-1.5 text-app-textSecondary">
              <i data-lucide="${currentTheme === 'crt' ? 'tv' : (currentTheme === 'pink' ? 'flower-2' : (currentTheme === 'dark' ? (appStore.state.darkAmbientStyle === 'stars' ? 'sparkles' : (appStore.state.darkAmbientStyle === 'matrix' ? 'binary' : 'orbit')) : 'binary'))}" class="w-3.5 h-3.5 ${ambientEnabled ? (currentTheme === 'crt' ? 'text-emerald-400' : (currentTheme === 'pink' ? 'text-pink-400' : 'text-emerald-400')) : 'text-app-textMuted'}"></i>
              <span class="font-medium text-app-textPrimary">Ambient Background</span>
            </div>
            <button 
              onclick="toggleAmbientFromMenu()" 
              class="flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10.5px] font-medium transition-all ${ambientEnabled ? 'bg-app-surface border-app-borderActive text-app-textPrimary shadow-xs' : 'bg-app-input border-app-borderSubtle text-app-textMuted hover:text-app-textPrimary'}">
              <span class="w-1.5 h-1.5 rounded-full ${ambientEnabled ? 'bg-emerald-500' : 'bg-zinc-500'}"></span>
              <span>${ambientEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          <!-- Multi-Style Ambient Pills for Dark Mode (Neural Vortex, Glyph Matrix, Stars) -->
          ${ambientEnabled && currentTheme === 'dark' ? `
            <div class="grid grid-cols-3 gap-1 bg-app-input p-1 rounded-lg border border-app-borderSubtle text-[10px]">
              <button 
                onclick="selectDarkAmbient('vortex')"
                class="flex items-center justify-center gap-1 py-1 rounded transition-all ${appStore.state.darkAmbientStyle === 'vortex' ? 'bg-app-surface text-app-textPrimary font-semibold shadow-xs' : 'text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="orbit" class="w-3 h-3 text-cyan-400"></i>
                <span class="truncate">Vortex</span>
              </button>
              <button 
                onclick="selectDarkAmbient('matrix')"
                class="flex items-center justify-center gap-1 py-1 rounded transition-all ${appStore.state.darkAmbientStyle === 'matrix' ? 'bg-app-surface text-app-textPrimary font-semibold shadow-xs' : 'text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="binary" class="w-3 h-3 text-emerald-400"></i>
                <span class="truncate">Glyphs</span>
              </button>
              <button 
                onclick="selectDarkAmbient('stars')"
                class="flex items-center justify-center gap-1 py-1 rounded transition-all ${appStore.state.darkAmbientStyle === 'stars' ? 'bg-app-surface text-app-textPrimary font-semibold shadow-xs' : 'text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="sparkles" class="w-3 h-3 text-amber-300"></i>
                <span class="truncate">Stars</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Menu Navigation Items -->
      <div class="flex flex-col gap-0.5 py-0.5">
        <button onclick="showToast('You have 0 unread notifications')" class="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
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

        <button onclick="appStore.setRoute('/bug-reports'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="life-buoy" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Bug Reports & Support</span>
        </button>
      </div>

      <!-- Sign Out Button -->
      <div class="border-t border-app-borderSubtle pt-1">
        <button onclick="appStore.logout(); closeModal()" class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-left transition-colors font-normal text-[12px]">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// Live preview theme switcher - keeps window open for consecutive testing!
function switchTheme(themeName) {
  appStore.setTheme(themeName);
  renderUserMenuContent();
}

function toggleAmbientFromMenu() {
  appStore.toggleAmbientEffects();
  renderUserMenuContent();
}

function selectDarkAmbient(style) {
  appStore.setDarkAmbientStyle(style);
  renderUserMenuContent();
}

function selectLightAmbient(style) {
  appStore.setLightAmbientStyle(style);
  renderUserMenuContent();
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
  if (!e.target.closest('#dashboard-templates-btn') && !e.target.closest('#dashboard-templates-dropdown-menu')) {
    const dashTmplMenu = document.getElementById('dashboard-templates-dropdown-menu');
    if (dashTmplMenu) dashTmplMenu.classList.add('hidden');
  }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const searchInput = document.getElementById('sidebar-search-input') || document.getElementById('dashboard-composer-input') || document.getElementById('chat-textarea-input');
    if (searchInput) searchInput.focus();
  }
});

appStore.subscribe((state, meta) => {
  // If the change is purely theme or ambient particles, avoid tearing down and rebuilding the whole app DOM!
  if (meta && (meta.type === 'theme' || meta.type === 'ambient')) {
    if (state.currentRoute === '/settings') {
      const contentArea = document.querySelector('.content-area');
      if (contentArea) {
        contentArea.innerHTML = renderSettingsView(state);
        lucide.createIcons();
      }
    }
    return;
  }
  renderApp();
});

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});