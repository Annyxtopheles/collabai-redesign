// ConversationsView.js - Live streaming chat with animated pipeline and real-time markdown
let isStreamingActive = false;

function renderConversationsView(state) {
  const conv = state.conversations.find(c => c.id === state.activeConversationId) || state.conversations[0];
  const messages = conv ? (conv.messages || []) : [];
  const model = conv ? (conv.model || 'claude-sonnet-4-5') : 'claude-sonnet-4-5';

  return `
    <div class="flex-1 flex h-full overflow-hidden bg-app-canvas">
      
      <!-- Secondary Conversation Drawer -->
      ${renderConversationDrawer(state)}

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col h-full min-w-0 bg-app-canvas relative">
        
        <!-- Chat Header -->
        <header class="h-[56px] border-b border-app-borderSubtle px-8 flex items-center justify-between shrink-0 bg-app-canvas select-none">
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h1 class="text-[15px] font-bold text-white tracking-tight">${model}</h1>
            </div>
            <span class="text-[11.5px] text-app-textMuted">Anthropic's flagship creative partner • 200k context</span>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="showApiSettingsModal()" title="API Key Settings (Optional Free Gemini/OpenAI)" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-surface hover:bg-app-hover border border-app-borderSubtle text-[12px] text-white transition-colors">
              <i data-lucide="key" class="w-3.5 h-3.5 text-app-accent"></i>
              <span>API Key</span>
            </button>
            <button class="p-2 text-app-textSecondary hover:text-white rounded-lg hover:bg-app-hover transition-colors">
              <i data-lucide="more-horizontal" class="w-5 h-5"></i>
            </button>
          </div>
        </header>

        <!-- Message Stream Area -->
        <div class="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6" id="chat-messages-container">
          
          <!-- State 1: Empty Conversation State -->
          ${messages.length === 0 ? `
            <div class="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-4 my-auto">
              <div class="w-12 h-12 rounded-2xl bg-app-surface border border-app-borderSubtle flex items-center justify-center text-white">
                <i data-lucide="sparkles" class="w-6 h-6 text-app-accent"></i>
              </div>
              <div class="flex flex-col gap-1">
                <h2 class="text-[20px] font-bold text-white">Start a conversation</h2>
                <p class="text-[13.5px] text-app-textSecondary">Ask a question or start with a suggested prompt below.</p>
              </div>
              <button 
                onclick="sendChatSuggestion('Hello, Resume Man')"
                class="mt-2 text-[13px] bg-app-surface hover:bg-app-elevated text-white font-medium px-4 py-2 rounded-xl border border-app-borderSubtle transition-all shadow-sm">
                "Hello, Resume Man"
              </button>
            </div>
          ` : ''}

          <!-- Render All Past Messages in Thread -->
          ${messages.map(msg => renderChatMessageBubble(msg)).join('')}

          <!-- Live Streaming Message Container -->
          <div id="live-streaming-bubble" class="hidden flex-col gap-3 w-full max-w-3xl"></div>

        </div>

        <!-- Chat Bottom Composer Bar (Screenshot 14) -->
        <div class="p-6 max-w-4xl mx-auto w-full flex flex-col gap-2">
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-3 flex flex-col gap-2.5 shadow-2xl focus-within:border-app-borderActive transition-colors">
            
            <div class="flex items-center gap-3">
              <button class="p-1 text-app-textMuted hover:text-white transition-colors" title="Attach file">
                <i data-lucide="paperclip" class="w-4 h-4"></i>
              </button>
              <button class="p-1 text-app-textMuted hover:text-white transition-colors" title="Tools">
                <i data-lucide="wrench" class="w-4 h-4"></i>
              </button>
              <textarea
                id="chat-textarea-input"
                rows="1"
                placeholder="Enter a prompt..."
                oninput="autoGrowTextarea(this)"
                onkeydown="handleChatKeydown(event)"
                class="flex-1 bg-transparent text-white text-[14.5px] placeholder-app-textMuted focus:outline-none resize-none max-h-32"
              ></textarea>
              <button 
                id="chat-send-button"
                onclick="handleChatSend()"
                class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] px-4 py-1.5 rounded-lg transition-colors shadow-sm">
                Send
              </button>
            </div>

            <!-- Model Selector & Modes in Composer -->
            <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[12px]">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-app-input px-2.5 py-1 rounded-md border border-app-borderSubtle text-app-textSecondary cursor-pointer">
                  <span>${model} · Anthropic</span>
                  <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
                </div>
                <div class="flex items-center gap-1 bg-app-input p-0.5 rounded-md border border-app-borderSubtle">
                  <button class="bg-app-accent text-white px-2 py-0.5 rounded text-[11px] font-semibold">Chat</button>
                  <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px]">Deep Search</button>
                  <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px]">Templates</button>
                </div>
              </div>

              <button class="text-app-textMuted hover:text-white p-1">
                <i data-lucide="mic" class="w-3.5 h-3.5"></i>
              </button>
            </div>

          </div>

          <span class="text-[11px] text-center text-app-textMuted">AI can make mistakes. Verify important information.</span>
        </div>

      </main>
    </div>
  `;
}

