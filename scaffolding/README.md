# Multi-Agent Development Workflow Scaffolding

This scaffolding provides a complete setup for GitHub-centric multi-agent development using Claude Code with SWE and PE subagents.

## 🚀 Quick Start

1. **Copy files to your new project**:
   ```bash
   cp scaffolding/CLAUDE.md /path/to/your/project/
   cp scaffolding/WORKFLOW_RULES.md /path/to/your/project/
   cp -r scaffolding/.claude /path/to/your/project/
   ```

2. **Initialize project structure**:
   ```bash
   mkdir -p docs/adr docs/reports
   ```

3. **Update CLAUDE.md** with your project specifics:
   - Replace technology stack section with your choices
   - Update project commands for your framework
   - Adjust project description and status

## 📁 What's Included

### Core Workflow Files
- **`CLAUDE.md`** - Main configuration file for Claude Code with workflow rules
- **`WORKFLOW_RULES.md`** - Detailed multi-agent workflow documentation
- **`.claude/agents/`** - Agent definition files (software-engineer.md, principal-engineer.md)  
- **`README.md`** - This setup guide

### Template Structure
```
your-project/
├── CLAUDE.md                    # Claude Code configuration
├── WORKFLOW_RULES.md           # Workflow documentation
├── .claude/
│   └── agents/                 # Agent definition files
│       ├── software-engineer.md
│       └── principal-engineer.md
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   └── reports/                # Implementation closure reports
├── src/                        # Your source code
├── tests/                      # Your test suite
└── requirements.txt            # Python dependencies
```

## 🛠 Technology Stack Templates

### Python Projects (Default)
- **Web Framework**: FastAPI/Flask/Django
- **Testing**: pytest, pytest-cov  
- **Type Checking**: mypy
- **Linting**: ruff/black/flake8
- **Package Management**: Poetry (default), pip optional

### TypeScript/React (When Needed)
- **Build Tool**: Vite
- **Testing**: Vitest/Jest
- **Type Checking**: TypeScript
- **Linting**: ESLint/Prettier

## 🔄 Workflow Overview

### Issue-Centric Development
1. **Issues** → Central coordination point
2. **Issue Comments** → Research, plans, approvals
3. **PR Comments** → Code reviews
4. **ADRs** → Architectural decisions (when needed)
5. **Closure Reports** → Implementation documentation

### Agent Roles
- **SWE Agent** → Implementation, testing, closure reports
- **PE Agent** → Architecture review, code review, technical decisions

## 📋 Essential GitHub Labels

Create these labels in your repository:
```bash
gh label create "ready-for-implementation" --description "Issue is ready for SWE to implement" --color "00ff00"
gh label create "needs-architecture-review" --description "Requires PE architectural review" --color "ff9500" 
gh label create "technical-debt" --description "Technical debt or improvement task" --color "fbca04"
```

## 🎯 Customization Guide

### 1. Update Technology Stack
Edit the "Technology Stack Template" section in `CLAUDE.md`:

```markdown
## Technology Stack Template

**Primary Language**: Python
**Web Framework**: FastAPI  # Change to Flask/Django as needed
**Database**: PostgreSQL    # Add your database choice
**Testing**: pytest        
**Type Checking**: mypy
```

### 2. Update Project Commands
Modify the "Project Commands Template" section:

```markdown
## Project Commands Template

- `pytest` - Run all tests
- `uvicorn src.main:app --reload` - Start development server  
- `mypy src/` - Type checking
- `ruff check src/` - Linting
```

### 3. Add Project-Specific Rules
Add any project-specific workflow rules to `CLAUDE.md`:

```markdown
## Project-Specific Rules

### Database Migrations
- Always create migration after model changes
- Include migration in same PR as model changes

### API Documentation  
- Update OpenAPI docs for all endpoint changes
- Include API examples in PR descriptions
```

## 📚 Documentation Templates

### ADR Template (`docs/adr/XXX-title.md`)
```markdown
# ADR-XXX: Title

## Status
Proposed/Accepted/Superseded

## Related Issue
GitHub Issue: #N
Link: https://github.com/org/repo/issues/N

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult to do and any risks introduced by this change?
```

### Closure Report Template (`docs/reports/YYYY-MM-DD-issue-N-feature-name.md`)
```markdown
# Implementation Closure Report - Feature Name

**Issue**: #N - Feature Title
**Implementation Date**: YYYY-MM-DD
**Developer**: Software Engineer Agent
**Reviewer**: Principal Engineer  
**Status**: ✅ Completed

## Implementation Summary
What was built and why

## Key Technical Decisions
Technology choices and rationale

## Architecture Changes
How the system evolved

## Testing Strategy
Coverage and quality assurance approach

## Performance Impact
Metrics and benchmarks

## Future Considerations
Technical debt, improvements, scaling

## Lessons Learned
What worked well, what could be improved
```

## 🔧 Repository Setup

### Single-User Repository
```bash
# Initialize git and GitHub
git init
gh repo create your-project --private
git remote add origin https://github.com/yourusername/your-project.git

# Set up basic structure
mkdir -p src tests docs/adr docs/reports
touch src/__init__.py tests/__init__.py

# Create initial files
echo "# Your Project" > README.md
echo "pytest>=7.0.0" > requirements.txt
```

### Multi-User Repository
```bash
# Add collaborators
gh api repos/owner/repo/collaborators/username -X PUT

# Set up branch protection
gh api repos/owner/repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":[]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## 🚫 Common Setup Mistakes

❌ **Forgetting to create docs directories**
❌ **Not setting up GitHub labels**  
❌ **Skipping technology stack customization**
❌ **Not updating project commands**
❌ **Missing requirements.txt or pyproject.toml**

## ✅ Verification Checklist

- [ ] `CLAUDE.md` copied and customized
- [ ] `WORKFLOW_RULES.md` copied  
- [ ] `docs/adr` and `docs/reports` directories created
- [ ] GitHub labels created
- [ ] Technology stack updated in `CLAUDE.md`
- [ ] Project commands updated
- [ ] Git repository initialized
- [ ] Requirements file created

## 🎉 Ready to Go!

Your project is now set up with the complete multi-agent development workflow. Start by:

1. Creating your first issue with a feature request
2. Assigning it to yourself with the `ready-for-implementation` label  
3. Using the SWE agent to research and plan the implementation
4. Following the complete workflow through to closure report

Happy coding with agents! 🤖