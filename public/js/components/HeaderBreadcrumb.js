// Global Top Header with Breadcrumbs (Theme-Aware)
function renderHeaderBreadcrumb(breadcrumbTitle, actionButtons = '') {
  return `
    <header class="h-[48px] border-b border-app-borderSubtle px-8 flex items-center justify-between shrink-0 bg-app-canvas select-none">
      <div class="flex items-center gap-2 text-[13px] text-app-textSecondary font-normal">
        <span>Dashboard</span>
        <span class="text-app-textMuted">/</span>
        <span class="text-app-textPrimary font-medium">${breadcrumbTitle}</span>
      </div>

      <div class="flex items-center gap-3">
        ${actionButtons}
      </div>
    </header>
  `;
}