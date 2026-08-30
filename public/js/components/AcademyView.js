// Academy & Tutorials Screen - Theme Aware
function renderAcademyView(state) {
  const lessons = [
    { title: 'Designing High-Throughput Async Pipelines', duration: '8 mins', level: 'Advanced', icon: 'cpu' },
    { title: 'Creating Custom Specialist Agents with System Prompts', duration: '5 mins', level: 'Intermediate', icon: 'bot' },
    { title: 'Optimizing Token Windows & SSE Response Speeds', duration: '6 mins', level: 'Intermediate', icon: 'zap' }
  ];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Academy')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-6 animate-fade-in">
        <div class="flex flex-col gap-1">
          <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">CollabAI Academy</h1>
          <p class="text-[13.5px] text-app-textSecondary font-normal">Interactive architectural patterns and agent development tutorials.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${lessons.map(l => `
            <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm hover:border-app-borderMed cursor-pointer transition-all">
              <div class="flex flex-col gap-2.5">
                <div class="w-9 h-9 rounded-xl bg-app-hoverSubtle border border-app-borderSubtle flex items-center justify-center text-app-textPrimary">
                  <i data-lucide="${l.icon}" class="w-4 h-4"></i>
                </div>
                <h3 class="text-[14px] font-medium text-app-textPrimary">${l.title}</h3>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle text-[11.5px] text-app-textMuted">
                <span>${l.duration}</span>
                <span class="text-app-textSecondary">${l.level}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}