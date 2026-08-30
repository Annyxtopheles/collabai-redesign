// ConversationsView.js - Clean header with conversation title only, no 3 dots / api key button in header
let isStreamingActive = false;

function renderConversationsView(state) {
  const conv = state.conversations.find(c => c.id === state.activeConversationId) || state.conversations[0];
  const messages = conv ? (conv.messages || []) : [];
  const model = conv ? (conv.model || 'claude-sonnet-4-5') : 'claude-sonnet-4-5';
  const convTitle = conv ? (conv.title || 'New Conversation') : 'New Conversation';

  return `
    <div class="flex-1 flex h-full overflow-hidden bg-app-canvas">
      
      <!-- Secondary Conversation Drawer -->
      ${renderConversationDrawer(state)}

      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col h-full min-w-0 bg-app-canvas relative">
        
        <!-- Clean Minimal Chat Header (Conversation name only on top-left) -->
        <header class="h-[48px] border-b border-app-borderSubtle px-6 flex items-center justify-between shrink-0 bg-app-canvas select-none">
          <div class="flex items-center gap-2 min-w-0">
            <h1 class="text-[14px] font-normal text-white truncate">${convTitle}</h1>
          </div>
          <!-- Completely clean right side, no 3-dots, no extra clutter -->
          <div></div>
        </header>

        <!-- Message Stream Area -->
        <div class="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5" id="chat-messages-container">
          
          <!-- State 1: Empty Conversation State -->
          ${messages.length === 0 ? `
            <div class="flex-1 flex flex-col items-center justify-center text-center max-w-lg mx-auto gap-3.5 my-auto">
              <div class="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
                <i data-lucide="sparkles" class="w-5 h-5 text-white"></i>
              </div>
              <div class="flex flex-col gap-0.5">
                <h2 class="text-[17px] font-normal text-white">Start a conversation</h2>
                <p class="text-[13px] text-app-textSecondary font-normal">Ask a question or start with a suggested prompt below.</p>
              </div>
              <button 
                onclick="sendChatSuggestion('Hello, Resume Man')"
                class="mt-1 text-[12.5px] bg-app-surface hover:bg-app-hover text-white font-normal px-3.5 py-1.5 rounded-lg border border-app-borderSubtle transition-all">
                "Hello, Resume Man"
              </button>
            </div>
          ` : ''}

          <!-- Render All Past Messages in Thread -->
          ${messages.map(msg => renderChatMessageBubble(msg)).join('')}

          <!-- Live Streaming Message Container with clean animation -->
          <div id="live-streaming-bubble" class="hidden flex-col gap-3 w-full max-w-3xl panel-transition"></div>

        </div>

        <!-- Chat Bottom Composer Bar (Screenshot 14) -->
        <div class="p-5 max-w-3xl mx-auto w-full flex flex-col gap-1.5">
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-2.5 flex flex-col gap-2 shadow-xl focus-within:border-app-borderActive transition-colors">
            
            <div class="flex items-center gap-2.5">
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
                class="flex-1 bg-transparent text-white text-[13.5px] font-normal placeholder-app-textMuted focus:outline-none resize-none max-h-28"
              ></textarea>
              <button 
                id="chat-send-button"
                onclick="handleChatSend()"
                class="bg-app-accent hover:bg-app-accentHover text-white font-medium text-[12.5px] px-3.5 py-1.5 rounded-lg transition-colors shadow-sm">
                Send
              </button>
            </div>

            <!-- Model Selector & Modes in Composer -->
            <div class="flex items-center justify-between pt-1.5 border-t border-app-borderSubtle text-[11.5px]">
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-app-input px-2 py-0.5 rounded border border-app-borderSubtle text-app-textSecondary cursor-pointer">
                  <span class="font-normal">${model} · Anthropic</span>
                  <i data-lucide="chevron-down" class="w-3 h-3"></i>
                </div>
                <div class="flex items-center gap-0.5 bg-app-input p-0.5 rounded border border-app-borderSubtle">
                  <button class="bg-app-accent text-white px-2 py-0.5 rounded text-[11px] font-medium">Chat</button>
                  <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px] font-normal">Deep Search</button>
                  <button class="text-app-textMuted hover:text-white px-2 py-0.5 text-[11px] font-normal">Templates</button>
                </div>
              </div>

              <button class="text-app-textMuted hover:text-white p-1">
                <i data-lucide="mic" class="w-3.5 h-3.5"></i>
              </button>
            </div>

          </div>

          <span class="text-[11px] text-center text-app-textMuted font-normal">AI can make mistakes. Verify important information.</span>
        </div>

      </main>
    </div>
  `;
}

