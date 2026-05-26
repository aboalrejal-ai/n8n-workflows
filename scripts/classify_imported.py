#!/usr/bin/env python3
"""
📂 Automated n8n Workflows Categorizer & Indexing Pipeline
This script automatically:
1. Scans 'workflows/Imported' recursively for staged workflows.
2. Extracts the service name from the filename (e.g. 2062_Httprequest_... -> Httprequest).
3. Moves each file to its corresponding categorized directory under 'workflows/'.
4. Removes the temporary 'workflows/Imported' directory once empty.
5. Re-runs the entire local database indexing and search compilation pipeline!
"""

import os
import sys
import json
import shutil
import re
import subprocess
from pathlib import Path

# Ensure UTF-8 stdout
sys.stdout.reconfigure(encoding="utf-8")

# Add the root directory to path for imports
root_path = Path(__file__).parent.parent
if str(root_path) not in sys.path:
    sys.path.append(str(root_path))


def main():
    root_dir = Path(__file__).parent.parent
    imported_dir = root_dir / "workflows" / "Imported"
    workflows_dir = root_dir / "workflows"

    print("📂 n8n Workflows Categorizer & Indexer Pipeline")
    print("=" * 60)

    if not imported_dir.exists():
        print(f"❌ Staging folder '{imported_dir}' does not exist.")
        return

    # Find JSON files inside workflows/Imported/
    json_files = list(imported_dir.glob("*.json"))

    if not json_files:
        print("💡 No workflows found inside workflows/Imported/.")
        return

    print(f"🔍 Found {len(json_files)} new workflows to classify. Processing...")

    moved_count = 0
    for file_path in json_files:
        filename = file_path.name
        
        # Filename structure: ID_Service_CamelCase_Trigger.json
        parts = filename.replace(".json", "").split("_")
        if len(parts) >= 2:
            service = parts[1].strip()
            # Sanitize folder name by keeping only alphanumeric characters to prevent Windows WinError 3 path errors
            service = re.sub(r"[^a-zA-Z0-9]", "", service)
            if not service:
                service = "Misc"
            else:
                service = service.capitalize()
        else:
            service = "Misc"

        # Create target categorized folder under workflows/
        target_dir = workflows_dir / service
        target_dir.mkdir(exist_ok=True)

        target_file_path = target_dir / filename

        try:
            shutil.move(str(file_path), str(target_file_path))
            # print(f"   ✅ Moved: {filename} ➡️  workflows/{service}/")
            moved_count += 1
        except Exception as e:
            print(f"   ⚠️  Failed to move {filename}: {e}")

    print("-" * 60)
    print(f"✨ Successfully categorized and moved {moved_count} workflows.")

    # Remove the empty Imported folder
    try:
        if not any(imported_dir.iterdir()):
            imported_dir.rmdir()
            print("🧹 Removed empty temporary folder 'workflows/Imported'")
    except Exception as e:
        print(f"⚠️  Could not remove temporary folder 'workflows/Imported': {e}")

    # Trigger indexing pipeline locally (no git changes or push)
    print("\n🔄 Re-indexing local search system & updating search database...")

    try:
        db_path = "database/workflows.db"
        from workflow_db import WorkflowDatabase
        db = WorkflowDatabase(db_path)
        db.index_all_workflows(force_reindex=True)

        # 2. Update search index
        print("   - Rebuilding static search index...")
        import scripts.generate_search_index as gsi
        gsi.main()

        # 3. Rebuild GitHub Pages static files
        print("   - Rebuilding static page assets locally...")
        import scripts.update_github_pages as ugp
        ugp.main()

        print("\n🎉 All workflows processed, database indexed, and search engine fully updated locally!")
        print("💡 Check your git status locally, but DO NOT push to GitHub until you are ready!")

    except Exception as e:
        print(f"❌ Error during local database indexing: {e}")


if __name__ == "__main__":
    main()
