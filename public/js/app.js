// Main Application Controller & Router
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
  } else if (route.startsWith('/agents')) {
    viewHtml = renderAgentsView(state);
  } else if (route.startsWith('/projects')) {
    viewHtml = renderProjectsView(state);
  } else if (route.startsWith('/knowledge-base')) {
    viewHtml = renderKnowledgeBaseView(state);
  } else if (route.startsWith('/bug-reports')) {
    viewHtml = renderBugReportsView(state);
  } else {
    viewHtml = renderDashboardView(state);
  }

  root.innerHTML = `
    ${renderSidebar(state)}
    <div class="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      ${viewHtml}
    </div>
  `;

  lucide.createIcons();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `px-4 py-2.5 rounded-xl border text-[13.5px] font-medium shadow-2xl flex items-center gap-2 pointer-events-auto transition-all transform translate-y-2 opacity-0 ${
    type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-app-tertiary border-app-borderSubtle text-white'
  }`;
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-octagon' : 'check-circle'}" class="w-4 h-4 text-app-accent"></i>
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
  }, 3500);
}

function closeModal() {
  const container = document.getElementById('modal-container');
  if (container) container.innerHTML = '';
}

function renderUserMenu() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-transparent z-40" onclick="closeModal()"></div>
    <div class="fixed bottom-20 left-4 w-56 bg-app-tertiary border border-app-borderSubtle rounded-xl p-2 shadow-2xl z-50 flex flex-col gap-1 text-[13px]">
      <div class="px-3 py-2 border-b border-app-borderSubtle flex flex-col">
        <span class="font-bold text-white">Sadman Zaman Khan</span>
        <span class="text-xs text-app-textMuted">sadman@collabai.dev</span>
      </div>
      <button onclick="showToast('Profile settings'); closeModal()" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-muted text-left">
        <i data-lucide="user" class="w-4 h-4"></i>
        <span>Account Settings</span>
      </button>
      <button onclick="appStore.logout(); closeModal()" class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-left">
        <i data-lucide="log-out" class="w-4 h-4"></i>
        <span>Sign Out</span>
      </button>
    </div>
  `;
  lucide.createIcons();
}

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const composerInput = document.getElementById('dashboard-composer-input') || document.getElementById('chat-textarea-input');
    if (composerInput) composerInput.focus();
  }
});

appStore.subscribe(() => {
  renderApp();
});

document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});