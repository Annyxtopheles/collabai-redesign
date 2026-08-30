// SettingsView.js - Dedicated Settings & API Key Provider Page
let activeSettingsTab = 'providers';

function renderSettingsView(state) {
  const user = state.user || DEFAULT_USER;
  const groqKey = localStorage.getItem('collab_groq_key') || '';
  const geminiKey = localStorage.getItem('collab_gemini_key') || '';
  const openrouterKey = localStorage.getItem('collab_openrouter_key') || '';

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Settings')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header -->
        <div class="flex flex-col gap-0.5">
          <h1 class="text-[22px] font-semibold text-white tracking-tight">Settings & Preferences</h1>
          <p class="text-[13.5px] text-app-textSecondary">Manage API model keys, profile identity, workspaces, and application behavior.</p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-6 border-b border-app-borderSubtle text-[13.5px]">
          <button 
            onclick="setSettingsTab('providers')"
            class="pb-2.5 font-medium transition-colors border-b-2 ${activeSettingsTab === 'providers' ? 'border-app-accent text-white' : 'border-transparent text-app-textSecondary hover:text-white'}">
            AI Model Providers
          </button>
          <button 
            onclick="setSettingsTab('profile')"
            class="pb-2.5 font-medium transition-colors border-b-2 ${activeSettingsTab === 'profile' ? 'border-app-accent text-white' : 'border-transparent text-app-textSecondary hover:text-white'}">
            Profile & Account
          </button>
          <button 
            onclick="setSettingsTab('workspace')"
            class="pb-2.5 font-medium transition-colors border-b-2 ${activeSettingsTab === 'workspace' ? 'border-app-accent text-white' : 'border-transparent text-app-textSecondary hover:text-white'}">
            Workspaces
          </button>
        </div>

        ${activeSettingsTab === 'providers' ? `
          <!-- AI Model Providers Section -->
          <div class="flex flex-col gap-5">
            <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-6 flex flex-col gap-5 shadow-lg">
              
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <i data-lucide="cpu" class="w-4 h-4 text-emerald-400"></i>
                  <h2 class="text-[15.5px] font-medium text-white">Groq Cloud (Active Primary Engine)</h2>
                  <span class="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-normal">Active & Ultra-Fast</span>
                </div>
                <p class="text-[12.5px] text-app-textSecondary font-normal">Powers Llama-3.3-70B, GPT-OSS 120B, and Qwen 3.6 27B at 500+ tokens/second.</p>
              </div>

              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-[12px] font-normal text-white">Groq API Key</label>
                  <a href="https://console.groq.com/keys" target="_blank" class="text-[11.5px] text-app-accent hover:underline">Get Free Groq Key ↗</a>
                </div>
                <input 
                  type="password" 
                  id="page-groq-key"
                  value="${groqKey}" 
                  placeholder="gsk_..." 
                  class="bg-app-input border border-app-borderSubtle text-white font-mono text-[13px] rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive"
                />
              </div>

              <div class="border-t border-app-borderSubtle pt-4 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-[12px] font-normal text-white">Google Gemini API Key (100% Free)</label>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-[11.5px] text-app-accent hover:underline">Get Free Gemini Key ↗</a>
                </div>
                <input 
                  type="password" 
                  id="page-gemini-key"
                  value="${geminiKey}" 
                  placeholder="AIzaSy..." 
                  class="bg-app-input border border-app-borderSubtle text-white font-mono text-[13px] rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive"
                />
              </div>

              <div class="border-t border-app-borderSubtle pt-4 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-[12px] font-normal text-white">OpenRouter API Key (Unified Open-Source Aggregator)</label>
                  <a href="https://openrouter.ai/keys" target="_blank" class="text-[11.5px] text-app-accent hover:underline">Get OpenRouter Key ↗</a>
                </div>
                <input 
                  type="password" 
                  id="page-openrouter-key"
                  value="${openrouterKey}" 
                  placeholder="sk-or-v1-..." 
                  class="bg-app-input border border-app-borderSubtle text-white font-mono text-[13px] rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive"
                />
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle">
                <button onclick="resetSettingsKeys()" class="text-[12px] text-red-400 hover:underline">Reset Keys</button>
                <button onclick="savePageSettingsKeys()" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium text-[13px] shadow-sm">
                  Save Provider Settings
                </button>
              </div>

            </div>
          </div>
        ` : activeSettingsTab === 'profile' ? `
          <!-- Profile Settings -->
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-6 flex flex-col gap-4 shadow-lg text-[13px]">
            <h2 class="text-[15.5px] font-medium text-white">User Profile Identity</h2>
            
            <div class="flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-white font-normal">Full Name</label>
                <input type="text" id="page-profile-name" value="${user.name}" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-white font-normal">Email Address</label>
                <input type="email" id="page-profile-email" value="${user.email}" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button onclick="savePageProfile()" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium text-[13px]">Save Profile</button>
            </div>
          </div>
        ` : `
          <!-- Workspace Settings -->
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-6 flex flex-col gap-4 shadow-lg text-[13px]">
            <h2 class="text-[15.5px] font-medium text-white">Workspace Configuration</h2>
            <p class="text-app-textSecondary font-normal">Active Team Workspace: <strong class="text-white font-medium">CollabAI Default</strong></p>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded bg-app-input border border-app-borderSubtle text-white font-mono text-[12px]">Team ID: collab-ws-001</span>
              <span class="text-emerald-400 text-xs">● Connected</span>
            </div>
          </div>
        `}

      </div>
    </div>
  `;
}

function setSettingsTab(tab) {
  activeSettingsTab = tab;
  renderApp();
}

function savePageSettingsKeys() {
  const groq = document.getElementById('page-groq-key')?.value.trim();
  const gemini = document.getElementById('page-gemini-key')?.value.trim();
  const or = document.getElementById('page-openrouter-key')?.value.trim();

  if (groq) localStorage.setItem('collab_groq_key', groq);
  else localStorage.removeItem('collab_groq_key');

  if (gemini) localStorage.setItem('collab_gemini_key', gemini);
  else localStorage.removeItem('collab_gemini_key');

  if (or) localStorage.setItem('collab_openrouter_key', or);
  else localStorage.removeItem('collab_openrouter_key');

  showToast('API provider configuration saved!');
}

function resetSettingsKeys() {
  localStorage.removeItem('collab_groq_key');
  localStorage.removeItem('collab_gemini_key');
  localStorage.removeItem('collab_openrouter_key');
  renderApp();
  showToast('Reset keys to system default.');
}

function savePageProfile() {
  const name = document.getElementById('page-profile-name')?.value.trim();
  const email = document.getElementById('page-profile-email')?.value.trim();
  if (name) appStore.state.user.name = name;
  if (email) appStore.state.user.email = email;
  appStore.save();
  showToast('Profile updated.');
}