// SettingsView.js - Dedicated Settings & API Keys Management Page with 3-Theme Controls
function renderSettingsView(state) {
  const currentKey = localStorage.getItem('collab_groq_key') || '';
  const currentGemini = localStorage.getItem('collab_gemini_key') || '';
  const currentOpenRouter = localStorage.getItem('collab_openrouter_key') || '';
  const currentTheme = state.theme || 'dark';

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Settings & Preferences')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-7 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col gap-0.5">
          <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">Settings & Preferences</h1>
          <p class="text-[13.5px] text-app-textSecondary">Configure your appearance, default AI provider, and custom API keys</p>
        </div>

        <!-- Appearance Section with 3 Themes -->
        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
              <i data-lucide="palette" class="w-4 h-4"></i>
            </div>
            <div class="flex flex-col">
              <h2 class="text-[15px] font-medium text-app-textPrimary">Theme & Appearance</h2>
              <span class="text-[12px] text-app-textMuted">Select your preferred interface color style and aesthetic</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            <!-- Dark Theme -->
            <div 
              onclick="appStore.setTheme('dark')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${currentTheme === 'dark' ? 'border-app-borderActive bg-app-hover text-app-textPrimary' : 'border-app-borderSubtle bg-app-input text-app-textSecondary hover:border-app-borderMed'}">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-lg bg-[#111111] border border-[#262626] flex items-center justify-center text-white">
                  <i data-lucide="moon" class="w-4 h-4"></i>
                </div>
                ${currentTheme === 'dark' ? `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>` : ''}
              </div>
              <div class="flex flex-col">
                <span class="font-medium text-[13.5px] text-app-textPrimary">Dark Minimal</span>
                <span class="text-[11.5px] text-app-textMuted">Pure #111111 dark canvas</span>
              </div>
            </div>

            <!-- Light Minimal Theme -->
            <div 
              onclick="appStore.setTheme('light')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${currentTheme === 'light' ? 'border-app-borderActive bg-app-hover text-app-textPrimary' : 'border-app-borderSubtle bg-app-input text-app-textSecondary hover:border-app-borderMed'}">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#18181B]">
                  <i data-lucide="sun" class="w-4 h-4 text-amber-500"></i>
                </div>
                ${currentTheme === 'light' ? `<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-500"></i>` : ''}
              </div>
              <div class="flex flex-col">
                <span class="font-medium text-[13.5px] text-app-textPrimary">Light Minimal</span>
                <span class="text-[11.5px] text-app-textMuted">Warm slate off-white mode</span>
              </div>
            </div>

            <!-- Pink Wireframe Theme -->
            <div 
              onclick="appStore.setTheme('pink')"
              class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${currentTheme === 'pink' ? 'border-black bg-[#FFF5F9] text-black shadow-md' : 'border-app-borderSubtle bg-app-input text-app-textSecondary hover:border-app-borderMed'}">
              <div class="flex items-center justify-between">
                <div class="w-8 h-8 rounded-lg bg-[#FF5DA2] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000000]">
                  <i data-lucide="sparkles" class="w-4 h-4"></i>
                </div>
                ${currentTheme === 'pink' ? `<i data-lucide="check-circle-2" class="w-4 h-4 text-[#FF5DA2]"></i>` : ''}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-[13.5px] text-app-textPrimary">Pink Wireframe</span>
                <span class="text-[11.5px] text-app-textMuted">Cream canvas & pink pop buttons</span>
              </div>
            </div>

          </div>
        </div>

        <!-- API Keys Configuration Card -->
        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
              <i data-lucide="key" class="w-4 h-4"></i>
            </div>
            <div class="flex flex-col">
              <h2 class="text-[15px] font-medium text-app-textPrimary">Custom API Keys</h2>
              <span class="text-[12px] text-app-textMuted">CollabAI uses Groq for high-speed live responses by default. You can configure custom keys below.</span>
            </div>
          </div>

          <form onsubmit="handleSaveSettings(event)" class="flex flex-col gap-4 text-[13px]">
            
            <!-- Groq Key -->
            <div class="flex flex-col gap-1.5">
              <label class="font-medium text-app-textPrimary flex items-center justify-between">
                <span>Groq API Key (Recommended for 60fps streaming)</span>
                <a href="https://console.groq.com/keys" target="_blank" class="text-[11.5px] text-app-textSecondary hover:underline">Get free key ↗</a>
              </label>
              <input 
                type="password" 
                id="settings-groq-key" 
                value="${currentKey}" 
                placeholder="gsk_..." 
                class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive font-mono text-[12.5px]"
              />
            </div>

            <!-- Google Gemini Key -->
            <div class="flex flex-col gap-1.5">
              <label class="font-medium text-app-textPrimary flex items-center justify-between">
                <span>Google Gemini API Key</span>
                <a href="https://aistudio.google.com/apikey" target="_blank" class="text-[11.5px] text-app-textSecondary hover:underline">Get key ↗</a>
              </label>
              <input 
                type="password" 
                id="settings-gemini-key" 
                value="${currentGemini}" 
                placeholder="AIzaSy..." 
                class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive font-mono text-[12.5px]"
              />
            </div>

            <!-- OpenRouter Key -->
            <div class="flex flex-col gap-1.5">
              <label class="font-medium text-app-textPrimary flex items-center justify-between">
                <span>OpenRouter API Key</span>
                <a href="https://openrouter.ai/keys" target="_blank" class="text-[11.5px] text-app-textSecondary hover:underline">Get key ↗</a>
              </label>
              <input 
                type="password" 
                id="settings-openrouter-key" 
                value="${currentOpenRouter}" 
                placeholder="sk-or-v1-..." 
                class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive font-mono text-[12.5px]"
              />
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-app-borderSubtle">
              <button 
                type="submit" 
                class="btn-primary text-[13px] px-5 py-2 rounded-xl transition-all shadow-sm">
                Save Preferences
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `;
}

function handleSaveSettings(e) {
  e.preventDefault();
  const groqKey = document.getElementById('settings-groq-key').value.trim();
  const geminiKey = document.getElementById('settings-gemini-key').value.trim();
  const openRouterKey = document.getElementById('settings-openrouter-key').value.trim();

  if (groqKey) localStorage.setItem('collab_groq_key', groqKey);
  else localStorage.removeItem('collab_groq_key');

  if (geminiKey) localStorage.setItem('collab_gemini_key', geminiKey);
  else localStorage.removeItem('collab_gemini_key');

  if (openRouterKey) localStorage.setItem('collab_openrouter_key', openRouterKey);
  else localStorage.removeItem('collab_openrouter_key');

  showToast('Settings and API keys saved successfully!');
}