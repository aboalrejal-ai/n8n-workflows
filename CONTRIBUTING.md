# Contributing to the n8n Workflow Collection

Thank you for your interest in helping grow the **n8n Workflow Collection**! This project is a premium, open-source library containing over **6,400+ production-ready n8n automation templates**. Our goal is to make self-hosted automation accessible, safe, and highly optimized for developers, DevOps teams, and creators worldwide.

Community contributions are the heartbeat of this project. By sharing your verified workflows, you help thousands of self-hosted n8n users deploy production-grade automations in seconds. 

Please review the onboarding guidelines below to ensure your templates can be verified and merged into the main repository quickly and seamlessly.

---

## 🛠️ Open-Source Contribution Workflow

To submit new workflows, optimize existing templates, or improve our search engine backend, follow this standard Git branching workflow:

### 1. Fork the Repository
Create your personal copy of the repository by clicking the **Fork** button at the top of the [GitHub Repository](https://github.com/aboalrejal-ai/n8n-workflows).

### 2. Clone Your Fork Locally
Clone your fork to your local development machine:
```bash
git clone https://github.com/YOUR_USERNAME/n8n-workflows.git
cd n8n-workflows
```

### 3. Enable Git Long Paths (Windows Users)
Because some n8n workflows have long names, Windows users might encounter filesystem path length limits in Git. Avoid errors by enabling long path support:
```bash
git config core.longpaths true
```

### 4. Create a Feature Branch
Generate a dedicated branch for the specific workflow or feature you are building:
```bash
git checkout -b feature/your-awesome-workflow
```

### 5. Build, Test, and Classify Your Workflows
Flesh out your workflow addition. Ensure it follows our strict [Workflow Standards](#-workflow-standards) and is classified into the correct directory.

### 6. Update Database Indexes and Stats
To make sure your new workflow is registered by our backend search engine and visible in the local web interface, rebuild the SQLite database and search indexes:
```bash
# Re-index all workflows and build the SQLite FTS5 database
python workflow_db.py --reindex

# Re-generate the static search-index.json asset used by GitHub Pages
python scripts/generate_search_index.py

# Re-calculate and update repository stats inside README.md automatically
python scripts/update_readme_stats.py
```

### 7. Commit Your Changes and Push
Ensure your commit history is clean and descriptive. Stage your modifications and push the branch to your GitHub fork:
```bash
# Stage all files
git add -A

# Create a clear commit message matching our styling
git commit -m "feat: add workflow for Slack automated reporting"

# Push the feature branch to your fork
git push origin feature/your-awesome-workflow
```

### 8. Open a Pull Request (PR)
Navigate back to the main repository on GitHub and open a Pull Request from your feature branch to our `main` branch. Provide a brief explanation of what the workflow accomplishes.

---

## 📋 Workflow Canvas Standards & Requirements

We hold our workflow database to high quality and security standards. To prevent security incidents and ensure imports succeed without errors, all JSON files must adhere to these rules:

### 1. 🔒 Clear All Credentials & Private Tokens (CRITICAL)
Before exporting a workflow JSON from your n8n canvas and committing it, **you must strip all live API keys, credentials, private webhooks, secret tokens, and personal email addresses**.
*   **Action Required**: Replace raw passwords, secrets, or bearer tokens with clear, uppercase placeholders (e.g., `YOUR_API_KEY_HERE`, `YOUR_SLACK_WEBHOOK_HERE`, or `YOUR_OPENAI_TOKEN_HERE`).
*   **Protection Notice**: GitHub Push Protection is enabled. Commits containing active keys (including OpenAI, Slack, Perplexity, or Apify tokens) will be blocked automatically to safeguard our user ecosystem.

### 2. 📁 Structured Directory Categorization
To keep the database navigable, workflows are organized under the `workflows/` directory by their primary service or function:
*   Workflows leveraging Airtable extensively go under `workflows/Airtable/`.
*   Templates handling logical data execution, scripting, or wait loops go under functional utility directories like `workflows/Code/`, `workflows/Webhook/`, `workflows/Wait/`, etc.
*   **Classification Utility**: We provide an automated classification script to help you categorize newly exported workflows:
    ```bash
    python scripts/classify_imported.py
    ```

### 3. 📝 Standardized File Naming Scheme
All workflow JSON templates must follow this naming convention:
```text
[Unique_ID]_[Primary_Service]_[Associated_Services]_[Action].json
```
*   **Real Example**: `1756_Code_HTTP_Automation_Webhook.json`
*   Keep filenames descriptive, lowercase (except for service acronyms), and replace spaces or special characters with underscores `_`.

### 4. 🏷️ Canvas Annotations & Notes
*   **Sticky Notes**: Use n8n visual Sticky Notes to document complex logic steps, data structures, or pre-requisite configurations directly on the canvas.
*   Clear node descriptions help self-hosted users instantly understand how to configure and run your workflow successfully.

---

## 💻 Configuring Your Local Development Setup

Test your workflow contributions locally before opening a PR by launching our lightweight, searchable web app.

### A. Python Backend Server
1.  Verify you have Python 3.9+ installed, then install the packages:
    ```bash
    pip install -r requirements.txt
    ```
2.  Start the FastAPI local web application:
    ```bash
    python run.py
    ```
3.  Open `http://localhost:8000` in your web browser to browse and query your local workflow database.

### B. Dockerized Container Environment
Alternatively, build and test inside an isolated container:
```bash
# Build the Docker image locally
docker build -t n8n-workflows .

# Spin up the container on port 8000
docker run -d -p 8000:8000 --name n8n-workflows-dev n8n-workflows
```

---

## 🛡️ Community Code of Conduct

We are dedicated to building a welcoming, inclusive, and professional developer ecosystem. We expect all contributors to:
*   Use respectful and constructive language in Issues, Discussions, and Pull Requests.
*   Maintain empathy and respect when collaborating with other community members.
*   Focus on delivering high-quality, verified code and configurations.

Failure to follow professional community conduct may result in the blocking of commits or removal from the project workspace.

---

## 📧 Questions & Collaborations

Need guidance on structuring an automation sequence? Have questions about SQLite indexing or categorizing a workflow?
*   Open a topic on our [GitHub Discussions](https://github.com/aboalrejal-ai/n8n-workflows/discussions).
*   Create a ticket in [GitHub Issues](https://github.com/aboalrejal-ai/n8n-workflows/issues).
*   Reach out to project maintainer [Mohammed Nadhir Abo Alrejal](https://github.com/aboalrejal-ai) for direct collaboration.
