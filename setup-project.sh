#!/bin/bash
# Claude Code Project Setup Script
# Initializes a new project with all Claude Code scaffolding

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project information
PROJECT_NAME=""
PROJECT_TYPE=""
TECH_STACK=""

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                       Claude Code Project Setup                             ║"
    echo "║                    Multi-Agent Development Scaffolding                      ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

gather_project_info() {
    print_step "Gathering project information..."
    
    # Get project name
    while [ -z "$PROJECT_NAME" ]; do
        read -p "Project name: " PROJECT_NAME
        if [ -z "$PROJECT_NAME" ]; then
            print_warning "Project name cannot be empty"
        fi
    done
    
    # Get project type
    echo "Select project type:"
    echo "1) Full-stack application (Frontend + Backend + Database)"
    echo "2) Backend API service"
    echo "3) Frontend application"  
    echo "4) CLI tool or library"
    echo "5) Data pipeline or ML project"
    echo "6) Multi-agent system"
    
    while [ -z "$PROJECT_TYPE" ]; do
        read -p "Choose (1-6): " choice
        case $choice in
            1) PROJECT_TYPE="fullstack";;
            2) PROJECT_TYPE="backend";;
            3) PROJECT_TYPE="frontend";;
            4) PROJECT_TYPE="cli";;
            5) PROJECT_TYPE="data";;
            6) PROJECT_TYPE="multiagent";;
            *) print_warning "Invalid choice. Please select 1-6.";;
        esac
    done
    
    # Get tech stack based on project type
    case $PROJECT_TYPE in
        "fullstack"|"backend")
            echo "Select backend technology:"
            echo "1) Python (FastAPI/Django)"
            echo "2) Node.js (Express/NestJS)"
            echo "3) Go"
            echo "4) Rust"
            read -p "Choose (1-4): " tech_choice
            case $tech_choice in
                1) TECH_STACK="python";;
                2) TECH_STACK="nodejs";;
                3) TECH_STACK="go";;
                4) TECH_STACK="rust";;
                *) TECH_STACK="python";;
            esac
            ;;
        "frontend")
            echo "Select frontend technology:"
            echo "1) React"
            echo "2) Vue.js"
            echo "3) Angular"
            echo "4) Next.js"
            read -p "Choose (1-4): " tech_choice
            case $tech_choice in
                1) TECH_STACK="react";;
                2) TECH_STACK="vue";;
                3) TECH_STACK="angular";;
                4) TECH_STACK="nextjs";;
                *) TECH_STACK="react";;
            esac
            ;;
        *) TECH_STACK="python";;
    esac
    
    print_info "Project: $PROJECT_NAME ($PROJECT_TYPE with $TECH_STACK)"
}

setup_directory_structure() {
    print_step "Setting up directory structure..."
    
    # Create directories
    mkdir -p {src,tests,docs,scripts,infrastructure}
    mkdir -p .github/{workflows,ISSUE_TEMPLATE}
    mkdir -p .claude/{commands,hooks,state,templates}
    
    # Create initial files
    touch README.md
    touch .env.example
    touch .gitignore
    
    print_info "Directory structure created"
}

