#!/usr/bin/env python3
"""
PreToolUse hook for Bash commands - validates git commits by running tests and static analysis
Exit code 2 blocks the tool call and shows stderr to Claude
"""

import json
import subprocess
import sys
import os
import re

def run_command(cmd, cwd=None, timeout=60):
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, 
            cwd=cwd, timeout=timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", f"Command timed out after {timeout}s"
    except Exception as e:
        return False, "", str(e)

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)
    
    # Only process Bash tool calls
    if input_data.get("tool_name") != "Bash":
        sys.exit(0)
    
    command = input_data.get("tool_input", {}).get("command", "")
    
    # Only check git commit commands
    if not re.search(r'git\s+commit', command):
        sys.exit(0)
    
    project_dir = os.environ.get('CLAUDE_PROJECT_DIR', os.getcwd())
    failures = []
    
    # Python project checks
    if os.path.exists(os.path.join(project_dir, 'pyproject.toml')):
        checks = [
            ("Lint", "poetry run flake8 src/ tests/ 2>&1 || make lint 2>&1"),
            ("Type check", "poetry run mypy src/ 2>&1 || make type-check 2>&1"), 
            ("Tests", "poetry run pytest 2>&1 || make test 2>&1"),
        ]
        
        for name, cmd in checks:
            success, stdout, stderr = run_command(cmd, cwd=project_dir, timeout=120)
            if not success:
                failures.append(f"❌ {name} failed")
    
    # Node.js project checks  
    elif os.path.exists(os.path.join(project_dir, 'package.json')):
        checks = [
            ("Lint", "npm run lint 2>&1 || make lint 2>&1"),
            ("Tests", "npm test 2>&1 || make test 2>&1"),
        ]
        
        if os.path.exists(os.path.join(project_dir, 'tsconfig.json')):
            checks.insert(1, ("Type check", "npx tsc --noEmit 2>&1"))
            
        for name, cmd in checks:
            success, stdout, stderr = run_command(cmd, cwd=project_dir, timeout=120)
            if not success:
                failures.append(f"❌ {name} failed")
    
    if failures:
        print("🚨 Quality checks failed - commit blocked:", file=sys.stderr)
        for failure in failures:
            print(f"  {failure}", file=sys.stderr)
        print("\nFix these issues before committing. Run 'make check' to see details.", file=sys.stderr)
        sys.exit(2)  # Block the commit
    
    sys.exit(0)

if __name__ == "__main__":
    main()