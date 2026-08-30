// Knowledge Base Screen matching Screenshot 12
function renderKnowledgeBaseView(state) {
  const folders = state.folders || [];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas">
      ${renderHeaderBreadcrumb('Knowledge Base')}

      <div class="p-10 max-w-[1280px] mx-auto w-full flex flex-col gap-8">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-3">
              <h1 class="text-[28px] font-bold text-white tracking-tight">Knowledge Base</h1>
              <span class="text-[11px] font-semibold bg-app-surface text-app-accent border border-app-borderSubtle px-2.5 py-0.5 rounded-full">Root Directory Connected</span>
            </div>
            <p class="text-[14px] text-app-textSecondary">Connect your cloud storage or upload local files to CollabAI</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              onclick="showAddFilesModal()"
              class="bg-app-surface hover:bg-app-hover border border-app-borderSubtle text-white font-semibold text-[13.5px] px-4 py-2 rounded-lg transition-colors">
              Add Files
            </button>
            <button 
              onclick="showNewFolderModal()"
              class="bg-app-accent hover:bg-app-accentHover text-white font-semibold text-[13.5px] px-5 py-2 rounded-lg transition-colors shadow-sm">
              New Folder
            </button>
          </div>
        </div>

        <!-- Search Bar & Controls -->
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

        <!-- Folders List (Screenshot 12) in #171717 -->
        <div class="flex flex-col gap-2">
          <span class="text-[12.5px] font-bold text-app-textMuted px-1">Folders (${folders.length})</span>
          
          <div class="flex flex-col gap-2">
            ${folders.map(folder => `
              <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-4 flex items-center justify-between hover:border-app-borderMed transition-all cursor-pointer group">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-app-input border border-app-borderSubtle flex items-center justify-center text-app-textSecondary group-hover:text-white">
                    <i data-lucide="folder" class="w-5 h-5"></i>
                  </div>
                  <div class="flex flex-col">
                    <h3 class="text-[14.5px] font-semibold text-white group-hover:text-app-accent transition-colors">${folder.name}</h3>
                    <span class="text-[12px] text-app-textMuted">${folder.items || 0} items • ${folder.size || '0 MB'} • Modified ${folder.modified || 'Today'}</span>
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
    </div>
  `;
}

function showNewFolderModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-white">Create New Folder</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <form onsubmit="handleNewFolderSubmit(event)" class="flex flex-col gap-4 text-[13.5px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Folder Name</label>
            <input type="text" id="new-folder-name" required placeholder="e.g. System_Documentation_v2" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="px-5 py-2 rounded-lg bg-app-accent hover:bg-app-accentHover text-white font-semibold">Create Folder</button>
          </div>
        </form>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function handleNewFolderSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('new-folder-name').value.trim();
  appStore.createFolder(name);
  closeModal();
  showToast(`Folder "${name}" created!`);
}

function showAddFilesModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-white">Upload Knowledge Documents</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-5 h-5"></i></button>
        </div>

        <div class="border-2 border-dashed border-app-borderSubtle hover:border-app-borderActive rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors" onclick="document.getElementById('file-upload-picker').click()">
          <i data-lucide="upload-cloud" class="w-8 h-8 text-white"></i>
          <span class="text-[14px] font-medium text-white">Click to browse or drag files here</span>
          <span class="text-[12px] text-app-textMuted">PDF, DOCX, Markdown, CSV up to 50MB</span>
          <input type="file" id="file-upload-picker" class="hidden" onchange="handleFileUploadSelected(this)" />
        </div>

        <div class="flex items-center justify-end">
          <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Done</button>
        </div>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function handleFileUploadSelected(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    closeModal();
    showToast(`Uploaded "${file.name}" to Knowledge Base.`);
  }
}