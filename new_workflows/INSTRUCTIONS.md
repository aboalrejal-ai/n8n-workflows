# 📥 New Workflows Staging & Processing Guide

Welcome to your local workflows staging area! This directory (`new_workflows/`) is a private, local-only staging folder where you can drop newly downloaded folders, zip files, or raw JSON workflows.

> [!NOTE]
> This folder is added to `.gitignore` so none of these raw files, archives, or intermediate imports will ever be pushed to your public GitHub repository. Your public repository remains clean!

---

## 🛠️ Automated Processing Script

To make importing incredibly easy, we have created an automated Python script: **`new_workflows/process_imports.py`**.

When you run this script, it will:
1. Scan `new_workflows/` recursively for any `.json` files.
2. Verify they are valid n8n workflow files.
3. Automatically determine the primary service/integration (e.g., `Airtable`, `Telegram`, `Gmail`).
4. Find the next sequential ID in your main collection (starting from the highest existing ID).
5. Format the name cleanly following the repository's convention:  
   `[ID]_[Service]_[CleanedName]_[Trigger].json`
6. Move the files to the correct folder under `workflows/[Service]/`.
7. **Automatically trigger re-indexing and update your search engine and GitHub Pages!**

### How to use it:
1. Drop your unzipped folders or raw JSON files into this `new_workflows/` directory.
2. Open your terminal in the root of the project and run:
   ```bash
   python new_workflows/process_imports.py
   ```
3. The script will output exactly how many workflows were successfully processed, moved, and indexed.
4. Restart your development server (`python run.py --dev`) or push the updated `workflows/` directory to GitHub!

---

## ✍️ Manual Naming & Categorization Convention

If you or another developer ever want to categorize workflows manually, here is the exact system used in this repository to keep everything perfectly organized:

### 1. Naming Format
All workflow files MUST follow this naming convention:
```text
[ID]_[Service]_[Purpose]_[Trigger].json
```
Where:
- **`[ID]`**: A 4-digit zero-padded number representing the workflow's unique sequence ID (e.g. `2062`). Always increment from the highest existing ID.
- **`[Service]`**: The capitalized camelCase name of the primary service integrated (e.g. `Airtable`, `GoogleCalendar`, `Gmail`, `Telegram`).
- **`[Purpose]`**: A short, underscore-separated title describing the workflow's function (e.g. `LeadSync`, `NotificationAlert`, `DatabaseBackup`).
- **`[Trigger]`**: The mechanism that starts the workflow (e.g. `Webhook`, `Scheduled`, `Triggered`, `Manual`).

**Example:**
`2062_Airtable_LeadSync_Scheduled.json`

### 2. Folder Structure
Every workflow belongs in a capitalized service subfolder matching its primary service under `workflows/`:
```text
workflows/
├── Airtable/
│   └── 2062_Airtable_LeadSync_Scheduled.json
├── Telegram/
│   └── 2063_Telegram_NotificationAlert_Webhook.json
└── Gmail/
    └── 2064_Gmail_Autoresponder_Triggered.json
```

---

## 🔄 Re-indexing Pipeline (Behind the Scenes)

Once the new workflows are placed in the `workflows/` directory, three steps are executed in order to update the search engine:

1. **SQLite Database Update:**  
   Scans the folders, parses the JSON nodes, calculates complexity, and stores metadata in `database/workflows.db`.
   ```bash
   python -c "import sys; sys.stdout.reconfigure(encoding='utf-8'); from run import setup_database; setup_database(force_reindex=True)"
   ```
2. **GitHub Pages Search Index Rebuild:**  
   Generates a static search-index JSON of all metadata for client-side searching.
   ```bash
   python -c "import sys; sys.stdout.reconfigure(encoding='utf-8'); import scripts.generate_search_index as gsi; gsi.main()"
   ```
3. **Deployment Assets Update:**  
   Rebuilds HTML Pages configuration, relative paths, and stamps current deployment dates.
   ```bash
   python -c "import sys; sys.stdout.reconfigure(encoding='utf-8'); import scripts.update_github_pages as ugp; ugp.main()"
   ```
