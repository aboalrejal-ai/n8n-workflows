#!/usr/bin/env python3
"""
🚀 Automated n8n Workflows Processor & Importer
Drop raw unzipped files into `new_workflows/` and run this script to automatically:
1. Parse and validate JSON files
2. Classify workflows based on their main integrations
3. Format filenames following the repository convention with unique sequence IDs
4. Move them into matching subfolders under `workflows/`
5. Trigger SQLite indexing, search index generation, and GitHub Pages build!
"""

import os
import sys
import json
import shutil
import re
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple, Set

# Reconfigure stdout to use UTF-8 to prevent CP1252 print errors on Windows
sys.stdout.reconfigure(encoding="utf-8")


def get_next_workflow_id(workflows_dir: Path) -> int:
    """Scan the workflows directory recursively to find the highest existing ID number."""
    max_id = 0
    # Search all .json files
    for file_path in workflows_dir.rglob("*.json"):
        filename = file_path.name
        # Match starting 4-digit zero-padded number
        match = re.match(r"^(\d+)_", filename)
        if match:
            num = int(match.group(1))
            if num > max_id:
                max_id = num

    # Default to 2062 if no IDs found, or increment highest ID
    return max_id + 1 if max_id > 0 else 2062


def clean_name(name: str) -> str:
    """Clean the workflow name to a CamelCase string suitable for filenames."""
    # Remove file extension and ID prefixes if present
    name = re.sub(r"^\d+_", "", name)
    name = name.replace(".json", "")

    # Replace special chars with spaces, split words
    cleaned = re.sub(r"[^a-zA-Z0-9\s_\-]", "", name)
    words = re.split(r"[\s_\-]+", cleaned)

    # Capitalize each word and join them
    camel_case = "".join(word.capitalize() for word in words if word)

    # Limit length to 35 characters to keep names readable
    return camel_case[:35] if camel_case else "Workflow"


def determine_service_and_trigger(nodes: List[Dict]) -> Tuple[str, str]:
    """Analyze nodes to determine the primary service and the trigger type."""
    trigger_type = "Manual"
    integrations = set()

    # Exclude utility nodes from being classified as primary services
    utilities = {
        "set",
        "function",
        "code",
        "if",
        "switch",
        "merge",
        "split",
        "stickynote",
        "stickyNote",
        "wait",
        "schedule",
        "cron",
        "manual",
        "stopanderror",
        "noop",
        "noOp",
        "error",
        "limit",
        "aggregate",
        "summarize",
        "filter",
        "sort",
        "removeDuplicates",
        "dateTime",
        "extractFromFile",
        "convertToFile",
        "readBinaryFile",
        "readBinaryFiles",
        "executionData",
        "executeWorkflow",
        "executeCommand",
        "respondToWebhook",
    }

    for node in nodes:
        node_type = node.get("type", "")
        node_name = node.get("name", "").lower()

        # Determine trigger type
        if "webhook" in node_type.lower() or "webhook" in node_name:
            trigger_type = "Webhook"
        elif "cron" in node_type.lower() or "schedule" in node_type.lower():
            trigger_type = "Scheduled"
        elif "trigger" in node_type.lower() and trigger_type == "Manual":
            if "manual" not in node_type.lower():
                trigger_type = "Webhook"

        # Determine raw service name
        service_name = None
        if node_type.startswith("n8n-nodes-base."):
            service_name = node_type.replace("n8n-nodes-base.", "").lower()
        elif node_type.startswith("@n8n/"):
            service_name = node_type.split(".")[-1].lower() if "." in node_type else node_type.lower()
        elif "-" in node_type or "@" in node_type:
            parts = node_type.lower().split(".")
            for part in parts:
                if "youtube" in part:
                    service_name = "youtube"
                elif "telegram" in part:
                    service_name = "telegram"
                elif "discord" in part:
                    service_name = "discord"

        if service_name:
            # Strip "trigger" word
            service_name = service_name.replace("trigger", "")
            if service_name not in utilities and service_name.strip():
                integrations.add(service_name.capitalize())

    # Pick the first non-utility integration as primary service
    primary_service = "Misc"
    if integrations:
        # Sort to make selection deterministic
        primary_service = sorted(list(integrations))[0]

    # Convert triggers to standard casing
    if trigger_type == "Manual":
        trigger_suffix = "Manual"
    elif trigger_type == "Scheduled":
        trigger_suffix = "Scheduled"
    else:
        trigger_suffix = "Webhook" if trigger_type == "Webhook" else "Triggered"

    return primary_service, trigger_suffix


