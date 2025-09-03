#!/usr/bin/env python3
"""
Multi-Agent Development Workflow Setup Script

This script sets up a new project with the complete multi-agent development workflow
including Claude Code configuration, workflow rules, and project structure.
"""

import os
import sys
import argparse
import shutil
from pathlib import Path


def create_project_structure(project_path: Path, project_name: str, tech_stack: str):
    """Create the basic project directory structure."""
    print(f"📁 Creating project structure for {project_name}...")
    
    # Main directories
    directories = [
        "src",
        "tests", 
        "docs/adr",
        "docs/reports",
    ]
    
    # Add frontend directories if needed
    if tech_stack in ["react", "typescript", "full-stack"]:
        directories.extend([
            "frontend/src",
            "frontend/public",
            "frontend/src/components",
            "frontend/src/types",
        ])
    
    for directory in directories:
        (project_path / directory).mkdir(parents=True, exist_ok=True)
        print(f"  ✅ Created {directory}/")
    
    # Create __init__.py files for Python packages
    (project_path / "src" / "__init__.py").touch()
    (project_path / "tests" / "__init__.py").touch()


def copy_workflow_files(scaffolding_path: Path, project_path: Path):
    """Copy workflow configuration files."""
    print("📋 Setting up workflow files...")
    
    workflow_files = [
        "CLAUDE.md",
        "WORKFLOW_RULES.md",
    ]
    
    for file in workflow_files:
        src = scaffolding_path / file
        dst = project_path / file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  ✅ Copied {file}")
        else:
            print(f"  ❌ Warning: {file} not found in scaffolding")
    
    # Copy .claude directory with agents
    claude_src = scaffolding_path / ".claude"
    claude_dst = project_path / ".claude"
    if claude_src.exists():
        shutil.copytree(claude_src, claude_dst, dirs_exist_ok=True)
        print("  ✅ Copied .claude/agents/ directory")
    else:
        print("  ❌ Warning: .claude directory not found in scaffolding")


def setup_python_files(scaffolding_path: Path, project_path: Path, use_poetry: bool):
    """Set up Python configuration files."""
    print("🐍 Setting up Python configuration...")
    
    if use_poetry:
        # Copy pyproject.toml for Poetry
        src = scaffolding_path / "template-pyproject.toml"
        dst = project_path / "pyproject.toml"
        if src.exists():
            shutil.copy2(src, dst)
            print("  ✅ Created pyproject.toml (Poetry)")
    else:
        # Copy requirements.txt for pip
        src = scaffolding_path / "template-requirements.txt"  
        dst = project_path / "requirements.txt"
        if src.exists():
            shutil.copy2(src, dst)
            print("  ✅ Created requirements.txt (pip)")
    
    # Copy .gitignore
    src = scaffolding_path / "template-gitignore"
    dst = project_path / ".gitignore"
    if src.exists():
        shutil.copy2(src, dst)
        print("  ✅ Created .gitignore")


def update_claude_config(project_path: Path, project_name: str, tech_stack: str):
    """Update CLAUDE.md with project-specific information."""
    print("⚙️  Updating Claude configuration...")
    
    claude_file = project_path / "CLAUDE.md"
    if not claude_file.exists():
        print("  ❌ Warning: CLAUDE.md not found")
        return
    
    # Read the template
    content = claude_file.read_text()
    
    # Replace placeholders
    replacements = {
        "This project uses the multi-agent development workflow": 
        f"This is the {project_name} project using the multi-agent development workflow",
    }
    
    # Add tech stack specific updates
    if tech_stack == "fastapi":
        replacements.update({
            "**Web Framework**: FastAPI/Flask/Django": "**Web Framework**: FastAPI",
            "`pytest` - Run all tests": "`pytest` - Run all tests\n- `uvicorn src.main:app --reload` - Start development server",
        })
    elif tech_stack == "flask":
        replacements.update({
            "**Web Framework**: FastAPI/Flask/Django": "**Web Framework**: Flask", 
            "`pytest` - Run all tests": "`pytest` - Run all tests\n- `flask run` - Start development server",
        })
    elif tech_stack == "django":
        replacements.update({
            "**Web Framework**: FastAPI/Flask/Django": "**Web Framework**: Django",
            "`pytest` - Run all tests": "`pytest` - Run all tests\n- `python manage.py runserver` - Start development server",
        })
    
    # Apply replacements
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Write updated content
    claude_file.write_text(content)
    print("  ✅ Updated CLAUDE.md with project details")


def init_git_repo(project_path: Path, project_name: str, github_create: bool):
    """Initialize Git repository and optionally create GitHub repo."""
    print("📦 Initializing Git repository...")
    
    os.chdir(project_path)
    
    # Initialize git
    os.system("git init")
    os.system("git add .")
    os.system(f'git commit -m "Initial commit: {project_name} with multi-agent workflow"')
    print("  ✅ Git repository initialized")
    
    if github_create:
        print("🚀 Creating GitHub repository...")
        os.system(f"gh repo create {project_name} --private --source=. --remote=origin --push")
        print("  ✅ GitHub repository created")


def main():
    parser = argparse.ArgumentParser(description="Set up multi-agent development workflow")
    parser.add_argument("project_name", help="Name of the new project")
    parser.add_argument("--path", help="Path where to create the project (default: current directory)")
    parser.add_argument("--tech-stack", choices=["fastapi", "flask", "django", "react", "full-stack"], 
                       default="fastapi", help="Technology stack template")
    parser.add_argument("--poetry", action="store_true", help="Use Poetry instead of pip")
    parser.add_argument("--github", action="store_true", help="Create GitHub repository")
    parser.add_argument("--no-git", action="store_true", help="Skip Git initialization")
    
    args = parser.parse_args()
    
    # Determine paths
    scaffolding_path = Path(__file__).parent
    if args.path:
        base_path = Path(args.path)
    else:
        base_path = Path.cwd()
    
    project_path = base_path / args.project_name
    
    # Check if project already exists
    if project_path.exists():
        print(f"❌ Error: Directory {project_path} already exists")
        sys.exit(1)
    
    print(f"🚀 Setting up {args.project_name} with multi-agent workflow")
    print(f"📍 Location: {project_path}")
    print(f"🛠  Tech stack: {args.tech_stack}")
    print()
    
    try:
        # Create project directory
        project_path.mkdir(parents=True)
        
        # Set up project structure
        create_project_structure(project_path, args.project_name, args.tech_stack)
        
        # Copy workflow files
        copy_workflow_files(scaffolding_path, project_path)
        
        # Set up Python configuration
        setup_python_files(scaffolding_path, project_path, args.poetry)
        
        # Update Claude configuration  
        update_claude_config(project_path, args.project_name, args.tech_stack)
        
        # Initialize Git repository
        if not args.no_git:
            init_git_repo(project_path, args.project_name, args.github)
        
        print()
        print("🎉 Project setup complete!")
        print(f"📁 Project created at: {project_path}")
        print()
        print("🚀 Next steps:")
        print(f"1. cd {args.project_name}")
        print("2. Create your first issue: gh issue create --title 'Initial feature'")
        print("3. Start developing with the multi-agent workflow!")
        
    except Exception as e:
        print(f"❌ Error setting up project: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()