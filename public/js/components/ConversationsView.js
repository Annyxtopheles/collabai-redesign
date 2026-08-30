// ConversationsView.js - Solid Opaque Surfaces, Background-Only Ambient Stars
let isStreamingActive = false;

function renderConversationsView(state) {
  const conv = state.conversations.find(c => c.id === state.activeConversationId) || state.conversations[0];
  const messages = conv ? (conv.messages || []) : [];
  const activeModelId = state.selectedModel || 'openai/gpt-oss-120b';
  const activeModel = AVAILABLE_MODELS.find(m => m.id === activeModelId) || AVAILABLE_MODELS[0];
  const convTitle = conv ? (conv.title || 'New Conversation') : 'New Conversation';

  return `
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative z-10">
      
      <!-- Minimalist Chat Header -->
      <header class="h-[48px] border-b border-app-borderSubtle px-6 flex items-center justify-between shrink-0 bg-transparent select-none z-10">
        <div class="flex items-center gap-2 min-w-0">
          <h1 class="text-[14px] font-medium text-app-textPrimary truncate">${escapeHtml(convTitle)}</h1>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="appStore.createConversation('New Chat', '')" title="New Chat" class="p-1.5 text-app-textSecondary hover:text-app-textPrimary rounded-lg hover:bg-app-hover transition-colors">
            <i data-lucide="plus" class="w-4 h-4"></i>
          </button>
        </div>
      </header>

      <!-- Message Stream Area (Selectable Open Canvas layout) -->
      <div class="flex-1 overflow-y-auto px-6 sm:px-12 md:px-20 lg:px-32 py-6 flex flex-col gap-8 select-text relative z-10" id="chat-messages-container">
        
        <!-- Empty Conversation State (Direct, elegant, removed sparkles icon) -->
        ${messages.length === 0 ? `
          <div class="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-3.5 my-auto select-none">
            <div class="flex flex-col gap-1">
              <h2 class="text-[20px] font-medium text-app-textPrimary tracking-tight">How can I help you today?</h2>
              <p class="text-[13.5px] text-app-textSecondary font-normal">Ask a question, review code, or design multi-agent workflows.</p>
            </div>
            <div class="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <button 
                onclick="sendChatSuggestion('Draft a high-speed async event architecture')"
                class="text-[12.5px] bg-app-surface hover:bg-app-hover text-app-textPrimary font-normal px-4 py-2 rounded-xl border border-app-borderSubtle transition-all">
                "Draft async architecture"
              </button>
              <button 
                onclick="sendChatSuggestion('Review my resume for Staff AI Engineer')"
                class="text-[12.5px] bg-app-surface hover:bg-app-hover text-app-textPrimary font-normal px-4 py-2 rounded-xl border border-app-borderSubtle transition-all">
                "Review Tech Resume"
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Render Past Messages -->
        ${messages.map(msg => renderChatMessageBubble(msg)).join('')}

        <!-- Live Streaming Open Container -->
        <div id="live-streaming-bubble" class="hidden flex-col gap-3 w-full animate-fade-in select-text"></div>

      </div>

      <!-- Bottom Chat Composer Area -->
      <div class="p-4 sm:px-12 md:px-20 lg:px-32 max-w-4xl mx-auto w-full flex flex-col gap-1.5 relative z-20 select-none">

        <!-- Composer Box (Solid Opaque Surface) -->
        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-3 flex flex-col gap-2 focus-within:border-app-borderActive transition-colors relative z-20">
          
          <div class="flex items-center gap-2.5">
            
            <!-- Gemini-style Plus (+) Button with Directly Anchored Dropdown (Opens Upwards) -->
            <div class="relative shrink-0">
              <button 
                id="chat-plus-btn"
                onclick="toggleChatPlusMenu(event)"
                class="w-7 h-7 rounded-full bg-app-input hover:bg-app-hover border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary flex items-center justify-center transition-colors shrink-0" 
                title="Add attachment or tool">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              </button>

              <!-- Directly Anchored Plus Dropdown (Opens Upwards) -->
              <div id="chat-plus-dropdown-menu" class="hidden absolute bottom-full left-0 mb-2.5 w-64 bg-app-surface border border-app-borderSubtle rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
                <div class="px-2.5 py-1 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Tools & Attachments</div>
                
                <button onclick="triggerChatFileUpload(); closeChatMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="upload" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Upload files (PDF, Code, CSV)</span>
                </button>

                <button onclick="appStore.setRoute('/knowledge-base'); closeChatMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="database" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Attach from Knowledge Base</span>
                </button>

                <button onclick="appStore.setRoute('/agents'); closeChatMenus()" class="flex items-center gap-2.5 p-2 rounded-xl text-app-textSecondary hover:text-app-textPrimary hover:bg-app-hover text-left transition-colors font-normal">
                  <i data-lucide="bot" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                  <span>Mention @Agent</span>
                </button>
              </div>
            </div>

            <input 
              type="file" 
              id="chat-file-upload-input" 
              class="hidden" 
              onchange="handleChatFileSelected(this)" 
            />

            <textarea
              id="chat-textarea-input"
              rows="1"
              placeholder="Message CollabAI..."
              oninput="autoGrowTextarea(this)"
              onkeydown="handleChatKeydown(event)"
              class="flex-1 bg-transparent text-app-textPrimary text-[14px] font-normal placeholder-app-textMuted focus:outline-none resize-none max-h-32 select-text"
            ></textarea>

            <!-- Modern Arrow-Up Send Icon Button -->
            <button 
              id="chat-send-button"
              onclick="handleChatSend()"
              class="w-7 h-7 rounded-full btn-primary flex items-center justify-center transition-all hover:scale-105 shrink-0"
              title="Send message">
              <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Bottom Toolbar with Model Selector Trigger with Directly Anchored Dropdown (Opens Upwards) -->
          <div class="flex items-center justify-between pt-1.5 border-t border-app-borderSubtle text-[12px]">
            <div class="flex items-center gap-2">
              <div class="relative">
                <button 
                  type="button"
                  id="chat-model-picker-btn"
                  onclick="toggleModelPicker(event)"
                  class="flex items-center gap-1.5 bg-app-input hover:bg-app-hover px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary cursor-pointer transition-colors">
                  <span id="chat-active-model-name" class="font-normal text-app-textPrimary">${activeModel.name}</span>
                  <span id="chat-active-model-provider" class="text-[10px] text-app-textMuted">· ${activeModel.provider}</span>
                  <i data-lucide="chevron-down" class="w-3 h-3 text-app-textMuted"></i>
                </button>

                <!-- Directly Anchored Model Selector Dropdown (Opens Upwards in Chat) -->
                <div id="chat-model-dropdown-menu" class="hidden absolute bottom-full left-0 mb-2 w-72 bg-app-surface border border-app-borderSubtle rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5 animate-fade-in text-[12.5px]">
                  <div class="px-2.5 py-1.5 text-[11px] font-medium text-app-textMuted uppercase tracking-wider border-b border-app-borderSubtle">Select Model Provider</div>
                  ${AVAILABLE_MODELS.map(m => `
                    <div 
                      onclick="selectChatModel('${m.id}')"
                      class="flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${m.id === activeModelId ? 'bg-app-hover text-app-textPrimary font-medium' : 'text-app-textSecondary hover:bg-app-hover hover:text-app-textPrimary'}">
                      <div class="flex flex-col">
                        <span class="text-app-textPrimary">${m.name}</span>
                        <span class="text-[11px] text-app-textMuted">${m.provider}</span>
                      </div>
                      <span class="text-[10.5px] px-1.5 py-0.5 rounded bg-app-input border border-app-borderSubtle text-app-textMuted">${m.badge}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 text-app-textMuted text-[11px]">
              <span>Powered by Groq Cloud</span>
            </div>
          </div>

        </div>

        <span class="text-[11px] text-center text-app-textMuted font-normal">CollabAI can make mistakes. Verify important facts.</span>
      </div>

    </div>
  `;
}

// In-place dropdown toggles
function toggleModelPicker(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('chat-model-dropdown-menu');
  const plusMenu = document.getElementById('chat-plus-dropdown-menu');

  if (plusMenu) plusMenu.classList.add('hidden');
  if (menu) {
    menu.classList.toggle('hidden');
  }
  lucide.createIcons();
}

function toggleChatPlusMenu(e) {
  if (e) e.stopPropagation();
  const plusMenu = document.getElementById('chat-plus-dropdown-menu');
  const modelMenu = document.getElementById('chat-model-dropdown-menu');

  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) {
    plusMenu.classList.toggle('hidden');
  }
  lucide.createIcons();
}

function closeChatMenus() {
  const modelMenu = document.getElementById('chat-model-dropdown-menu');
  const plusMenu = document.getElementById('chat-plus-dropdown-menu');
  if (modelMenu) modelMenu.classList.add('hidden');
  if (plusMenu) plusMenu.classList.add('hidden');
}

// In-place model selection with zero flicker
function selectChatModel(modelId) {
  closeChatMenus();
  appStore.state.selectedModel = modelId;
  const conv = appStore.state.conversations.find(c => c.id === appStore.state.activeConversationId);
  if (conv) conv.model = modelId;
  localStorage.setItem('collab_ai_state', JSON.stringify(appStore.state));

  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (model) {
    const nameEl = document.getElementById('chat-active-model-name');
    const provEl = document.getElementById('chat-active-model-provider');
    if (nameEl) nameEl.innerText = model.name;
    if (provEl) provEl.innerText = '· ' + model.provider;
  }
  showToast(`Switched model to ${modelId}`);
}

function triggerChatFileUpload() {
  const input = document.getElementById('chat-file-upload-input');
  if (input) input.click();
}

function handleChatFileSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    showToast(`Attached "${file.name}" to conversation.`);
    const textarea = document.getElementById('chat-textarea-input');
    if (textarea) {
      textarea.value = `[Attached: ${file.name}] ` + textarea.value;
      textarea.focus();
    }
  }
}