copy_claude_config() {
    print_step "Copying Claude Code configuration..."
    
    # Copy from scaffolding directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Copy CLAUDE.md with project-specific content
    sed "s/\[PROJECT_NAME\]/$PROJECT_NAME/g; s/\[PROJECT_TYPE\]/$PROJECT_TYPE/g; s/\[TECH_STACK\]/$TECH_STACK/g" \
        "$SCRIPT_DIR/CLAUDE.md" > CLAUDE.md
    
    # Copy slash commands
    cp "$SCRIPT_DIR/.claude/commands/"* .claude/commands/
    
    # Copy hooks
    cp "$SCRIPT_DIR/.claude/hooks/"* .claude/hooks/
    chmod +x .claude/hooks/*.py
    
    # Copy settings
    cp "$SCRIPT_DIR/.claude/settings.json" .claude/settings.json
    
    # Copy agent state files
    cp "$SCRIPT_DIR/.claude/state/"* .claude/state/
    
    print_info "Claude Code configuration copied"
}

setup_tech_stack() {
    print_step "Setting up $TECH_STACK project structure..."
    
    case $TECH_STACK in
        "python")
            # Create pyproject.toml
            cat > pyproject.toml << EOF
[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.poetry]
name = "$PROJECT_NAME"
version = "0.1.0"
description = ""
authors = ["Your Name <your.email@example.com>"]
readme = "README.md"
packages = [{include = "src"}]

[tool.poetry.dependencies]
python = "^3.9"

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
pytest-cov = "^4.0"
black = "^23.0"
isort = "^5.0"
flake8 = "^6.0"
mypy = "^1.0"
pre-commit = "^3.0"

[tool.black]
line-length = 100
target-version = ['py39']

[tool.isort]
profile = "black"
line_length = 100

[tool.mypy]
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --cov=src --cov-report=term-missing --cov-report=html"
EOF
            
            # Create initial Python structure
            mkdir -p src/$PROJECT_NAME
            touch src/$PROJECT_NAME/__init__.py
            touch src/$PROJECT_NAME/main.py
            
            echo 'def main():
    """Main entry point"""
    print("Hello from '"$PROJECT_NAME"'!")

if __name__ == "__main__":
    main()' > src/$PROJECT_NAME/main.py
            
            mkdir -p tests
            touch tests/__init__.py
            touch tests/test_main.py
            
            echo 'import pytest
from src.'"$PROJECT_NAME"'.main import main

def test_main():
    """Test main function"""
    # Add your tests here
    assert True' > tests/test_main.py
            ;;
            
        "nodejs")
            # Create package.json
            cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ tests/",
    "format": "prettier --write src/ tests/",
    "build": "echo 'Build script here'"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^2.0.0",
    "eslint": "^8.0.0",
    "prettier": "^2.0.0",
    "@eslint/js": "^9.0.0"
  }
}
EOF
            
            # Create initial JS structure
            mkdir -p src
            echo 'console.log("Hello from '"$PROJECT_NAME"'!");

function main() {
    // Your main logic here
}

if (require.main === module) {
    main();
}

module.exports = { main };' > src/index.js
            
            # Create test file
            mkdir -p tests
            echo 'const { main } = require("../src/index");

describe("'"$PROJECT_NAME"'", () => {
    test("should run without errors", () => {
        expect(() => main()).not.toThrow();
    });
});' > tests/index.test.js
            ;;
    esac
    
    print_info "$TECH_STACK project structure created"
}

setup_git() {
    print_step "Setting up Git repository..."
    
    # Initialize git if not already done
    if [ ! -d .git ]; then
        git init
        print_info "Git repository initialized"
    fi
    
    # Create .gitignore based on tech stack
    case $TECH_STACK in
        "python")
            cat > .gitignore << EOF
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

.env
.env.local
.env.production
.venv
env/
venv/
ENV/

.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/

.DS_Store
.claude/state/*.json
!.claude/state/*-template.json
EOF
            ;;
        "nodejs")
            cat > .gitignore << EOF
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

.env
.env.local
.env.production

coverage/
.nyc_output/

dist/
build/

.DS_Store
.vscode/
.idea/

.claude/state/*.json
!.claude/state/*-template.json
EOF
            ;;
    esac
    
    print_info "Git configuration completed"
}

copy_makefile() {
    print_step "Setting up Makefile..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cp "$SCRIPT_DIR/Makefile" .
    
    print_info "Makefile copied"
}

copy_precommit_config() {
    print_step "Setting up pre-commit hooks..."
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cp "$SCRIPT_DIR/.pre-commit-config.yaml" .
    
    print_info "Pre-commit configuration copied"
}

create_readme() {
    print_step "Creating README.md..."
    
    cat > README.md << EOF
# $PROJECT_NAME

$PROJECT_TYPE project built with $TECH_STACK and Claude Code multi-agent workflow.

## Quick Start

\`\`\`bash
# Setup development environment
make init

# Start development
make dev

# Run tests
make test

# Run all quality checks
make check
\`\`\`

## Claude Code Agents

This project uses Claude Code with multiple specialized agents:

- **Project Manager** (\`/project-manager\`) - Issue planning and coordination
- **Principal Engineer** (\`/principal-engineer\`) - Architecture reviews and technical leadership  
- **SWE-1** (\`/swe-1\`) - Full-stack development
- **SWE-2** (\`/swe-2\`) - Full-stack development
- **SWE-3** (\`/swe-3\`) - Full-stack development

## Development Workflow

1. Project Manager creates and assigns issues
2. Engineers create implementation plans
3. Principal Engineer reviews plans
4. Engineers implement with TDD approach
5. Principal Engineer reviews PRs
6. Quality gates ensure tests pass before commits

## Quality Gates

- **Pre-commit**: Tests and static analysis must pass before commits
- **Code formatting**: Automatic formatting on file changes
- **Test coverage**: Minimum 90% coverage required
- **Security scanning**: Secrets and vulnerabilities detected

## Project Structure

\`\`\`
$PROJECT_NAME/
├── .claude/                  # Claude Code configuration
│   ├── commands/            # Agent slash commands
│   ├── hooks/               # Quality gate hooks
│   ├── state/               # Agent session state
│   └── settings.json        # Hook configuration
├── src/                     # Source code
├── tests/                   # Test suites
├── docs/                    # Documentation
├── scripts/                 # Automation scripts
├── CLAUDE.md                # Claude Code project guide
├── Makefile                 # Development commands
└── README.md                # This file
\`\`\`

## Contributing

1. Check assigned issues with Project Manager
2. Create implementation plan for Principal Engineer review
3. Follow TDD workflow
4. Ensure quality gates pass
5. Create PR for Principal Engineer review

EOF

    print_info "README.md created"
}

final_setup() {
    print_step "Running final setup..."
    
    # Make scripts executable
    find scripts -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    
    # Install dependencies if possible
    if command -v make > /dev/null 2>&1; then
        print_info "Installing dependencies..."
        make install 2>/dev/null || print_warning "Could not install dependencies automatically"
    fi
    
    # Initial git commit
    if [ -d .git ]; then
        git add .
        git commit -m "Initial commit: Claude Code scaffolding setup

🤖 Generated with Claude Code Multi-Agent Scaffolding
        
Project: $PROJECT_NAME ($PROJECT_TYPE)
Tech Stack: $TECH_STACK
Features: Multi-agent workflow, quality gates, TDD"
        
        print_info "Initial commit created"
    fi
}

print_completion() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                            SETUP COMPLETE!                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BLUE}Project: ${NC}$PROJECT_NAME"
    echo -e "${BLUE}Type: ${NC}$PROJECT_TYPE"
    echo -e "${BLUE}Tech Stack: ${NC}$TECH_STACK"
    echo
    echo -e "${GREEN}Next Steps:${NC}"
    echo "1. Start Claude Code in this directory"
    echo "2. Use /project-manager to begin planning"
    echo "3. Create issues and assign to engineers"
    echo "4. Use agent slash commands for specialized workflows"
    echo "5. Run 'make dev' to start development"
    echo
    echo -e "${BLUE}Agent Commands:${NC}"
    echo "  /project-manager    - Project planning and issue management"
    echo "  /principal-engineer - Technical reviews and architecture"
    echo "  /swe-1             - Development work"
    echo "  /swe-2             - Development work"
    echo "  /swe-3             - Development work"
    echo
    echo -e "${BLUE}Key Features:${NC}"
    echo "  ✅ Quality gates prevent commits without passing tests"
    echo "  ✅ Multi-agent workflow with specialized roles"
    echo "  ✅ Automatic code formatting and validation"
    echo "  ✅ TDD workflow enforcement"
    echo "  ✅ State management across agent sessions"
}

main() {
    print_header
    
    # Check if we're in an empty directory or project setup
    if [ -f "CLAUDE.md" ] && [ -d ".claude" ]; then
        print_warning "Claude Code scaffolding already exists in this directory"
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    gather_project_info
    setup_directory_structure
    copy_claude_config
    setup_tech_stack
    setup_git
    copy_makefile
    copy_precommit_config  
    create_readme
    final_setup
    print_completion
}

main "$@"