// Projects Workspace Screen matching Screenshot 13
function renderProjectsView(state) {
  const projects = state.projects || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('Projects')}

      <div class="p-10 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <h1 class="text-[28px] font-bold text-white tracking-tight">Projects</h1>
            <p class="text-[14px] text-app-textSecondary">A project is a workspace for organizing related files, instructions, and conversations</p>
          </div>
          <button 
            onclick="showCreateProjectModal()"
            class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] px-5 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>New Project</span>
          </button>
        </div>

        <!-- Search Bar & List/Grid Toggles -->
        <div class="flex items-center gap-4">
          <div class="relative flex-1 flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search..." 
              class="w-full bg-app-surface border border-app-borderSubtle text-white placeholder-app-textMuted text-[14px] rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-app-borderActive transition-colors"
            />
          </div>
          <div class="flex items-center gap-1 bg-app-surface p-1 rounded-lg border border-app-borderSubtle">
            <button class="p-1.5 bg-app-input text-white rounded"><i data-lucide="layout-grid" class="w-4 h-4"></i></button>
            <button class="p-1.5 text-app-textMuted hover:text-white rounded"><i data-lucide="list" class="w-4 h-4"></i></button>
          </div>
        </div>

        <!-- Projects Rows List (Screenshot 13) in #171717 -->
        <div class="flex flex-col gap-3">
          ${projects.map(proj => `
            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex items-center justify-between hover:border-app-borderMed transition-all cursor-pointer group" onclick="appStore.createConversation('${proj.name} Workspace Thread', '')">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-white" style="background-color: ${proj.color}25; border: 1px solid ${proj.color}50">
                  <i data-lucide="${proj.icon || 'box'}" class="w-5 h-5" style="color: ${proj.color}"></i>
                </div>
                <div class="flex flex-col">
                  <h3 class="text-[15.5px] font-bold text-white group-hover:text-app-accent transition-colors">${proj.name}</h3>
                  <span class="text-[12.5px] text-app-textMuted">${proj.itemCount || 0} items • ${proj.threadCount || 30} threads • ${proj.instructionCount || 1} instructions • Modified ${proj.modifiedDate}</span>
                </div>
              </div>

              <button class="text-app-textMuted hover:text-white p-2 rounded hover:bg-app-hover">
                <i data-lucide="more-horizontal" class="w-5 h-5"></i>
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
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-white">Create New Project</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="handleCreateProjectSubmit(event)" class="flex flex-col gap-4 text-[13.5px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Project Workspace Name</label>
            <input type="text" id="new-project-name" required placeholder="e.g. Project Delta-9" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-semibold">Create Project</button>
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