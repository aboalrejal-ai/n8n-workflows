#!/usr/bin/env python3
"""
Update README.md with current workflow statistics
Replaces hardcoded numbers with live data from the database.
"""

import os
import re
import sys
from pathlib import Path
from datetime import datetime

# Add the parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from workflow_db import WorkflowDatabase


def get_current_stats():
    """Get current workflow statistics from the database."""
    db_path = "database/workflows.db"

    if not os.path.exists(db_path):
        print("Database not found. Run workflow indexing first.")
        return None

    db = WorkflowDatabase(db_path)
    stats = db.get_stats()

    # Get categories count
    categories = db.get_service_categories()

    return {
        "total_workflows": stats["total"],
        "active_workflows": stats["active"],
        "inactive_workflows": stats["inactive"],
        "total_nodes": stats["total_nodes"],
        "unique_integrations": stats["unique_integrations"],
        "categories_count": len(get_category_list(categories)),
        "triggers": stats["triggers"],
        "complexity": stats["complexity"],
        "last_updated": datetime.now().strftime("%Y-%m-%d"),
    }


def get_category_list(categories):
    """Get formatted list of all categories (same logic as search index)."""
    formatted_categories = set()

    # Map technical categories to display names
    category_mapping = {
        "messaging": "Communication & Messaging",
        "email": "Communication & Messaging",
        "cloud_storage": "Cloud Storage & File Management",
        "database": "Data Processing & Analysis",
        "project_management": "Project Management",
        "ai_ml": "AI Agent Development",
        "social_media": "Social Media Management",
        "ecommerce": "E-commerce & Retail",
        "analytics": "Data Processing & Analysis",
        "calendar_tasks": "Project Management",
        "forms": "Data Processing & Analysis",
        "development": "Technical Infrastructure & DevOps",
    }

    for category_key in categories.keys():
        display_name = category_mapping.get(
            category_key, category_key.replace("_", " ").title()
        )
        formatted_categories.add(display_name)

    # Add categories from the create_categories.py system
    additional_categories = [
        "Business Process Automation",
        "Web Scraping & Data Extraction",
        "Marketing & Advertising Automation",
        "Creative Content & Video Automation",
        "Creative Design Automation",
        "CRM & Sales",
        "Financial & Accounting",
    ]

    for cat in additional_categories:
        formatted_categories.add(cat)

    return sorted(list(formatted_categories))


def update_readme_stats(stats):
    """Update README.md with current statistics."""
    readme_path = "README.md"

    if not os.path.exists(readme_path):
        print("README.md not found")
        return False

    with open(readme_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Define replacement patterns and their new values
    replacements = [
        # Workflows Badge
        (
            r"badge/Workflows-\d+\+-blue",
            f"badge/Workflows-{stats['total_workflows']}+-blue",
        ),
        # Integrations Badge
        (
            r"badge/Integrations-\d+\+-green",
            f"badge/Integrations-{stats['unique_integrations']}+-green",
        ),
        # Numbers - Workflows
        (
            r"-\s+\*\*[\d,]+\*\*\s+Production-Ready Workflows",
            f"- **{stats['total_workflows']:,}** Production-Ready Workflows",
        ),
        # Numbers - Integrations
        (
            r"-\s+\*\*[\d,]+\*\*\s+Unique Integrations",
            f"- **{stats['unique_integrations']:,}** Unique Integrations",
        ),
        # Numbers - Total Nodes
        (
            r"-\s+\*\*[\d,]+\*\*\s+Total Nodes",
            f"- **{stats['total_nodes']:,}** Total Nodes",
        ),
        # Numbers - Categories
        (
            r"-\s+\*\*[\d,]+\*\*\s+Organized Categories",
            f"- **{stats['categories_count']}** Organized Categories",
        ),
        # Folder comment
        (
            r"├── workflows/\s+#\s+[\d,]+\s+workflow JSON files",
            f"├── workflows/           # {stats['total_workflows']:,} workflow JSON files",
        ),
    ]

    # Apply all replacements
    updated_content = content
    replacements_made = 0

    for pattern, replacement in replacements:
        old_content = updated_content
        updated_content = re.sub(pattern, replacement, updated_content)
        if updated_content != old_content:
            replacements_made += 1

    # Write back to file
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(updated_content)

    print("README.md updated with current statistics:")
    print(f"  - Total workflows: {stats['total_workflows']:,}")
    print(f"  - Active workflows: {stats['active_workflows']:,}")
    print(f"  - Total nodes: {stats['total_nodes']:,}")
    print(f"  - Unique integrations: {stats['unique_integrations']:,}")
    print(f"  - Categories: {stats['categories_count']}")
    print(f"  - Replacements made: {replacements_made}")

    return True


def main():
    """Main function to update README statistics."""
    try:
        print("Getting current workflow statistics...")
        stats = get_current_stats()

        if not stats:
            print("Failed to get statistics")
            sys.exit(1)

        print("Updating README.md...")
        success = update_readme_stats(stats)

        if success:
            print("README.md successfully updated with latest statistics!")
        else:
            print("Failed to update README.md")
            sys.exit(1)

    except Exception as e:
        print(f"Error updating README stats: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
