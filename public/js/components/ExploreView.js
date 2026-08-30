// Explore Agents & Templates Catalog
function renderExploreView(state) {
  const agents = state.agents || [];

  const templates = [
    { title: 'Async Microservice Architect', desc: 'Design event-driven worker pools with Kafka and Redis queues.', tags: ['Architecture', 'Async'] },
    { title: 'FAANG Staff SWE Resume Optimizer', desc: 'Rewrites metrics and bullet points to meet Staff level ATS requirements.', tags: ['Career', 'ATS'] },
    { title: 'Accessible Semantic UI Palette', desc: 'Generates WCAG AAA compliant color tokens with CSS variable exports.', tags: ['Design', 'Tokens'] },
    { title: 'Personal Brand Authority Engine', desc: 'Plans 90-day technical thought-leadership content calendars.', tags: ['Branding', 'Growth'] }
  ];

  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Explore')}

      <div class="p-8 max-w-[1100px] mx-auto w-full flex flex-col gap-8">
        
        <!-- Hero Banner -->
        <div class="flex flex-col gap-1">
          <h1 class="text-[22px] font-semibold text-white tracking-tight">Explore Agents & Workflows</h1>
          <p class="text-[13.5px] text-app-textSecondary font-normal">Discover pre-configured multi-agent pipelines and community templates.</p>
        </div>

        <!-- Featured Templates -->
        <div class="flex flex-col gap-3.5">
          <h2 class="text-[15.5px] font-medium text-white">Popular Workflow Templates</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${templates.map(t => `
              <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col justify-between gap-3 hover:border-app-borderMed transition-all cursor-pointer group" onclick="appStore.createConversation('${t.title}', '')">
                <div class="flex flex-col gap-1.5">
                  <h3 class="text-[14.5px] font-medium text-white group-hover:text-app-accent transition-colors">${t.title}</h3>
                  <p class="text-[12.5px] text-app-textSecondary font-normal line-clamp-2">${t.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-app-borderSubtle">
                  <div class="flex items-center gap-1">
                    ${t.tags.map(tag => `<span class="text-[10.5px] px-2 py-0.5 rounded bg-app-input text-app-textMuted border border-app-borderSubtle">${tag}</span>`).join('')}
                  </div>
                  <span class="text-[12px] text-app-accent font-normal group-hover:underline">Use Template →</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Catalog Grid -->
        <div class="flex flex-col gap-3.5">
          <h2 class="text-[15.5px] font-medium text-white">All Agents</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${agents.map(a => renderAgentCard(a)).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}