// In-place smooth toggle for sources without full-screen flicker
function toggleSourcesInPlace(msgId) {
  const box = document.getElementById(`sources-box-${msgId}`);
  const chevron = document.getElementById(`sources-chevron-${msgId}`);
  if (!box) return;

  if (box.classList.contains('hidden')) {
    box.classList.remove('hidden');
    if (chevron) chevron.setAttribute('data-lucide', 'chevron-up');
  } else {
    box.classList.add('hidden');
    if (chevron) chevron.setAttribute('data-lucide', 'chevron-down');
  }
  lucide.createIcons();
}

function renderChatMessageBubble(msg) {
  if (msg.role === 'user') {
    return `
      <div class="flex justify-end w-full">
        <div class="max-w-[80%] bg-app-surface border border-app-borderSubtle text-app-textPrimary rounded-2xl px-5 py-3 text-[14px] font-normal leading-relaxed user-msg-bubble">
          ${escapeHtml(msg.content)}
        </div>
      </div>
    `;
  }

  // AI Assistant message: Clean, Selectable, Compact Headings
  const cleanContent = (msg.content || '').replace(/\n---+\n/g, '\n\n');
  const parsedMarkdown = marked.parse(cleanContent);
  const hasSources = msg.sources && msg.sources.length > 0;
  const hasSuggestions = msg.suggestions && msg.suggestions.length > 0;

  return `
    <div class="flex flex-col gap-3 w-full animate-fade-in select-text">
      
      <!-- Open AI Content Area -->
      <div class="prose-open">
        ${parsedMarkdown}
      </div>

      <!-- Collapsible Sources Accordion (Smooth in-place toggle without flickering) -->
      ${hasSources ? `
        <div class="flex flex-col gap-2 pt-0.5 select-none">
          <button 
            type="button"
            onclick="toggleSourcesInPlace('${msg.id}')"
            class="flex items-center gap-1.5 text-[12px] font-normal text-app-textSecondary hover:text-app-textPrimary bg-app-surface hover:bg-app-hover border border-app-borderSubtle px-2.5 py-1 rounded-lg w-fit transition-colors">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-app-textPrimary"></i>
            <span>Sources (${msg.sources.length})</span>
            <i id="sources-chevron-${msg.id}" data-lucide="chevron-down" class="w-3 h-3 text-app-textMuted"></i>
          </button>

          <div id="sources-box-${msg.id}" class="hidden flex items-center gap-2 flex-wrap pl-1 animate-fade-in pt-1">
            ${msg.sources.map(src => `
              <div class="flex items-center gap-1.5 bg-app-input border border-app-borderSubtle px-3 py-1.5 rounded-lg text-app-textPrimary font-normal text-[12.5px] hover:border-app-borderActive transition-colors cursor-pointer">
                <i data-lucide="file" class="w-3.5 h-3.5 text-app-textPrimary"></i>
                <span>${src}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Suggestions Row (Title Case, spacious comfortable buttons) -->
      ${hasSuggestions ? `
        <div class="flex flex-col gap-2 pt-1.5 select-none">
          <span class="text-[12px] text-app-textSecondary font-normal">Suggestions:</span>
          <div class="flex items-center gap-2 flex-wrap">
            ${msg.suggestions.map(sug => `
              <button 
                onclick="sendChatSuggestion('${escapeHtml(sug)}')"
                class="text-[12.5px] bg-app-surface hover:bg-app-elevated border border-app-borderSubtle text-app-textPrimary font-normal px-4 py-1.5 rounded-xl transition-all hover:border-app-borderMed">
                ${sug}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Bottom message utility actions (Copy, Good Response, Bad Response) -->
      <div class="flex items-center justify-end gap-3 pt-1 text-app-textMuted select-none">
        <button onclick="navigator.clipboard.writeText('${escapeHtml(msg.content)}'); showToast('Copied to clipboard')" class="p-1 hover:text-app-textPrimary transition-colors" title="Copy output">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="showToast('Thank you for the positive feedback!')" class="p-1 hover:text-app-textPrimary transition-colors" title="Good response">
          <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
        </button>
        <button onclick="showToast('Feedback noted. We will improve.')" class="p-1 hover:text-app-textPrimary transition-colors" title="Bad response">
          <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
        </button>
      </div>

    </div>
  `;
}

function autoGrowTextarea(element) {
  element.style.height = 'auto';
  element.style.height = (element.scrollHeight) + 'px';
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChatSend();
  }
}

function sendChatSuggestion(text) {
  const input = document.getElementById('chat-textarea-input');
  if (input) input.value = text;
  handleChatSend();
}

function handleChatSend() {
  if (isStreamingActive) return;
  const input = document.getElementById('chat-textarea-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';
  input.style.height = 'auto';

  let convId = appStore.state.activeConversationId;
  if (!convId) {
    convId = appStore.createConversation(text, '');
  }

  const userMsg = { id: 'm-' + Date.now(), role: 'user', content: text };
  appStore.addMessage(convId, userMsg);
  triggerConversationStreaming(convId, text);
}

// Smooth 60fps streaming without tab freezing
function triggerConversationStreaming(convId, userPrompt) {
  isStreamingActive = true;
  const container = document.getElementById('chat-messages-container');
  const liveBubble = document.getElementById('live-streaming-bubble');

  if (!container || !liveBubble) return;

  const startTime = Date.now();
  liveBubble.classList.remove('hidden');
  
  liveBubble.innerHTML = `
    <div class="flex flex-col gap-2 text-[12.5px] text-app-textMuted font-normal">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-app-accent animate-ping"></span>
        <span id="live-thinking-timer">Reasoning... (0.5s)</span>
      </div>
      <div class="w-1/2 h-2 bg-app-input rounded skeleton-shimmer"></div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;

  const timerId = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const label = document.getElementById('live-thinking-timer');
    if (label) {
      label.innerText = `Reasoning... (${elapsed}s)`;
    }
  }, 200);

  const apiKey = localStorage.getItem('collab_groq_key') || '';

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userPrompt, apiKey: apiKey })
  }).then(async response => {
    clearInterval(timerId);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let sources = ['Aster Architecture Docs', 'API Schema Reference'];
    let suggestions = ['Show error handling flow', 'Add rate limiting configuration', 'Detail deployment steps'];
    let accumulatedContent = '';
    let renderScheduled = false;

    function scheduleRender() {
      if (renderScheduled) return;
      renderScheduled = true;
      requestAnimationFrame(() => {
        renderScheduled = false;
        const cleanText = accumulatedContent.replace(/\n---+\n/g, '\n\n');
        liveBubble.innerHTML = `
          <div class="prose-open">
            ${marked.parse(cleanText)}
          </div>
        `;
        container.scrollTop = container.scrollHeight;
      });
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      const events = raw.split('\n\n');

      for (const ev of events) {
        if (!ev.trim()) continue;
        const lines = ev.split('\n');
        let eventType = 'message';
        let eventData = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            eventData = line.replace('data: ', '').trim();
          }
        }

        if (eventType === 'pipeline' && eventData) {
          try {
            const pData = JSON.parse(eventData);
            if (pData.sources) sources = pData.sources;
            if (pData.suggestions) suggestions = pData.suggestions;
          } catch(e) {}
        } else if (eventType === 'token' && eventData) {
          try {
            const tData = JSON.parse(eventData);
            accumulatedContent += tData.token || '';
            scheduleRender();
          } catch(e) {}
        }
      }
    }

    isStreamingActive = false;
    liveBubble.classList.add('hidden');
    liveBubble.innerHTML = '';

    const assistantMsg = {
      id: 'm-' + Date.now(),
      role: 'assistant',
      content: accumulatedContent,
      pipeline: [],
      sources: sources,
      suggestions: suggestions
    };

    appStore.addMessage(convId, assistantMsg);

  }).catch(err => {
    clearInterval(timerId);
    isStreamingActive = false;
    liveBubble.classList.add('hidden');
    showToast('AI response error: ' + err.message, 'error');
  });
}

function escapeHtml(string) {
  const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}