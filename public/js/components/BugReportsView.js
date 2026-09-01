// Bug Reports Screen - Theme-Aware Tokens
let activeBugTab = 'submit';

function renderBugReportsView(state) {
  const bugs = state.bugs || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-transparent select-none">
      ${renderHeaderBreadcrumb('Bug Reports')}

      <div class="p-8 max-w-[850px] mx-auto w-full flex flex-col gap-5">
        
        <!-- Header -->
        <div class="flex flex-col gap-0.5">
          <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">Bug Reports</h1>
          <p class="text-[13.5px] text-app-textSecondary">Submit and track bug reports for CollabAI</p>
        </div>

        <!-- Sub Tabs (Submit Bug / My Issues) -->
        <div class="flex items-center gap-6 border-b border-app-borderSubtle text-[13.5px]">
          <button 
            onclick="setBugTab('submit')"
            class="pb-2.5 font-medium transition-colors border-b-2 ${activeBugTab === 'submit' ? 'border-app-textPrimary text-app-textPrimary' : 'border-transparent text-app-textSecondary hover:text-app-textPrimary'}">
            Submit Bug
          </button>
          <button 
            onclick="setBugTab('issues')"
            class="pb-2.5 font-medium transition-colors border-b-2 ${activeBugTab === 'issues' ? 'border-app-textPrimary text-app-textPrimary' : 'border-transparent text-app-textSecondary hover:text-app-textPrimary'}">
            My Issues (${bugs.length})
          </button>
        </div>

        ${activeBugTab === 'submit' ? `
          <!-- Bug Report Form Card -->
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 shadow-sm flex flex-col gap-5">
            <div class="flex flex-col gap-0.5">
              <h2 class="text-[15.5px] font-medium text-app-textPrimary">Bug Report Form</h2>
              <p class="text-[12.5px] text-app-textMuted">Provide as much detail as possible to help us resolve the issue.</p>
            </div>

            <form onsubmit="handleBugSubmit(event)" class="flex flex-col gap-4 text-[13px]">
              
              <!-- Title Field -->
              <div class="flex flex-col gap-1">
                <label class="font-normal text-app-textPrimary flex items-center gap-1">
                  <span>Title</span>
                  <span class="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="bug-title"
                  required
                  maxlength="255"
                  oninput="updateCharCount('bug-title-count', this.value.length, 255)"
                  placeholder="Brief description of the issue"
                  class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors"
                />
                <span id="bug-title-count" class="text-[11px] text-app-textMuted text-right font-normal">0/255 characters</span>
              </div>

              <!-- Description Field -->
              <div class="flex flex-col gap-1">
                <label class="font-normal text-app-textPrimary">Description</label>
                <textarea 
                  id="bug-desc"
                  required
                  rows="4"
                  maxlength="5000"
                  oninput="updateCharCount('bug-desc-count', this.value.length, 5000)"
                  placeholder="Provide detailed information..."
                  class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors resize-none"
                ></textarea>
                <span id="bug-desc-count" class="text-[11px] text-app-textMuted text-right font-normal">0/5000 characters (Markdown supported)</span>
              </div>

              <!-- Priority & Category Dropdowns -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="font-normal text-app-textPrimary">Priority</label>
                  <select id="bug-priority" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3 py-2.5 focus:outline-none focus:border-app-borderActive font-normal">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-normal text-app-textPrimary">Category</label>
                  <select id="bug-category" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3 py-2.5 focus:outline-none focus:border-app-borderActive font-normal">
                    <option value="UI/UX" selected>UI/UX</option>
                    <option value="Backend">Backend</option>
                    <option value="Performance">Performance</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Agent Workflow">Agent Workflow</option>
                  </select>
                </div>
              </div>

              <!-- Submit Action Button -->
              <button 
                type="submit" 
                class="w-full btn-primary text-[13.5px] py-2.5 rounded-xl transition-all shadow-md mt-1">
                Submit Bug Report
              </button>

            </form>
          </div>
        ` : `
          <!-- My Issues List -->
          <div class="flex flex-col gap-2.5">
            ${bugs.map(bug => `
              <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-2">
                    <h3 class="text-[14px] font-medium text-app-textPrimary">${escapeHtml(bug.title)}</h3>
                    <span class="text-[10.5px] font-normal px-2 py-0.5 rounded bg-app-input text-app-textSecondary border border-app-borderSubtle">${bug.category}</span>
                  </div>
                  <p class="text-[12.5px] text-app-textSecondary font-normal">${escapeHtml(bug.description)}</p>
                </div>
                <div class="flex flex-col items-end gap-0.5 shrink-0">
                  <span class="text-[11px] font-normal px-2 py-0.5 rounded bg-app-hover text-app-textPrimary border border-app-borderSubtle">${bug.priority} Priority</span>
                  <span class="text-[11px] text-app-textMuted">${new Date(bug.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `}

      </div>
    </div>
  `;
}

function setBugTab(tab) {
  activeBugTab = tab;
  renderApp();
}

function updateCharCount(id, current, max) {
  const el = document.getElementById(id);
  if (el) {
    el.innerText = `${current}/${max} characters` + (max === 5000 ? ' (Markdown supported)' : '');
  }
}

function handleBugSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('bug-title').value.trim();
  const desc = document.getElementById('bug-desc').value.trim();
  const priority = document.getElementById('bug-priority').value;
  const category = document.getElementById('bug-category').value;

  appStore.submitBug({
    title,
    description: desc,
    priority,
    category
  });

  activeBugTab = 'issues';
  renderApp();
  showToast('Bug report submitted successfully!');
}