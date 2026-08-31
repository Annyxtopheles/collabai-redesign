// SettingsView.js - Dedicated Settings & API Keys Management Page with Scalable Theme Registry & Ambient Particle Controls
function renderSettingsView(state) {
  const currentKey = localStorage.getItem('collab_groq_key') || '';
  const currentGemini = localStorage.getItem('collab_gemini_key') || '';
  const currentOpenRouter = localStorage.getItem('collab_openrouter_key') || '';
  const currentTheme = state.theme || 'dark';
  const ambientEnabled = state.ambientEffectsEnabled !== false;
  const themes = (typeof THEMES_CONFIG !== 'undefined') ? THEMES_CONFIG : [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Settings & Preferences')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-7 animate-fade-in">
        
        <!-- Header -->
        <div class="flex flex-col gap-0.5">
          <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">Settings & Preferences</h1>
          <p class="text-[13.5px] text-app-textSecondary">Configure your appearance, ambient particle effects, default AI provider, and custom API keys</p>
        </div>

        <!-- Appearance Section with Scalable Theme Registry -->
        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
                <i data-lucide="palette" class="w-4 h-4"></i>
              </div>
              <div class="flex flex-col">
                <h2 class="text-[15px] font-medium text-app-textPrimary">Theme & Appearance</h2>
                <span class="text-[12px] text-app-textMuted">Select your preferred interface color palette and aesthetic</span>
              </div>
            </div>
            <span class="text-[11px] px-2.5 py-1 rounded-full bg-app-input border border-app-borderSubtle text-app-textSecondary font-mono uppercase">
              ${escapeHtml(currentTheme)}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            ${themes.map(t => {
              const isActive = currentTheme === t.id;
              let cardStyle = isActive 
                ? (t.id === 'pink' ? 'border-black bg-[#FFF5F9] text-black shadow-md' : 'border-app-borderActive bg-app-hover text-app-textPrimary ring-1 ring-app-borderActive') 
                : 'border-app-borderSubtle bg-app-input text-app-textSecondary hover:border-app-borderMed';
              let iconBoxStyle = `background-color: ${t.previewBg}; border: 1px solid ${t.previewBorder}; color: ${t.previewText};`;
              if (t.id === 'pink') {
                iconBoxStyle = 'background-color: #FF5DA2; border: 2px solid #000000; color: #000000; box-shadow: 2px 2px 0px #000000;';
              }

              return `
                <div 
                  onclick="appStore.setTheme('${t.id}')"
                  class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 ${cardStyle}">
                  <div class="flex items-center justify-between">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="${iconBoxStyle}">
                      <i data-lucide="${t.icon || 'palette'}" class="w-4 h-4"></i>
                    </div>
                    ${isActive ? `<i data-lucide="check-circle-2" class="w-4 h-4 ${t.id === 'pink' ? 'text-[#FF5DA2]' : 'text-emerald-500'}"></i>` : ''}
                  </div>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1.5">
                      <span class="font-medium text-[13.5px] text-app-textPrimary">${escapeHtml(t.name)}</span>
                      ${t.badge ? `<span class="text-[9.5px] px-1.5 py-0.2 rounded bg-app-surface border border-app-borderSubtle text-app-textMuted">${t.badge}</span>` : ''}
                    </div>
                    <span class="text-[11.5px] text-app-textMuted leading-relaxed">${escapeHtml(t.description)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Ambient Background Particle & Matrix Effects Control -->
          <div class="mt-2 pt-4 border-t border-app-borderSubtle flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
                  <i data-lucide="${currentTheme === 'pink' ? 'flower-2' : (currentTheme === 'dark' && state.darkAmbientStyle === 'stars' ? 'sparkles' : 'binary')}" class="w-4 h-4 ${ambientEnabled ? (currentTheme === 'pink' ? 'text-pink-400' : 'text-emerald-400') : 'text-app-textMuted'}"></i>
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="text-[13.5px] font-medium text-app-textPrimary">Ambient Background Animation</span>
                    <span class="text-[10px] px-2 py-0.2 rounded-full ${ambientEnabled ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'} font-medium">
                      ${ambientEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <span class="text-[12px] text-app-textMuted">
                    ${currentTheme === 'dark' 
                      ? (state.darkAmbientStyle === 'stars' ? 'Micro-pinpoint glittering starfield gently twinkling behind UI' : 'Cyber ASCII digital rain & cryptographic code matrix streaming behind UI') 
                      : (currentTheme === 'light' ? 'Subtle slate ASCII digital code rain & cryptographic matrix grid' : 'Multi-depth Japanese cherry blossom (Sakura) leaves slowly drifting in spring breeze')}
                  </span>
                </div>
              </div>

              <button 
                onclick="appStore.toggleAmbientEffects()"
                class="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-[12.5px] font-medium transition-all ${ambientEnabled ? 'btn-primary shadow-sm' : 'bg-app-input border-app-borderSubtle text-app-textMuted hover:text-app-textPrimary'}">
                <i data-lucide="${ambientEnabled ? 'check' : 'power'}" class="w-3.5 h-3.5"></i>
                <span>${ambientEnabled ? 'Enabled' : 'Disabled'}</span>
              </button>
            </div>

            <!-- Dark Mode Multi-Style Selector (Glyph Matrix vs Stars) -->
            ${ambientEnabled && currentTheme === 'dark' ? `
              <div class="flex items-center justify-between p-3 rounded-xl bg-app-input border border-app-borderSubtle text-[12.5px]">
                <div class="flex flex-col">
                  <span class="font-medium text-app-textPrimary">Dark Mode Ambient Style</span>
                  <span class="text-[11.5px] text-app-textMuted">Choose between dynamic Cyber Glyph Matrix or Serene Starfield</span>
                </div>
                <div class="flex items-center gap-1.5 bg-app-surface p-1 rounded-lg border border-app-borderSubtle">
                  <button 
                    onclick="appStore.setDarkAmbientStyle('matrix')"
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] transition-all ${state.darkAmbientStyle !== 'stars' ? 'bg-app-elevated border border-app-borderActive text-app-textPrimary font-semibold shadow-xs' : 'text-app-textMuted hover:text-app-textPrimary'}">
                    <i data-lucide="binary" class="w-3.5 h-3.5 text-emerald-400"></i>
                    <span>Glyph Matrix</span>
                  </button>
                  <button 
                    onclick="appStore.setDarkAmbientStyle('stars')"
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] transition-all ${state.darkAmbientStyle === 'stars' ? 'bg-app-elevated border border-app-borderActive text-app-textPrimary font-semibold shadow-xs' : 'text-app-textMuted hover:text-app-textPrimary'}">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
                    <span>Glittering Stars</span>
                  </button>
                </div>
              </div>
            ` : ''}
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