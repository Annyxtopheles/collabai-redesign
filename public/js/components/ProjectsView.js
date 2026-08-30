// Projects Workspace Screen - Clean typography & monochrome styling
function renderProjectsView(state) {
  const projects = state.projects || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('Projects')}

      <div class="p-8 max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <h1 class="text-[22px] font-semibold text-white tracking-tight">Projects</h1>
            <p class="text-[13.5px] text-app-textSecondary">A project is a workspace for organizing related files, instructions, and conversations</p>
          </div>
          <button 
            onclick="showCreateProjectModal()"
            class="bg-app-accent hover:bg-app-accentHover text-white font-medium text-[13px] px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Project</span>
          </button>
        </div>

        <!-- Search Bar & List/Grid Toggles -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search..." 
              class="w-full bg-app-surface border border-app-borderSubtle text-white placeholder-app-textMuted text-[13.5px] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-app-borderActive transition-colors"
            />
          </div>
          <div class="flex items-center gap-1 bg-app-surface p-1 rounded-lg border border-app-borderSubtle">
            <button class="p-1.5 bg-app-input text-white rounded"><i data-lucide="layout-grid" class="w-4 h-4"></i></button>
            <button class="p-1.5 text-app-textMuted hover:text-white rounded"><i data-lucide="list" class="w-4 h-4"></i></button>
          </div>
        </div>

        <!-- Projects Rows List with Monochrome Icons -->
        <div class="flex flex-col gap-2.5">
          ${projects.map(proj => `
            <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-4 flex items-center justify-between hover:border-app-borderMed transition-all cursor-pointer group" onclick="appStore.createConversation('${proj.name} Workspace Thread', '')">
              <div class="flex items-center gap-3.5">
                <div class="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
                  <i data-lucide="${proj.icon || 'box'}" class="w-4 h-4 text-white"></i>
                </div>
                <div class="flex flex-col">
                  <h3 class="text-[14.5px] font-medium text-white group-hover:text-app-accent transition-colors">${proj.name}</h3>
                  <span class="text-[12px] text-app-textMuted">${proj.itemCount || 0} items • ${proj.threadCount || 30} threads • ${proj.instructionCount || 1} instructions • Modified ${proj.modifiedDate}</span>
                </div>
              </div>

              <button class="text-app-textMuted hover:text-white p-1.5 rounded hover:bg-app-hover">
                <i data-lucide="more-horizontal" class="w-4 h-4"></i>
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;
}

function showCreateProjectModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-semibold text-white">Create New Project</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="handleCreateProjectSubmit(event)" class="flex flex-col gap-4 text-[13px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Project Workspace Name</label>
            <input type="text" id="new-project-name" required placeholder="e.g. Project Delta-9" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="px-4 py-1.5 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-medium">Create Project</button>
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