function renderChatMessageBubble(msg) {
  if (msg.role === 'user') {
    return `
      <div class="flex justify-end w-full">
        <div class="max-w-[70%] bg-app-surface border border-app-borderSubtle text-white rounded-2xl px-5 py-3 text-[14.5px] leading-relaxed shadow-sm">
          ${escapeHtml(msg.content)}
        </div>
      </div>
    `;
  }

  const parsedMarkdown = marked.parse(msg.content || '');

  return `
    <div class="flex flex-col gap-3 w-full max-w-3xl">
      
      <!-- Multi-Agent Pipeline Visualization (Screenshots 8 & 11) -->
      ${msg.pipeline && msg.pipeline.length > 0 ? `
        <div class="flex items-center gap-2 bg-app-surface border border-app-borderSubtle rounded-xl px-4 py-2 w-fit">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-[13px] font-semibold text-white">${msg.pipeline[0]}</span>
          </div>
          <span class="text-app-textMuted text-xs">➔</span>
          <div class="flex items-center gap-2">
            <i data-lucide="folder" class="w-3.5 h-3.5 text-app-textSecondary"></i>
            <span class="text-[13px] font-semibold text-white">${msg.pipeline[1] || 'Knowledge Base'}</span>
          </div>
          <span class="text-app-textMuted text-xs">➔</span>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
            <span class="text-[13px] font-semibold text-white">${msg.pipeline[2] || 'Reasoning Advisor'}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></span>
          </div>
        </div>
      ` : ''}

      <!-- Response Content Box -->
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 text-[14.5px] text-app-textSecondary shadow-lg prose-custom">
        ${parsedMarkdown}
      </div>

      <!-- Sources Row -->
      ${msg.sources && msg.sources.length > 0 ? `
        <div class="flex items-center gap-2 text-[12px] text-app-textMuted pt-1 flex-wrap">
          <span class="font-bold uppercase tracking-wider text-[10.5px]">SOURCES</span>
          ${msg.sources.map(src => `
            <div class="flex items-center gap-1.5 bg-app-input border border-app-borderSubtle px-2.5 py-1 rounded-md text-app-textSecondary hover:text-white cursor-pointer transition-colors">
              <i data-lucide="folder" class="w-3 h-3 text-app-textMuted"></i>
              <span>${src}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Follow-up Suggestion Action Chips -->
      ${msg.suggestions && msg.suggestions.length > 0 ? `
        <div class="flex items-center gap-2 pt-2 flex-wrap">
          ${msg.suggestions.map(sug => `
            <button 
              onclick="sendChatSuggestion('${escapeHtml(sug)}')"
              class="text-[12.5px] bg-app-surface hover:bg-app-elevated border border-app-borderSubtle text-app-textSecondary hover:text-white px-3.5 py-1.5 rounded-full transition-colors">
              ${sug}
            </button>
          `).join('')}
        </div>
      ` : ''}

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

  // 1. Add user message
  const userMsg = { id: 'm-' + Date.now(), role: 'user', content: text };
  appStore.addMessage(convId, userMsg);

  // 2. Start streaming response
  triggerConversationStreaming(convId, text);
}

function triggerConversationStreaming(convId, userPrompt) {
  isStreamingActive = true;
  const container = document.getElementById('chat-messages-container');
  const liveBubble = document.getElementById('live-streaming-bubble');

  if (!container || !liveBubble) return;

  // Step 1: Render Thinking State banner immediately (Screenshot 6)
  liveBubble.classList.remove('hidden');
  liveBubble.innerHTML = `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 flex flex-col gap-3 shadow-lg">
      <div class="flex items-center gap-2 text-[13.5px] font-semibold text-app-textSecondary">
        <span>Reasoning Advisor is thinking...</span>
      </div>
      <div class="w-3/4 h-2.5 bg-app-input rounded skeleton-shimmer"></div>
      <div class="w-1/2 h-2.5 bg-app-input rounded skeleton-shimmer"></div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;

  const apiKey = localStorage.getItem('collab_gemini_key') || '';

  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userPrompt, apiKey: apiKey })
  }).then(async response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let pipeline = ['Aster Architect', 'Knowledge Base', 'Reasoning Advisor'];
    let sources = ['Aster Architecture Docs', 'API Schema Reference'];
    let suggestions = ['Show error handling flow', 'Add rate limiting configuration', 'Detail deployment steps'];
    let accumulatedContent = '';

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
            if (pData.pipeline) pipeline = pData.pipeline;
            if (pData.sources) sources = pData.sources;
            if (pData.suggestions) suggestions = pData.suggestions;
          } catch(e) {}
        } else if (eventType === 'token' && eventData) {
          try {
            const tData = JSON.parse(eventData);
            accumulatedContent += tData.token || '';
            
            // Live update the bubble in real time
            liveBubble.innerHTML = `
              <div class="flex items-center gap-2 bg-app-surface border border-app-borderSubtle rounded-xl px-4 py-2 w-fit">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span class="text-[13px] font-semibold text-white">${pipeline[0]}</span>
                </div>
                <span class="text-app-textMuted text-xs">➔</span>
                <div class="flex items-center gap-2">
                  <i data-lucide="folder" class="w-3.5 h-3.5 text-app-textSecondary"></i>
                  <span class="text-[13px] font-semibold text-white">${pipeline[1] || 'Knowledge Base'}</span>
                </div>
                <span class="text-app-textMuted text-xs">➔</span>
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                  <span class="text-[13px] font-semibold text-white">${pipeline[2] || 'Reasoning Advisor'}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></span>
                </div>
              </div>

              <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 text-[14.5px] text-app-textSecondary shadow-lg prose-custom">
                ${marked.parse(accumulatedContent)}
              </div>
            `;
            lucide.createIcons();
            container.scrollTop = container.scrollHeight;
          } catch(e) {}
        }
      }
    }

    // Finished streaming: persist assistant message to state
    isStreamingActive = false;
    liveBubble.classList.add('hidden');
    liveBubble.innerHTML = '';

    const assistantMsg = {
      id: 'm-' + Date.now(),
      role: 'assistant',
      content: accumulatedContent,
      pipeline: pipeline,
      sources: sources,
      suggestions: suggestions
    };

    appStore.addMessage(convId, assistantMsg);

  }).catch(err => {
    isStreamingActive = false;
    liveBubble.classList.add('hidden');
    showToast('AI response error: ' + err.message, 'error');
  });
}

