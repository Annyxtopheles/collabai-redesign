// Documentation & API Reference Screen - Theme Aware
function renderDocsView(state) {
  return `
    <div class="flex-1 flex flex-col h-full overflow-y-auto bg-transparent select-none">
      ${renderHeaderBreadcrumb('Documentation')}

      <div class="p-8 max-w-[900px] mx-auto w-full flex flex-col gap-6 animate-fade-in">
        <div class="flex flex-col gap-1">
          <h1 class="text-[22px] font-semibold text-app-textPrimary tracking-tight">CollabAI Documentation</h1>
          <p class="text-[13.5px] text-app-textSecondary font-normal">Reference guide for multi-agent execution, SSE endpoints, and custom model integrations.</p>
        </div>

        <div class="bg-app-surface border border-app-borderSubtle rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-[13.5px] leading-relaxed">
          <h2 class="text-[16px] font-medium text-app-textPrimary">Streaming API Endpoint</h2>
          <p class="text-app-textSecondary font-normal">CollabAI exposes an SSE (Server-Sent Events) endpoint at <code class="bg-app-input border border-app-borderSubtle px-1.5 py-0.5 rounded text-app-textPrimary font-mono text-xs">/api/chat</code> supporting low-latency token streaming.</p>

          <pre class="bg-app-canvas border border-app-borderSubtle rounded-xl p-3 text-emerald-500 font-mono text-xs overflow-x-auto">
POST /api/chat
Content-Type: application/json

{
  "message": "Draft system architecture for event dispatcher",
  "apiKey": "optional_groq_or_gemini_key"
}
          </pre>

          <h3 class="text-[14.5px] font-medium text-app-textPrimary pt-2">Multi-Agent Protocol</h3>
          <p class="text-app-textSecondary font-normal">Events are dispatched sequentially: <code class="bg-app-input border border-app-borderSubtle px-1.5 py-0.5 rounded text-app-textMuted font-mono text-xs">pipeline</code> ➔ <code class="bg-app-input border border-app-borderSubtle px-1.5 py-0.5 rounded text-app-textMuted font-mono text-xs">token</code> ➔ <code class="bg-app-input border border-app-borderSubtle px-1.5 py-0.5 rounded text-app-textMuted font-mono text-xs">done</code>.</p>
        </div>
      </div>
    </div>
  `;
}