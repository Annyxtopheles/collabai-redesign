// Projects Workspace Screen - Theme-Aware Tokens & Functional List/Grid view toggle
function renderProjectsView(state) {
  const projects = state.projects || [];
  const viewMode = state.projectViewMode || 'list';

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-transparent select-none">
      ${renderHeaderBreadcrumb('Projects')}

      <div class="p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">Projects</h1>
            <p class="text-[13.5px] text-app-textSecondary">A project is a workspace for organizing related files, instructions, and conversations</p>
          </div>
          <button 
            onclick="showCreateProjectModal()"
            class="btn-primary text-[13px] px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Project</span>
          </button>
        </div>

        <!-- Search Bar & Functional List/Grid Toggles -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search projects..." 
              id="projects-search-input"
              oninput="filterProjectsSearch(this.value)"
              class="w-full bg-app-surface border border-app-borderSubtle text-app-textPrimary placeholder-app-textMuted text-[13.5px] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-app-borderActive transition-colors font-normal"
            />
          </div>
          <div class="flex items-center gap-1 bg-app-surface p-1 rounded-xl border border-app-borderSubtle">
            <button 
              onclick="appStore.setProjectViewMode('grid')" 
              title="Grid view"
              class="p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-app-hover text-app-textPrimary' : 'text-app-textMuted hover:text-app-textPrimary'}">
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
            </button>
            <button 
              onclick="appStore.setProjectViewMode('list')" 
              title="List view"
              class="p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-app-hover text-app-textPrimary' : 'text-app-textMuted hover:text-app-textPrimary'}">
              <i data-lucide="list" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Projects Render Area (Grid or List based on viewMode) -->
        ${viewMode === 'grid' ? `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="projects-container">
            ${projects.map(proj => renderProjectCardGrid(proj)).join('')}
          </div>
        ` : `
          <div class="flex flex-col gap-2.5" id="projects-container">
            ${projects.map(proj => renderProjectRowList(proj)).join('')}
          </div>
        `}

      </div>
    </div>
  `;
}

function renderProjectRowList(proj) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex items-center justify-between hover:border-app-borderMed transition-all cursor-pointer group shadow-sm" onclick="appStore.createConversation('${escapeHtml(proj.name)} Workspace Thread', '')">
      <div class="flex items-center gap-3.5">
        <div class="w-9 h-9 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
          <i data-lucide="${proj.icon || 'box'}" class="w-4 h-4"></i>
        </div>
        <div class="flex flex-col">
          <h3 class="text-[14px] font-medium text-app-textPrimary group-hover:text-app-textPrimary transition-colors">${escapeHtml(proj.name)}</h3>
          <span class="text-[12px] text-app-textMuted">${proj.itemCount || 0} items • ${proj.threadCount || 30} threads • ${proj.instructionCount || 1} instructions • Modified ${proj.modifiedDate}</span>
        </div>
      </div>

      <button class="text-app-textMuted hover:text-app-textPrimary p-1.5 rounded-lg hover:bg-app-hover">
        <i data-lucide="more-horizontal" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}

function renderProjectCardGrid(proj) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-app-borderMed transition-all cursor-pointer group shadow-sm" onclick="appStore.createConversation('${escapeHtml(proj.name)} Workspace Thread', '')">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
            <i data-lucide="${proj.icon || 'box'}" class="w-5 h-5"></i>
          </div>
          <button class="text-app-textMuted hover:text-app-textPrimary p-1 rounded-lg hover:bg-app-hover">
            <i data-lucide="more-horizontal" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-[15px] font-medium text-app-textPrimary group-hover:text-app-textPrimary transition-colors">${escapeHtml(proj.name)}</h3>
          <p class="text-[12px] text-app-textSecondary font-normal">Active project workspace.</p>
        </div>
      </div>
      <div class="flex items-center justify-between pt-3 border-t border-app-borderSubtle text-[11.5px] text-app-textMuted">
        <span>${proj.threadCount || 12} threads</span>
        <span>Modified ${proj.modifiedDate}</span>
      </div>
    </div>
  `;
}

function filterProjectsSearch(query) {
  const container = document.getElementById('projects-container');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const filtered = appStore.state.projects.filter(p => (p.name || '').toLowerCase().includes(q));
  const viewMode = appStore.state.projectViewMode || 'list';

  if (viewMode === 'grid') {
    container.innerHTML = filtered.map(proj => renderProjectCardGrid(proj)).join('');
  } else {
    container.innerHTML = filtered.map(proj => renderProjectRowList(proj)).join('');
  }
  lucide.createIcons();
}

function showCreateProjectModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onclick="closeModal()">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between border-b border-app-borderSubtle pb-3">
          <h2 class="text-[16px] font-semibold text-app-textPrimary">Create New Project</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-app-textPrimary p-1 rounded-lg hover:bg-app-hover">✕</button>
        </div>

        <form onsubmit="handleCreateProjectSubmit(event)" class="flex flex-col gap-4 text-[13px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Project Workspace Name</label>
            <input type="text" id="new-project-name" required placeholder="e.g. Project Delta-9" class="bg-app-input border border-app-borderSubtle text-app-textPrimary rounded-xl px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-app-borderSubtle">
            <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-xl bg-app-input border border-app-borderSubtle text-app-textSecondary hover:text-app-textPrimary">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-1.5 rounded-xl">Create Project</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function handleCreateProjectSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-project-name').value.trim();
  appStore.createProject(name);
  closeModal();
  showToast(`Project "${name}" created!`);
}