function showApiSettingsModal() {
  const currentKey = localStorage.getItem('collab_gemini_key') || '';
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="key" class="w-5 h-5 text-app-accent"></i>
            <h2 class="text-[17px] font-bold text-white">AI Model Provider Key</h2>
          </div>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <p class="text-[13px] text-app-textSecondary leading-relaxed">
          The app includes built-in high-fidelity AI simulation by default. To connect a <strong>100% Free live Google Gemini API key</strong> (from <a href="https://aistudio.google.com" target="_blank" class="text-app-accent underline">aistudio.google.com</a>), paste it below:
        </p>

        <div class="flex flex-col gap-1.5">
          <label class="text-[12.5px] font-medium text-white">Google Gemini API Key (Free tier)</label>
          <input 
            type="password" 
            id="api-key-input"
            value="${currentKey}" 
            placeholder="AIzaSy..." 
            class="bg-app-input border border-app-borderSubtle text-white text-[13.5px] rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive"
          />
        </div>

        <div class="flex items-center justify-between pt-2">
          <button onclick="clearApiKey()" class="text-[12.5px] text-red-400 hover:underline">Clear Key (Use Built-in)</button>
          <div class="flex items-center gap-2">
            <button onclick="closeModal()" class="px-4 py-2 rounded-lg bg-app-input text-app-textSecondary hover:text-white text-[13px]">Cancel</button>
            <button onclick="saveApiKey()" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13px]">Save Key</button>
          </div>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  if (val) {
    localStorage.setItem('collab_gemini_key', val);
    showToast('Gemini API key saved! Live responses enabled.');
  } else {
    localStorage.removeItem('collab_gemini_key');
    showToast('Using built-in high-fidelity AI engine.');
  }
  closeModal();
}

function clearApiKey() {
  localStorage.removeItem('collab_gemini_key');
  showToast('API key removed. Using built-in engine.');
  closeModal();
}

function escapeHtml(string) {
  const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}