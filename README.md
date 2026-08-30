# CollabAI — AI Agent Collaboration Platform

CollabAI is an AI agent collaboration platform featuring multi-agent workflow orchestration, real-time streaming chat with inline source citations, persistent project workspaces, knowledge base file management, and bug reporting.

## 🚀 Features

- **Conversations & Multi-Agent Execution**: Real-time token streaming with animated pipeline step sequences (`Aster Architect ➔ Knowledge Base ➔ Reasoning Advisor`), thinking states, structured markdown with syntax highlighting, and follow-up suggestion chips.
- **AI Agents Hub**: Filterable catalog of custom AI agents with distinct models, tags, and system prompts.
- **Dashboard & Overview**: Global quick composer with `@agent` and `#tag` shortcuts, usage statistics, and recent activity streams.
- **Projects Workspaces**: Organize threads, shared system instructions, and linked context files.
- **Knowledge Base**: Directory-connected folder hierarchy and document manager.
- **Bug Reporting**: Structured reporting form with character limits and live issue status tracking.
- **Visual Design**: Strict dark theme (`#111111` canvas, `#171717` brand surfaces, `#315EFF` highlights) matching Figma specifications.

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js HTTP Server (`server.js`) with Server-Sent Events (SSE) streaming API (`/api/chat`), Google Gemini API integration, and REST endpoints for issue tracking.
- **Frontend**: Modern SPA with Tailwind CSS, Inter & Cousine typography, Lucide icons, Marked.js parser, and reactive state persistence via `localStorage`.

## 📦 Running Locally

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd collab-ai
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open your browser at:
   ```
   http://localhost:3000
   ```