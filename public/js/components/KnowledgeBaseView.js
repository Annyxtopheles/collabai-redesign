// Knowledge Base Screen - Functional List/Grid view toggle and ivory palette
function renderKnowledgeBaseView(state) {
  const folders = state.folders || [];
  const viewMode = state.knowledgeViewMode || 'list';

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Knowledge Base')}

      <div class="p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-6">
        
        <!-- Header & Action CTA -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2.5">
              <h1 class="text-[22px] font-semibold text-white tracking-tight">Knowledge Base</h1>
              <span class="text-[11px] font-medium bg-white/[0.06] text-white border border-white/[0.08] px-2.5 py-0.5 rounded-full">Root Directory Connected</span>
            </div>
            <p class="text-[13.5px] text-app-textSecondary">Connect your cloud storage or upload local files to CollabAI</p>
          </div>
          <div class="flex items-center gap-2.5">
            <button 
              onclick="showAddFilesModal()"
              class="bg-app-surface hover:bg-app-hover border border-app-borderSubtle text-white font-medium text-[13px] px-3.5 py-2 rounded-lg transition-colors">
              Add Files
            </button>
            <button 
              onclick="showNewFolderModal()"
              class="btn-primary text-[13px] px-4 py-2 rounded-lg transition-colors shadow-sm">
              New Folder
            </button>
          </div>
        </div>

        <!-- Search Bar & Functional List/Grid Toggles -->
        <div class="flex items-center gap-3">
          <div class="relative flex-1 flex items-center">
            <i data-lucide="search" class="w-4 h-4 text-app-textMuted absolute left-3.5 pointer-events-none"></i>
            <input 
              type="text" 
              placeholder="Search folders..." 
              id="folders-search-input"
              oninput="filterFoldersSearch(this.value)"
              class="w-full bg-app-surface border border-app-borderSubtle text-white placeholder-app-textMuted text-[13.5px] rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-app-borderActive transition-colors font-normal"
            />
          </div>
          <div class="flex items-center gap-1 bg-app-surface p-1 rounded-lg border border-app-borderSubtle">
            <button 
              onclick="appStore.setKnowledgeViewMode('grid')" 
              title="Grid view"
              class="p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-app-input text-white' : 'text-app-textMuted hover:text-white'}">
              <i data-lucide="layout-grid" class="w-4 h-4"></i>
            </button>
            <button 
              onclick="appStore.setKnowledgeViewMode('list')" 
              title="List view"
              class="p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-app-input text-white' : 'text-app-textMuted hover:text-white'}">
              <i data-lucide="list" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- Folders Render Area (Grid or List) -->
        <div class="flex flex-col gap-2">
          <span class="text-[11.5px] font-semibold text-app-textMuted px-1">Folders (${folders.length})</span>
          
          ${viewMode === 'grid' ? `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="folders-container">
              ${folders.map(folder => renderFolderCardGrid(folder)).join('')}
            </div>
          ` : `
            <div class="flex flex-col gap-2" id="folders-container">
              ${folders.map(folder => renderFolderRowList(folder)).join('')}
            </div>
          `}
        </div>

      </div>
    </div>
  `;
}

function renderFolderRowList(folder) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-3.5 flex items-center justify-between hover:border-app-borderMed transition-all cursor-pointer group">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
          <i data-lucide="folder" class="w-4 h-4 text-white"></i>
        </div>
        <div class="flex flex-col">
          <h3 class="text-[14px] font-medium text-white group-hover:text-white transition-colors">${escapeHtml(folder.name)}</h3>
          <span class="text-[11.5px] text-app-textMuted">${folder.items || 0} items • ${folder.size || '0 MB'} • Modified ${folder.modified || 'Today'}</span>
        </div>
      </div>

      <button class="text-app-textMuted hover:text-white p-1.5 rounded hover:bg-app-hover">
        <i data-lucide="more-horizontal" class="w-4 h-4"></i>
      </button>
    </div>
  `;
}

function renderFolderCardGrid(folder) {
  return `
    <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-app-borderMed transition-all cursor-pointer group">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
            <i data-lucide="folder" class="w-5 h-5 text-white"></i>
          </div>
          <button class="text-app-textMuted hover:text-white p-1 rounded hover:bg-app-hover">
            <i data-lucide="more-horizontal" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="flex flex-col gap-0.5">
          <h3 class="text-[14.5px] font-medium text-white group-hover:text-white transition-colors">${escapeHtml(folder.name)}</h3>
          <span class="text-[11.5px] text-app-textMuted">${folder.items || 0} items • ${folder.size || '0 MB'}</span>
        </div>
      </div>
      <div class="pt-2 border-t border-app-borderSubtle text-[11px] text-app-textMuted">
        <span>Modified ${folder.modified || 'Today'}</span>
      </div>
    </div>
  `;
}

function filterFoldersSearch(query) {
  const container = document.getElementById('folders-container');
  if (!container) return;
  const q = (query || '').toLowerCase().trim();
  const filtered = appStore.state.folders.filter(f => (f.name || '').toLowerCase().includes(q));
  const viewMode = appStore.state.knowledgeViewMode || 'list';

  if (viewMode === 'grid') {
    container.innerHTML = filtered.map(folder => renderFolderCardGrid(folder)).join('');
  } else {
    container.innerHTML = filtered.map(folder => renderFolderRowList(folder)).join('');
  }
  lucide.createIcons();
}

function showNewFolderModal() {
  const container = document.getElementById('modal-container');
  container.innerHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-semibold text-white">Create New Folder</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form onsubmit="handleNewFolderSubmit(event)" class="flex flex-col gap-4 text-[13px]">
          <div class="flex flex-col gap-1">
            <label class="font-medium text-app-textSecondary">Folder Name</label>
            <input type="text" id="new-folder-name" required placeholder="e.g. System_Documentation_v2" class="bg-app-input border border-app-borderSubtle text-white rounded-lg px-3.5 py-2 focus:outline-none focus:border-app-borderActive" />
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2">
            <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white">Cancel</button>
            <button type="submit" class="btn-primary px-4 py-1.5 rounded-lg">Create Folder</button>
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
      <div class="bg-app-surface border border-app-borderSubtle rounded-xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-5">
        <div class="flex items-center justify-between">
          <h2 class="text-[16px] font-semibold text-white">Upload Knowledge Documents</h2>
          <button onclick="closeModal()" class="text-app-textMuted hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <div class="border border-dashed border-app-borderSubtle hover:border-app-borderActive rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors" onclick="document.getElementById('file-upload-picker').click()">
          <i data-lucide="upload-cloud" class="w-8 h-8 text-white"></i>
          <span class="text-[13.5px] font-medium text-white">Click to browse or drag files here</span>
          <span class="text-[11.5px] text-app-textMuted">PDF, DOCX, Markdown, CSV up to 50MB</span>
          <input type="file" id="file-upload-picker" class="hidden" onchange="handleFileUploadSelected(this)" />
        </div>

        <div class="flex items-center justify-end">
          <button type="button" onclick="closeModal()" class="px-3.5 py-1.5 rounded-lg bg-app-input text-app-textSecondary hover:text-white text-[13px]">Done</button>
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