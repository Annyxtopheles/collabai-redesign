// Bug Reports Screen matching Screenshot 1
let activeBugTab = 'submit';

function renderBugReportsView(state) {
  const bugs = state.bugs || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('Bug Reports')}

      <div class="p-10 max-w-[900px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header -->
        <div class="flex flex-col gap-1">
          <h1 class="text-[28px] font-bold text-white tracking-tight">Bug Reports</h1>
          <p class="text-[14px] text-app-textSecondary">Submit and track bug reports for CollabAI</p>
        </div>

        <!-- Sub Tabs (Submit Bug / My Issues) with blue active underline indicator -->
        <div class="flex items-center gap-6 border-b border-app-borderSubtle text-[14px]">
          <button 
            onclick="setBugTab('submit')"
            class="pb-3 font-semibold transition-colors border-b-2 ${activeBugTab === 'submit' ? 'border-app-accent text-white' : 'border-transparent text-app-textSecondary hover:text-white'}">
            Submit Bug
          </button>
          <button 
            onclick="setBugTab('issues')"
            class="pb-3 font-semibold transition-colors border-b-2 ${activeBugTab === 'issues' ? 'border-app-accent text-white' : 'border-transparent text-app-textSecondary hover:text-white'}">
            My Issues (${bugs.length})
          </button>
        </div>

        ${activeBugTab === 'submit' ? `
          <!-- Bug Report Form Card (Screenshot 1) in brand #171717 -->
          <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-8 shadow-2xl flex flex-col gap-6">
            <div class="flex flex-col gap-1">
              <h2 class="text-[18px] font-bold text-white">Bug Report Form</h2>
              <p class="text-[13.5px] text-app-textMuted">Provide as much detail as possible to help us resolve the issue.</p>
            </div>

            <form onsubmit="handleBugSubmit(event)" class="flex flex-col gap-5 text-[13.5px]">
              
              <!-- Title Field with 255 Character Counter -->
              <div class="flex flex-col gap-1.5">
                <label class="font-medium text-white flex items-center gap-1">
                  <span>Title</span>
                  <span class="text-app-accent">*</span>
                </label>
                <input 
                  type="text" 
                  id="bug-title"
                  required
                  maxlength="255"
                  oninput="updateCharCount('bug-title-count', this.value.length, 255)"
                  placeholder="Brief description of the issue"
                  class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors"
                />
                <span id="bug-title-count" class="text-[11px] text-app-textMuted text-right">0/255 characters</span>
              </div>

              <!-- Description Field with 5000 Character Counter -->
              <div class="flex flex-col gap-1.5">
                <label class="font-medium text-white">Description</label>
                <textarea 
                  id="bug-desc"
                  required
                  rows="4"
                  maxlength="5000"
                  oninput="updateCharCount('bug-desc-count', this.value.length, 5000)"
                  placeholder="Provide detailed information..."
                  class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors resize-none"
                ></textarea>
                <span id="bug-desc-count" class="text-[11px] text-app-textMuted text-right">0/5000 characters (Markdown supported)</span>
              </div>

              <!-- Priority & Category Dropdowns -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="font-medium text-white">Priority</label>
                  <select id="bug-priority" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive">
                    <option value="Low">Low</option>
                    <option value="Medium" selected>Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1.5">
                  <label class="font-medium text-white">Category</label>
                  <select id="bug-category" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-app-borderActive">
                    <option value="UI/UX" selected>UI/UX</option>
                    <option value="Backend">Backend</option>
                    <option value="Performance">Performance</option>
                    <option value="Authentication">Authentication</option>
                    <option value="Agent Workflow">Agent Workflow</option>
                  </select>
                </div>
              </div>

              <!-- Submit Action Button in Brand Blue -->
              <button 
                type="submit" 
                class="w-full bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[14.5px] py-3 rounded-xl transition-all shadow-lg mt-2">
                Submit Bug Report
              </button>

            </form>
          </div>
        ` : `
          <!-- My Issues List -->
          <div class="flex flex-col gap-3">
            ${bugs.map(bug => `
              <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex items-center justify-between">
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-[15px] font-bold text-white">${bug.title}</h3>
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-app-input text-app-accent border border-app-borderSubtle">${bug.category}</span>
                  </div>
                  <p class="text-[13px] text-app-textSecondary">${bug.description}</p>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded ${bug.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}">${bug.priority} Priority</span>
                  <span class="text-[11.5px] text-app-textMuted">${new Date(bug.createdAt).toLocaleDateString()}</span>
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
  showToast('Bug report submitted successfully! Thank you.');
}