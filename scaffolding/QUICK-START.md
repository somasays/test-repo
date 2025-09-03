# 🚀 Quick Start - Multi-Agent Development Workflow

Get up and running with the complete multi-agent development workflow in minutes.

## Option 1: Automated Setup (Recommended)

```bash
# Clone or download the scaffolding
cd /path/to/scaffolding/

# Create new project with automated setup
python setup.py my-awesome-project --tech-stack fastapi --poetry --github

# Start developing
cd my-awesome-project
gh issue create --title "Add user authentication"
```

## Option 2: Manual Setup

```bash
# 1. Create your project directory
mkdir my-project && cd my-project

# 2. Copy workflow files
cp /path/to/scaffolding/CLAUDE.md .
cp /path/to/scaffolding/WORKFLOW_RULES.md .

# 3. Create project structure  
mkdir -p src tests docs/adr docs/reports

# 4. Set up Python (Poetry default)
cp /path/to/scaffolding/template-pyproject.toml pyproject.toml
cp /path/to/scaffolding/template-gitignore .gitignore

# Or for pip setup
cp /path/to/scaffolding/template-requirements.txt requirements.txt

# 5. Initialize git
git init && git add . && git commit -m "Initial commit"
gh repo create my-project --private --source=. --push
```

## 🛠 Setup Script Options

```bash
# Basic FastAPI project
python setup.py my-api

# Flask project with Poetry (default)
python setup.py my-flask-app --tech-stack flask

# Full-stack with React frontend  
python setup.py my-fullstack --tech-stack full-stack --github

# Django project with pip instead of Poetry
python setup.py my-django --tech-stack django --pip

# Django project without Git
python setup.py my-django --tech-stack django --no-git
```

## ✅ Verification

After setup, you should have:

```
my-project/
├── CLAUDE.md                # ✅ Claude Code configuration
├── WORKFLOW_RULES.md       # ✅ Workflow documentation
├── .claude/
│   └── agents/             # ✅ Agent definition files
├── src/                    # ✅ Source code directory
├── tests/                  # ✅ Test directory
├── docs/
│   ├── adr/               # ✅ Architecture Decision Records
│   └── reports/           # ✅ Implementation closure reports
├── pyproject.toml          # ✅ Poetry configuration (or requirements.txt for pip)
├── .gitignore             # ✅ Git ignore rules
└── README.md              # ✅ Project documentation
```

## 🎯 First Steps

1. **Create your first issue**:
   ```bash
   gh issue create --title "Add basic API structure" --body "Set up FastAPI app with health check endpoint"
   ```

2. **Assign and label it**:
   ```bash
   gh issue edit 1 --add-assignee @yourusername --add-label "ready-for-implementation"  
   ```

3. **Use SWE agent to implement**:
   Ask Claude Code to delegate implementation to the software-engineer subagent

4. **Follow the complete workflow**:
   Research → Plan → PE Approval → Implementation → PR → Review → Merge → Closure Report

## 🚫 Common Setup Issues

**Issue**: `gh: command not found`
**Fix**: Install GitHub CLI: `brew install gh` or [download here](https://cli.github.com/)

**Issue**: Python not found
**Fix**: Install Python 3.9+ from [python.org](https://python.org) or use `pyenv`

**Issue**: Permission denied on setup.py
**Fix**: `chmod +x setup.py`

## 📚 Next Steps

- Read `README.md` for detailed customization guide
- Review `WORKFLOW_RULES.md` for complete workflow documentation  
- Check `CLAUDE.md` for Claude Code configuration details
- Start your first feature following the issue-centric workflow

## 🤖 Ready to Code with Agents!

Your project is now configured for multi-agent development. The SWE and PE agents will handle implementation and reviews while maintaining complete traceability through GitHub issues and PRs.

Happy coding! 🎉