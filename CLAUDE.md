# CLAUDE.md: AI Assistant Context & Developer Guidelines

This document serves as the primary system context and operational guideline for AI coding assistants (such as Claude, Gemini, or GitHub Copilot) and developers collaborating on the **n8n-workflows** repository. It defines coding standards, repository structure, workflow formats, and best practices to ensure consistency across all AI-driven analysis, documentation, and database operations.

---

## 📁 Repository Architecture & Layout

```text
n8n-workflows/
├── workflows/              # The core database of 6,400+ workflows
│   ├── [Category]/        # Organized by primary application or integration
│   │   └── *.json         # Single, clean workflow JSON definitions
├── docs/                   # Search catalog web asset directory (GitHub Pages site)
├── src/                    # FastAPI backend Python source files
├── scripts/                # Database maintenance and automation scripts
├── api_server.py           # FastAPI REST API controller
├── workflow_db.py          # SQLite schema, indices, and reindex scripts
├── run.py                  # Entrypoint server launcher
├── SECURITY.md             # Security policy and historic patch logs
├── CONTRIBUTING.md         # Open-source contributing standards
└── CLAUDE.md               # This system context file
```

---

## 📋 JSON Workflow Schema & Structural Standards

Every workflow template stored in the `/workflows/` directory is represented as an isolated JSON file. When parsing or modifying these files, adhere to the standard n8n JSON schema:

*   **`name`**: The user-facing descriptive title of the workflow.
*   **`nodes`**: A flat array of node objects defining visual nodes, parameters, and positions on the canvas.
*   **`connections`**: An object mapping input/output relationships and data flows between nodes.
*   **`settings`**: Workflow-level parameters (e.g., error handling pathways, execution triggers, data pruning rules).
*   **`staticData`**: Persistent parameter values stored across multiple workflow executions.
*   **`tags`**: A string array used to classify, index, and organize templates in the database.
*   **`createdAt` / `updatedAt`**: Standard timestamps recording file generation.

---

## 🧩 Primary Node Classification Guide

When analyzing or documenting workflows, categorize nodes into these five primary groupings:
1.  **Trigger Nodes**: Active entrypoints that initiate execution (e.g., `n8n-nodes-base.webhook`, `n8n-nodes-base.cron`, `n8n-nodes-base.manualTrigger`).
2.  **Integration Nodes**: Connectors interacting with external APIs, cloud systems, or database engines (e.g., `n8n-nodes-base.httpRequest`, PostgreSQL, Slack, HubSpot, Salesforce).
3.  **Logical Routing Nodes**: Flow controllers defining conditional execution paths (e.g., `n8n-nodes-base.if`, `n8n-nodes-base.switch`, `n8n-nodes-base.merge`, `n8n-nodes-base.splitInBatches`).
4.  **Data Operations Nodes**: Data processors that parse, transform, and clean payload arrays (e.g., `n8n-nodes-base.code`, `n8n-nodes-base.set`, `n8n-nodes-base.html`).
5.  **Communications Nodes**: Notifiers that send updates, messages, or reports (e.g., `n8n-nodes-base.emailSend`, Discord, Telegram).

---

## 🤖 Directives for AI Assistant Tasks

Coding assistants must execute commands according to these three task-specific protocols:

### A. Workflow Analysis Tasks
*   **Business Intent Focus**: Evaluate the overall business value and objective of the node chain rather than just listing individual nodes.
*   **Security Auditing**: Scan nested node parameters for sensitive hardcoded tokens, webhooks, private email addresses, or unencrypted passwords.
*   **Integration Mappings**: Compile a structured list of all third-party services and APIs utilized within the template.

### B. Documentation Generation Tasks
*   **Verify Declarations**: Cross-reference existing documentation with the actual JSON structure to catch outdated instructions.
*   **Detail Triggers**: Explicitly document how the workflow starts (e.g., webhook payload structures, specific cron timetables, or manual clicks).
*   **Trace Transformations**: Explain how data is manipulated or mapped across nodes (especially custom JavaScript/TypeScript code blocks).
*   **Outline Error Resilience**: Highlight any custom error-handling nodes, fallback paths, or auto-retry settings implemented on the canvas.

### C. Workflow Modification Tasks
*   **Schema Consistency**: Preserve all mandatory JSON objects and data structures. Never omit coordinates or connection parameters.
*   **Enforce Unique IDs**: When inserting, duplicating, or refactoring nodes on the canvas, ensure every node contains a globally unique ID string.
*   **Validate Connections**: Recalculate and update the `connections` dictionary to avoid broken execution paths after adding or removing nodes.
*   **Compatibility Checks**: Ensure modifications remain compatible with common n8n versions. Avoid utilizing legacy parameters.

---

## 💡 Engineering Best Practices & Guidelines

Keep these principles in mind when contributing workflow assets to the repository:

*   **Descriptive Naming**: Give nodes unique, explanatory labels on the canvas that describe their exact role.
*   **Visual Sticky Notes**: Place informative visual comments (Sticky Notes) near complex logical forks or custom JS/TS nodes to simplify user onboarding.
*   **Implement Error Fallbacks**: Encourage the use of `OnError` node settings to gracefully handle external API rate limits or downtime.
*   **Modular Architecture**: Build complex logic paths across multiple sub-workflows using `Execute Workflow` nodes to keep templates readable.

---

## 🔄 Common Automation Patterns

Our workflow catalog primarily focuses on these four high-value architectural patterns:
*   **Automated Data Pipelines**: `Trigger Node` → `Fetch Payload` → `Transform Array` → `Store/Sync to DB`.
*   **Inter-System Synchronization**: `Cron Trigger` → `Query Source API` → `Diff Data Arrays` → `Patch Target API`.
*   **Transactional Automations**: `Webhook Trigger` → `Parse Payload` → `Conditional Route` → `Execute Business Action`.
*   **System Infrastructure Monitoring**: `Schedule Trigger` → `Send HTTP Health Check` → `Evaluate Status` → `Send Alerts on Failure`.

---

## 🛠️ Specialized AI Troubleshooting Guidelines

When diagnosing issues or generating utility scripts for our workflows, apply these checks:
1.  **Invalid Connections**: Catch instances where a node references a source or target node name that does not exist in the `nodes` array.
2.  **Missing Error Policies**: Flag mission-critical nodes (like HTTP integrations) that lack retry policies or error catching.
3.  **Array Loop Exhaustion**: Check custom JavaScript/TypeScript loops to ensure nodes processing batches do not cause memory leaks or infinite loop states.
4.  **Static Parameter Exposure**: Identify hardcoded authorization tokens or keys that should be parameterized using environment variables or n8n credentials.

---

## ⚙️ Repository Context & Versioning

*   **Target n8n Versions**: Workflows are verified and fully compatible with **n8n v1.0.0** and newer releases.
*   **Python Stack**: Python 3.9+ runs our backend search API using FastAPI and SQLite FTS5.
*   **Last Global Database Reindexing**: May 2026.