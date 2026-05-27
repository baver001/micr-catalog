# Architectural Concept: The Agent-Managed Portal

micr.fun shifts the paradigm from "Admin Dashboard" to "Agent Interface".

## High-Level Architecture
1. **Frontend:** Lightweight, responsive portal (React/Vanilla CSS) that displays catalog items.
2. **Catalog API (Agentic):** A specialized API endpoint that accepts MCP-compatible requests.
3. **Agent Integration (MCP Gateway):** A middleware layer that translates incoming natural language requests from agents into database operations.
4. **Storage:** Standard SQL database (e.g., SQLite or PostgreSQL) for catalog data, fully portable for self-hosting.

## Agentic Workflow
- User interacts with an agent (e.g., OpenClaw).
- Agent interprets the user's intent: "Add a new converter tool."
- Agent connects to micr.fun via MCP.
- Agent verifies the request, performs the database operation, and updates the UI in real-time.
