// Global Top Header with Breadcrumbs & Dark indicator
function renderHeaderBreadcrumb(breadcrumbTitle, actionButtons = '') {
  return `
    <header class="h-[48px] border-b border-app-borderSubtle px-8 flex items-center justify-between shrink-0 bg-app-canvas select-none">
      <div class="flex items-center gap-2 text-[13px] text-app-textSecondary font-normal">
        <span>Dashboard</span>
        <span class="text-app-textMuted">/</span>
        <span class="text-white">${breadcrumbTitle}</span>
      </div>

      <div class="flex items-center gap-3">
        ${actionButtons}
        <button class="p-1.5 text-app-textSecondary hover:text-white rounded-lg hover:bg-app-hover transition-colors">
          <i data-lucide="bell" class="w-4 h-4"></i>
        </button>
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-app-surface border border-app-borderSubtle text-[12px] text-white">
          <i data-lucide="moon" class="w-3.5 h-3.5 text-white"></i>
          <span>Dark</span>
        </div>
      </div>
    </header>
  `;
}