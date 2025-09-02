# Claude Code Multi-Agent Scaffolding

Complete scaffolding system for Claude Code projects with multi-agent workflows, quality gates, and automated development processes.

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)
```bash
# Clone and run setup script
git clone <this-repo> my-new-project
cd my-new-project
./setup-project.sh
```

### Option 2: Manual Setup
```bash
# Copy scaffolding to your project
cp -r claude-scaffolding/.claude your-project/
cp claude-scaffolding/CLAUDE.md your-project/
cp claude-scaffolding/Makefile your-project/
cp claude-scaffolding/.pre-commit-config.yaml your-project/

# Make hooks executable
chmod +x your-project/.claude/hooks/*.py
```

## 🎯 Features

### ✨ Multi-Agent Workflow
- **Project Manager** - Issue planning, sprint management, team coordination
- **Principal Engineer** - Architecture reviews, code quality, technical leadership
- **3x Software Engineers** - Full-stack implementation with TDD workflow

### 🛡️ Quality Gates
- **Pre-commit validation** - Tests and static analysis must pass before commits
- **Automatic formatting** - Code formatting validation on file changes
- **Security scanning** - Detects secrets and vulnerabilities
- **Test coverage** - Enforces minimum 90% test coverage

### 🔧 Claude Code Integration
- **Slash commands** - Specialized agent roles with persistent state
- **Hooks system** - Automated quality checks and context injection
- **State management** - Session persistence across agent interactions
- **Project context** - Automatic injection of git status, time, and project info

## 📋 Agent Roles

### `/project-manager`
**Responsibilities:**
- Create and prioritize GitHub issues
- Assign work based on team capacity and skills
- Track sprint progress and remove blockers
- Coordinate between team members

**Key Features:**
- Issue template generation
- Capacity-based assignment algorithm
- Sprint planning and progress tracking
- Automated status updates

### `/principal-engineer`  
**Responsibilities:**
- Review all implementation plans before coding
- Conduct architectural reviews on PRs
- Prevent over-engineering and ensure best practices
- Provide technical mentorship

**Key Features:**
- Iterative plan review process (up to 3 rounds)
- Over-engineering detection with specific guidance
- Framework knowledge to prevent reinventing the wheel
- Quality gate enforcement

### `/swe-1`, `/swe-2`, `/swe-3`
**Responsibilities:**
- Pick up assigned issues autonomously
- Create detailed implementation plans
- Follow TDD workflow (tests first)
- Submit PRs with comprehensive documentation

**Key Features:**
- Mandatory branch synchronization before work
- Implementation plan templates
- TDD workflow enforcement
- Automatic PR creation with detailed descriptions

## 🔨 Development Workflow

### 1. Planning Phase
```bash
# Start as Project Manager
/project-manager

# Create issues from requirements
gh issue create --title "Feature: User Authentication" --body "..."

# Assign to available engineers
gh issue assign <issue-number> <engineer>
```

### 2. Implementation Phase
```bash
# Start as assigned engineer
/swe-1  # or /swe-2, /swe-3

# Create implementation plan (automatically posts to issue)
# Plan gets reviewed by Principal Engineer
# After approval, begin TDD implementation
```

### 3. Review Phase
```bash
# Principal Engineer reviews all PRs
/principal-engineer

# Check PR for architectural compliance
# Provide specific, actionable feedback
# Approve or request changes
```

## ⚙️ Quality Gates in Detail

### Pre-commit Hook (`PreToolUse: Bash`)
Runs before any `git commit` command:
```python
# Validates:
- Python: flake8, mypy, pytest
- Node.js: eslint, tests, TypeScript check
- Blocks commit if any checks fail
- Shows specific failure messages to Claude
```

### Post-write Validation (`PostToolUse: Write|Edit|MultiEdit`)
Runs after file modifications:
```python
# Checks:
- Python files: black formatting
- JS/TS files: prettier formatting  
- Provides non-blocking suggestions
```

