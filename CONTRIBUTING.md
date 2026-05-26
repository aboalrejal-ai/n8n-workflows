# Contributing to n8n-workflows

Thank you for your interest in contributing to the **n8n Workflow Collection**! This project is a curated repository of production-ready, highly optimized n8n automation workflows, and community contributions are what make it better.

Please take a moment to review the guidelines below to ensure your contributions can be merged quickly and seamlessly.

---

## 🛠️ Contribution Workflow

1. **Fork the Repository**: Create your own copy of this repository on GitHub.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/n8n-workflows.git
   cd n8n-workflows
   ```
3. **Configure Git Long Paths (Windows Users)**:
   If you are on Windows, ensure that long file paths are enabled in Git to avoid errors with long workflow names:
   ```bash
   git config core.longpaths true
   ```
4. **Create a Branch**:
   ```bash
   git checkout -b feature/your-awesome-workflow
   ```
5. **Add/Modify Workflows**: Follow our [Workflow Guidelines](#-workflow-guidelines) below.
6. **Index and Rebuild Stats**:
   Update the database and search indexes to include your new workflow:
   ```bash
   # Re-index all workflows
   python workflow_db.py --reindex
   
   # Re-generate the static search-index.json for GitHub Pages
   python scripts/generate_search_index.py
   
   # Update the README stats automatically
   python scripts/update_readme_stats.py
   ```
7. **Commit and Push**:
   ```bash
   git add -A
   git commit -m "feat: add workflow for Slack automated reporting"
   git push origin feature/your-awesome-workflow
   ```
8. **Create a Pull Request**: Submit your PR back to our `main` branch.

---

## 📋 Workflow Guidelines

To maintain a premium-quality repository, all submitted workflow JSON files must adhere to the following rules:

### 1. 🔒 Clear All Credentials & Sensitive Information (CRITICAL)
Before exporting and committing any workflow JSON file, **you must strip all live credentials, API keys, tokens, webhooks, and private email addresses**.
* Replace passwords/keys with generic placeholders like `YOUR_API_KEY_HERE` or `YOUR_TOKEN_HERE`.
* GitHub Push Protection blocks commits containing live keys (e.g. OpenAI, Slack, Perplexity, Apify tokens) to protect our users and infrastructure.

### 2. 📁 Directory Structure & Categorization
Workflows are categorized by their primary service or functional category under the `workflows/` directory:
* For example, a workflow that works primarily with Airtable should be placed under `workflows/Airtable/`.
* A workflow that performs core script execution or basic utilities should be placed under `workflows/Wait/`, `workflows/Code/`, `workflows/Webhook/`, etc.
* The local categorization script can help place newly imported workflows:
  ```bash
  python scripts/classify_imported.py
  ```

### 3. 📝 File Naming Convention
Workflow JSON files should follow this naming pattern:
```text
[Unique_ID]_[Primary_Service]_[Associated_Services]_[Action].json
```
* **Example**: `1756_Code_HTTP_Automation_Webhook.json`
* Keep filenames concise, descriptive, and avoid special characters (spaces are replaced with underscores `_`).

### 4. 🏷️ Node Naming & Notes
* Use clean and meaningful names for individual nodes in the visual canvas.
* Add n8n **Sticky Notes** or node annotations to explain non-obvious steps, data mapping structures, or prerequisite setups. This significantly helps users understand how to run the workflow.

---

## 💻 Local Development Setup

To test your workflow additions locally, you can run our premium searchable UI on your own machine.

### Python Backend
1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Start the FastAPI API server:
   ```bash
   python run.py
   ```
3. Open `http://localhost:8000` in your browser.

### Docker Environment
Alternatively, you can run the application inside Docker:
```bash
docker build -t n8n-workflows .
docker run -p 8000:8000 n8n-workflows
```

---

## 🛡️ Code of Conduct

We are committed to fostering a welcoming and safe community. Please be respectful and professional in all communications, Pull Requests, and Issues.

---

*Need help or have questions? Open a [Discussion](https://github.com/aboalrejal-ai/n8n-workflows/discussions) or reach out to maintainer [Mohammed Nadhir Abo Alrejal](https://github.com/aboalrejal-ai).*
