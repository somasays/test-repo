#!/usr/bin/env python3
"""
UserPromptSubmit hook - adds project context when user submits prompts
stdout is automatically added to context for UserPromptSubmit hooks
"""

import json
import sys
import os
import subprocess
from datetime import datetime

def get_git_info(project_dir):
    """Get current git status and recent commits"""
    try:
        # Get current branch
        branch_result = subprocess.run(
            ["git", "branch", "--show-current"], 
            cwd=project_dir, capture_output=True, text=True, timeout=5
        )
        branch = branch_result.stdout.strip() if branch_result.returncode == 0 else "unknown"
        
        # Get git status
        status_result = subprocess.run(
            ["git", "status", "--porcelain"], 
            cwd=project_dir, capture_output=True, text=True, timeout=5
        )
        has_changes = bool(status_result.stdout.strip()) if status_result.returncode == 0 else False
        
        return branch, has_changes
    except Exception:
        return "unknown", False

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)
    
    prompt = input_data.get("prompt", "")
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    
    # Build context information
    context_parts = [
        f"Current time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Project directory: {os.path.basename(project_dir)}"
    ]
    
    # Add git information if available
    branch, has_changes = get_git_info(project_dir)
    if branch != "unknown":
        context_parts.append(f"Git branch: {branch}")
        if has_changes:
            context_parts.append("Git status: Uncommitted changes present")
    
    # Check if this is a commit-related prompt
    if any(word in prompt.lower() for word in ["commit", "git", "push", "merge"]):
        context_parts.append("Note: Quality gates will run before any git commits")
    
    # Output context (will be automatically added to conversation)
    print("\n".join(context_parts))
    
    sys.exit(0)

if __name__ == "__main__":
    main()