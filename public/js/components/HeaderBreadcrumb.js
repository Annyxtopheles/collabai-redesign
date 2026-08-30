// Global Top Header with Breadcrumbs (Removed dark mode toggle button)
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
        <button class="p-1.5 text-app-textSecondary hover:text-white rounded-lg hover:bg-app-hover transition-colors" title="Notifications">
          <i data-lucide="bell" class="w-4 h-4"></i>
        </button>
      </div>
    </header>
  `;
}