function renderChatMessageBubble(msg) {
  if (msg.role === 'user') {
    return `
      <div class="flex justify-end w-full">
        <div class="max-w-[70%] bg-app-surface border border-app-borderSubtle text-white rounded-xl px-4 py-2.5 text-[13.5px] font-normal leading-relaxed">
          ${escapeHtml(msg.content)}
        </div>
      </div>
    `;
  }

  const parsedMarkdown = marked.parse(msg.content || '');

  return `
    <div class="flex flex-col gap-2.5 w-full max-w-3xl">
      
      <!-- Multi-Agent Pipeline Visualization -->
      ${msg.pipeline && msg.pipeline.length > 0 ? `
        <div class="flex items-center gap-2 bg-app-surface border border-app-borderSubtle rounded-lg px-3 py-1.5 w-fit text-[12px] font-normal">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-white font-normal">${msg.pipeline[0]}</span>
          </div>
          <span class="text-app-textMuted text-xs">➔</span>
          <div class="flex items-center gap-1.5">
            <i data-lucide="folder" class="w-3 h-3 text-app-textSecondary"></i>
            <span class="text-white font-normal">${msg.pipeline[1] || 'Knowledge Base'}</span>
          </div>
          <span class="text-app-textMuted text-xs">➔</span>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <span class="text-white font-normal">${msg.pipeline[2] || 'Reasoning Advisor'}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></span>
          </div>
        </div>
      ` : ''}

      <!-- Response Content Box -->
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 text-[13.5px] text-app-textSecondary prose-custom">
        ${parsedMarkdown}
      </div>

      <!-- Sources Row -->
      ${msg.sources && msg.sources.length > 0 ? `
        <div class="flex items-center gap-1.5 text-[11.5px] text-app-textMuted pt-0.5 flex-wrap">
          <span class="font-medium uppercase tracking-wider text-[10px]">SOURCES</span>
          ${msg.sources.map(src => `
            <div class="flex items-center gap-1 bg-app-input border border-app-borderSubtle px-2 py-0.5 rounded text-app-textSecondary hover:text-white cursor-pointer transition-colors font-normal">
              <i data-lucide="folder" class="w-3 h-3 text-app-textMuted"></i>
              <span>${src}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Follow-up Suggestion Action Chips -->
      ${msg.suggestions && msg.suggestions.length > 0 ? `
        <div class="flex items-center gap-1.5 pt-1 flex-wrap">
          ${msg.suggestions.map(sug => `
            <button 
              onclick="sendChatSuggestion('${escapeHtml(sug)}')"
              class="text-[12px] bg-app-surface hover:bg-app-hover border border-app-borderSubtle text-app-textSecondary hover:text-white px-3 py-1 rounded-full transition-colors font-normal">
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

  const userMsg = { id: 'm-' + Date.now(), role: 'user', content: text };
  appStore.addMessage(convId, userMsg);
  triggerConversationStreaming(convId, text);
}

function triggerConversationStreaming(convId, userPrompt) {
  isStreamingActive = true;
  const container = document.getElementById('chat-messages-container');
  const liveBubble = document.getElementById('live-streaming-bubble');

  if (!container || !liveBubble) return;

  liveBubble.classList.remove('hidden');
  liveBubble.innerHTML = `
    <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-2.5">
      <div class="flex items-center gap-2 text-[13px] font-normal text-app-textSecondary">
        <span>Reasoning Advisor is thinking...</span>
      </div>
      <div class="w-3/4 h-2 bg-app-input rounded skeleton-shimmer"></div>
      <div class="w-1/2 h-2 bg-app-input rounded skeleton-shimmer"></div>
    </div>
  `;
  container.scrollTop = container.scrollHeight;

  const apiKey = localStorage.getItem('collab_gemini_key') || localStorage.getItem('collab_groq_key') || '';

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
            
            liveBubble.innerHTML = `
              <div class="flex items-center gap-2 bg-app-surface border border-app-borderSubtle rounded-lg px-3 py-1.5 w-fit text-[12px] font-normal">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span class="text-white font-normal">${pipeline[0]}</span>
                </div>
                <span class="text-app-textMuted text-xs">➔</span>
                <div class="flex items-center gap-1.5">
                  <i data-lucide="folder" class="w-3 h-3 text-app-textSecondary"></i>
                  <span class="text-white font-normal">${pipeline[1] || 'Knowledge Base'}</span>
                </div>
                <span class="text-app-textMuted text-xs">➔</span>
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span class="text-white font-normal">${pipeline[2] || 'Reasoning Advisor'}</span>
                  <span class="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse"></span>
                </div>
              </div>

              <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 text-[13.5px] text-app-textSecondary prose-custom">
                ${marked.parse(accumulatedContent)}
              </div>
            `;
            lucide.createIcons();
            container.scrollTop = container.scrollHeight;
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

function escapeHtml(string) {
  const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}