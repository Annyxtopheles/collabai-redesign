// Academy & Tutorials Screen
function renderAcademyView(state) {
  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-app-canvas select-none">
      ${renderHeaderBreadcrumb('Academy')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-6">
        <div class="flex flex-col gap-1">
          <h1 class="text-[22px] font-semibold text-white tracking-tight">CollabAI Academy</h1>
          <p class="text-[13.5px] text-app-textSecondary font-normal">Master agent collaboration, prompt optimization, and memory architectures.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-2">
            <span class="text-[11px] text-app-accent font-medium uppercase">Module 1</span>
            <h3 class="text-[15px] font-medium text-white">Multi-Agent Pipeline Orchestration</h3>
            <p class="text-[12.5px] text-app-textSecondary font-normal">Learn how to chain specialized agents into fault-tolerant pipelines.</p>
          </div>
          <div class="bg-app-surface border border-app-borderSubtle rounded-xl p-5 flex flex-col gap-2">
            <span class="text-[11px] text-app-accent font-medium uppercase">Module 2</span>
            <h3 class="text-[15px] font-medium text-white">Knowledge Base Grounding & Vector Search</h3>
            <p class="text-[12.5px] text-app-textSecondary font-normal">Ground AI responses with folder-based documents and citation indexes.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}