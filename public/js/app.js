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

// Functioning Profile Dropdown Menu in Left Bottom Corner
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
  const firstName = user.name.split(' ')[0];

  container.innerHTML = `
    <div class="fixed inset-0 bg-transparent z-40" onclick="closeModal()"></div>

    <div class="fixed bottom-14 left-2.5 w-60 bg-app-surface border border-app-borderSubtle rounded-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 text-[12.5px] font-normal select-none">
      
      <!-- User Profile Header -->
      <div class="px-2.5 py-2 border-b border-app-borderSubtle flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white font-normal text-xs">
          ${firstName[0]}
        </div>
        <div class="flex flex-col min-w-0">
          <span class="font-medium text-white truncate text-[13px]">${user.name}</span>
          <span class="text-[11px] text-app-textMuted truncate">${user.email}</span>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="flex flex-col gap-0.5 py-1">
        <button onclick="showAccountSettingsModal(); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="user" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Account Settings</span>
        </button>

        <button onclick="showApiSettingsModal(); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="key" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>API Key & Provider Settings</span>
        </button>

        <button onclick="showToast('Active Workspace: CollabAI Team'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="building" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Workspace</span>
        </button>

        <button onclick="appStore.setRoute('/bug-reports'); closeModal()" class="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-app-textSecondary hover:text-white hover:bg-app-hover text-left transition-colors font-normal">
          <i data-lucide="life-buoy" class="w-3.5 h-3.5 text-app-textMuted"></i>
          <span>Bug Reports & Support</span>
        </button>
      </div>

      <!-- Sign Out Button -->
      <div class="border-t border-app-borderSubtle pt-0.5">
        <button onclick="appStore.logout(); closeModal()" class="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-left transition-colors font-normal">
          <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
}

// API Key & Model Configuration Modal in Settings
function showApiSettingsModal() {
  const geminiKey = localStorage.getItem('collab_gemini_key') || '';
  const groqKey = localStorage.getItem('collab_groq_key') || '';
  const container = document.getElementById('modal-container');

  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 text-[13px]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="key" class="w-4 h-4 text-app-accent"></i>
            <h2 class="text-[15.5px] font-semibold text-white">AI Model Provider Settings</h2>
          </div>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <p class="text-[12.5px] text-app-textSecondary leading-relaxed">
          Configure external LLM providers for live inference. Leave blank to use the built-in intelligent engine.
        </p>

        <div class="flex flex-col gap-3">
          <!-- Google Gemini Free API -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <label class="font-medium text-white text-[12px]">Google Gemini API Key (100% Free)</label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-[11.5px] text-app-accent hover:underline">Get Free Gemini Key ↗</a>
            </div>
            <input 
              type="password" 
              id="gemini-key-input"
              value="${geminiKey}" 
              placeholder="AIzaSy..." 
              class="bg-app-input border border-app-borderSubtle text-white text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-app-borderActive font-mono"
            />
            <span class="text-[11px] text-app-textMuted">Free tier: 15 RPM / 1,500 requests per day (no card required).</span>
          </div>

          <!-- Groq Free API -->
          <div class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <label class="font-medium text-white text-[12px]">Groq API Key (Ultra-fast & Free)</label>
              <a href="https://console.groq.com/keys" target="_blank" class="text-[11.5px] text-app-accent hover:underline">Get Free Groq Key ↗</a>
            </div>
            <input 
              type="password" 
              id="groq-key-input"
              value="${groqKey}" 
              placeholder="gsk_..." 
              class="bg-app-input border border-app-borderSubtle text-white text-[13px] rounded-lg px-3 py-2 focus:outline-none focus:border-app-borderActive font-mono"
            />
            <span class="text-[11px] text-app-textMuted">Powers Llama-3.3-70B and DeepSeek-R1 at 500+ tokens/sec.</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle">
          <button onclick="clearAllApiKeys()" class="text-[12px] text-red-400 hover:underline">Reset to Default Built-in</button>
          <div class="flex items-center gap-2">
            <button onclick="closeModal()" class="px-3 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white text-[12.5px]">Cancel</button>
            <button onclick="saveAllApiKeys()" class="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium text-[12.5px]">Save Keys</button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function saveAllApiKeys() {
  const gemini = document.getElementById('gemini-key-input').value.trim();
  const groq = document.getElementById('groq-key-input').value.trim();

  if (gemini) localStorage.setItem('collab_gemini_key', gemini);
  else localStorage.removeItem('collab_gemini_key');

  if (groq) localStorage.setItem('collab_groq_key', groq);
  else localStorage.removeItem('collab_groq_key');

  closeModal();
  showToast('API credentials updated successfully.');
}

function clearAllApiKeys() {
  localStorage.removeItem('collab_gemini_key');
  localStorage.removeItem('collab_groq_key');
  closeModal();
  showToast('Reset to built-in simulation engine.');
}

function showAccountSettingsModal() {
  const user = appStore.state.user || DEFAULT_USER;
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 text-[13px]">
        <div class="flex items-center justify-between">
          <h2 class="text-[15.5px] font-semibold text-white">Account Settings</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex flex-col gap-1">
            <label class="font-normal text-app-textSecondary">Full Name</label>
            <input type="text" id="settings-name" value="${user.name}" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive font-normal" />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-normal text-app-textSecondary">Email Address</label>
            <input type="email" id="settings-email" value="${user.email}" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive font-normal" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button onclick="closeModal()" class="px-3.5 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white font-normal">Cancel</button>
          <button onclick="saveAccountSettings()" class="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium">Save Changes</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function saveAccountSettings() {
  const name = document.getElementById('settings-name').value.trim();
  const email = document.getElementById('settings-email').value.trim();
  if (name) appStore.state.user.name = name;
  if (email) appStore.state.user.email = email;
  appStore.save();
  closeModal();
  showToast('Account profile updated.');
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
    type === 'error' ? 'bg-red-950 border-red-800 text-red-200' : 'bg-app-surface border-app-borderSubtle text-white'
  }`;
  toast.innerHTML = `
    <i data-lucide="${type === 'error' ? 'alert-octagon' : 'check'}" class="w-3.5 h-3.5 text-app-accent"></i>
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