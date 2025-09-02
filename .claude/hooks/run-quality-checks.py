#!/usr/bin/env python3
"""
PostToolUse hook for Write/Edit operations - runs quality checks after file changes
"""

import json
import subprocess
import sys
import os

def run_command(cmd, cwd=None):
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, 
            cwd=cwd, timeout=30
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception:
        return False, "", "Command failed"

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)
    
    # Get file information
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")
    
    if not file_path:
        sys.exit(0)
    
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    
    # Run format check on the modified file
    if file_path.endswith('.py'):
        # Check Python formatting
        success, stdout, stderr = run_command(f"black --check '{file_path}' 2>&1", cwd=project_dir)
        if not success:
            print(f"File {file_path} needs formatting - consider running 'make format'")
    
    elif file_path.endswith(('.js', '.jsx', '.ts', '.tsx')):
        # Check JavaScript/TypeScript formatting
        success, stdout, stderr = run_command(f"npx prettier --check '{file_path}' 2>&1", cwd=project_dir)
        if not success:
            print(f"File {file_path} needs formatting - consider running 'make format'")
    
    # Always exit 0 for PostToolUse - don't block, just inform
    sys.exit(0)

if __name__ == "__main__":
    main()