### Context Injection (`UserPromptSubmit`)
Automatically adds to every user prompt:
```python
# Injects:
- Current timestamp
- Git branch and status
- Project directory
- Commit-related warnings
```

## 📁 Project Structure

```
your-project/
├── .claude/
│   ├── commands/                 # Agent slash commands
│   │   ├── project-manager.md
│   │   ├── principal-engineer.md
│   │   ├── swe-1.md
│   │   ├── swe-2.md
│   │   └── swe-3.md
│   ├── hooks/                    # Quality gate scripts
│   │   ├── validate-bash-command.py
│   │   ├── run-quality-checks.py
│   │   └── add-context.py
│   ├── state/                    # Agent session persistence
│   │   ├── project-manager.json
│   │   ├── principal-engineer.json
│   │   └── swe-*.json
│   └── settings.json            # Hook configuration
├── src/                         # Source code
├── tests/                       # Test suites  
├── CLAUDE.md                    # Project-specific guidance
├── Makefile                     # Universal commands
└── .pre-commit-config.yaml      # Pre-commit hooks
```

## 🛠️ Available Commands

### Universal Commands (via Makefile)
```bash
make help          # Show all commands
make install       # Install dependencies (Poetry/npm/yarn)
make dev          # Start development environment  
make test         # Run all tests
make lint         # Run linting
make format       # Auto-format code
make check        # Run all quality checks
make build        # Build project
make clean        # Clean artifacts
```

### Git Integration
```bash
# Quality gates automatically run on:
git commit -m "message"  # Pre-commit validation
git push                 # All checks must pass
```

## 📚 Customization Guide

### Adding New Agent Roles
1. Create new command file: `.claude/commands/new-role.md`
2. Follow the frontmatter format with `allowed-tools`
3. Add state file: `.claude/state/new-role.json`
4. Update CLAUDE.md with role description

### Modifying Quality Gates
Edit `.claude/settings.json` to:
- Add new hook events
- Change tool matchers  
- Modify command timeouts
- Add new validation scripts

### Project-Specific Rules
Update `CLAUDE.md` to include:
- Technology-specific guidelines
- Business domain rules
- Security requirements
- Performance targets

## 🔒 Security Features

### Built-in Protections
- **Secret detection** in commits and prompts
- **Path traversal prevention** in file operations  
- **Input validation** on all hook scripts
- **Sensitive file warnings** for .env, keys, etc.

### Security Best Practices
- All hooks use proper shell quoting
- Project-relative paths via `$CLAUDE_PROJECT_DIR`
- Validation of all JSON inputs
- Timeout limits on all commands

## 🎛️ Configuration Options

### Hook Configuration (`.claude/settings.json`)
```json
{
  "hooks": {
    "PreToolUse": [...],    # Before tool execution
    "PostToolUse": [...],   # After tool completion
    "UserPromptSubmit": [...] # Before prompt processing
  }
}
```

### Agent State Management
Each agent maintains:
- Current work items
- Progress tracking
- Session history
- Next priorities
- Collaboration notes

## 🐛 Troubleshooting

### Common Issues

**Hooks not running:**
```bash
# Check hook configuration
/hooks

# Verify scripts are executable  
chmod +x .claude/hooks/*.py

# Test hook manually
echo '{"tool_name":"Bash","tool_input":{"command":"git commit"}}' | .claude/hooks/validate-bash-command.py
```

**Quality gates failing:**
```bash
# Run checks manually
make check

# View detailed output
claude --debug
```

**Agent state issues:**
```bash
# Reset agent state
rm .claude/state/*.json
cp .claude/state/*-template.json .claude/state/
```

### Debug Mode
```bash
# Run Claude Code with detailed hook logging
claude --debug
```

## 🤝 Contributing

1. Use the scaffolding to set up your development environment
2. Follow the multi-agent workflow for all changes
3. Ensure quality gates pass before submitting PRs
4. Update documentation for any new features

## 📄 License

[Your License Here]

---

**🤖 Built with Claude Code Multi-Agent Scaffolding**

Ready to transform your development workflow? Run `./setup-project.sh` to get started!