def process_staging_area():
    """Main function to scan, process, and import workflows."""
    print("🚀 N8N Workflows Automatic Importer")
    print("=" * 60)

    # Paths
    root_dir = Path(__file__).parent.parent
    staging_dir = root_dir / "new_workflows"
    workflows_dir = root_dir / "workflows"

    if not staging_dir.exists():
        print(f"❌ Staging folder '{staging_dir}' does not exist.")
        return

    # Find next sequence ID
    next_id = get_next_workflow_id(workflows_dir)
    print(f"📊 Starting import sequence from ID: {next_id:04d}")

    # Scan for JSON files in staging area
    json_files = list(staging_dir.rglob("*.json"))
    # Exclude instructions file
    json_files = [f for f in json_files if f.name.lower() != "instructions.md"]

    if not json_files:
        print("💡 No raw JSON workflows found in staging area.")
        print(f"👉 Drop your new JSON files or folders inside: {staging_dir.absolute()}")
        return

    print(f"🔍 Found {len(json_files)} files in staging area. Processing...")

    imported_count = 0
    for file_path in json_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"⚠️  Skipping invalid JSON file {file_path.name}: {e}")
            continue

        # Basic n8n validation
        nodes = data.get("nodes", None)
        if nodes is None or not isinstance(nodes, list):
            # Not an n8n workflow file
            continue

        # Extract name, service, and trigger
        raw_name = data.get("name", "").strip() or file_path.name.replace(".json", "")
        service, trigger = determine_service_and_trigger(nodes)
        cleaned_purpose = clean_name(raw_name)

        # Formulate filename: ID_Service_Purpose_Trigger.json
        new_filename = f"{next_id:04d}_{service}_{cleaned_purpose}_{trigger}.json"

        # Create target subfolder
        target_subfolder = workflows_dir / service
        target_subfolder.mkdir(exist_ok=True)

        target_file_path = target_subfolder / new_filename

        # Move file safely
        shutil.move(str(file_path), str(target_file_path))
        print(f"✅ Imported: {file_path.name} ➡️  workflows/{service}/{new_filename}")

        next_id += 1
        imported_count += 1

    print("-" * 60)
    print(f"✨ Successfully imported and categorized {imported_count} new workflows!")

    if imported_count > 0:
        # Trigger indexing pipeline automatically
        print("\n🔄 Re-indexing system & updating search database...")

        try:
            # 1. Update SQLite database
            print("   - Indexing SQLite database...")
            subprocess.run(
                [
                    sys.executable,
                    "-c",
                    "import sys; sys.stdout.reconfigure(encoding='utf-8'); from run import setup_database, setup_directories; setup_directories(); setup_database(force_reindex=True)",
                ],
                cwd=str(root_dir),
                check=True,
            )

            # 2. Update search index
            print("   - Rebuilding static search index...")
            subprocess.run(
                [
                    sys.executable,
                    "-c",
                    "import sys; sys.stdout.reconfigure(encoding='utf-8'); import scripts.generate_search_index as gsi; gsi.main()",
                ],
                cwd=str(root_dir),
                check=True,
            )

            # 3. Rebuild GitHub Pages static files
            print("   - Rebuilding static deployment assets...")
            subprocess.run(
                [
                    sys.executable,
                    "-c",
                    "import sys; sys.stdout.reconfigure(encoding='utf-8'); import scripts.update_github_pages as ugp; ugp.main()",
                ],
                cwd=str(root_dir),
                check=True,
            )

            print("🎉 Database, search engine, and GitHub Pages updated successfully!")

        except subprocess.CalledProcessError as e:
            print(f"⚠️  Error running re-indexing pipeline: {e}")
            print("💡 You can manually run: python run.py --reindex")


if __name__ == "__main__":
    process_staging_area()
