# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL WORKFLOW ENFORCEMENT RULES
### GitHub Issue-Centric Multi-Agent Development Workflow

### 🔄 **WORKFLOW COORDINATION THROUGH GITHUB**
- **GitHub Issues**: Central coordination point for all feature work
- **Issue Comments**: Where SWE posts plans, research, and PE provides reviews
- **PR Comments**: For code review and implementation discussions
- **ADRs**: Linked bidirectionally with issues for architectural decisions (when needed)
- **Closure Reports**: For all feature implementations to document context

### ⚠️ **NEVER handle these directly - ALWAYS delegate:**
1. **Code Implementation** → `Task(subagent_type="software-engineer", ...)`
2. **Test/Build Fixes** → `Task(subagent_type="software-engineer", ...)`  
3. **Architecture Reviews** → `Task(subagent_type="principal-engineer", ...)`
4. **PR Code Reviews** → `Task(subagent_type="principal-engineer", ...)`

### 📋 **ISSUE-CENTRIC WORKFLOW**

#### Phase 0: Issue Management
1. **Product/PE/User** creates issues with requirements
2. Issues are **assigned** to SWE with label: `ready-for-implementation`
3. SWE works ONLY on assigned issues with proper label
4. SWE creates new issues ONLY with explicit approval

#### Phase 1: Research & Planning (SWE on Assigned Issue)
1. SWE picks up assigned issue with `ready-for-implementation` label
2. SWE posts research findings as **issue comment**
3. SWE posts implementation plan as **issue comment**
4. If **architectural decision** needed: SWE creates ADR and links in **issue comment**
   - ADRs only for significant architectural/technology decisions
   - Simple features don't require ADRs

#### Phase 2: PE Review (in Issue)
1. PE reviews plan in **issue comments**
2. PE posts approval/changes in **issue comment**: "APPROVED ✅" or "CHANGES REQUESTED ❌"
3. If ADR exists, PE reviews and comments on architectural decisions
4. PE may create debt/improvement issues if needed

#### Phase 3: Implementation
1. SWE implements ONLY after PE approval in issue
2. SWE follows TDD approach
3. SWE creates PR and references issue

#### Phase 4: PR Review
1. SWE creates PR referencing issue number
2. PE reviews code in **PR comments**
3. PE approves/requests changes in **PR review**
   - **Single User Repos**: Use `gh pr comment` for review (GitHub blocks self-approval)
   - **Multi User Repos**: Use `gh pr review --approve` or `gh pr review --request-changes`
4. SWE addresses feedback in PR

#### Phase 5: Completion
1. PR merged (closes issue automatically with "Closes #N")
2. **SWE creates closure report** in `docs/reports/YYYY-MM-DD-issue-N-feature-name.md`
3. Closure report contains: decisions made, implementation approach, key learnings, future considerations
4. Issue serves as complete record of decisions

### 🔗 **ADR BIDIRECTIONAL LINKING**
When creating ADR:
1. ADR must reference issue: "## Related Issue: #N"
2. Post ADR link in issue comment: "ADR created: [002-architecture.md](link)"
3. This creates traceable decision history

### 🚫 **FORBIDDEN ACTIONS (without subagent delegation):**
- `Edit`, `Write`, `MultiEdit`, `NotebookEdit` for implementation
- Bash commands for: `npm test`, `npm build`, `eslint`, `tsc`, `vitest`, `pytest`, `mypy`
- Creating or merging PRs without PE approval IN THE ISSUE
- Fixing test failures or build issues directly

### ✅ **WORKFLOW VALIDATION - Before EVERY action:**
1. "Is this technical implementation?" → Delegate to SWE
2. "Is this an architectural decision?" → Delegate to PE
3. "Should this be in an issue comment?" → Use `gh issue comment`
4. "Should this be in a PR comment?" → Use `gh pr comment`

### 📊 **COMPLIANCE CHECK:**
If you find yourself using Edit/Write for code or Bash for builds without an active software-engineer Task, you are VIOLATING the workflow. STOP and delegate properly.

## Project Status

This project uses the multi-agent development workflow with:
- Software Engineer (SWE) subagent for implementation
- Principal Engineer (PE) subagent for architectural review
- GitHub-centric coordination for all decisions and approvals

## Technology Stack Template

**Primary Language**: Python
- **Web Framework**: FastAPI/Flask/Django
- **Testing**: pytest, pytest-cov
- **Type Checking**: mypy
- **Linting**: ruff/black/flake8
- **Dependency Management**: Poetry (default)

**Frontend** (when needed): TypeScript/React
- **Build Tool**: Vite
- **Testing**: Vitest/Jest
- **Type Checking**: TypeScript
- **Linting**: ESLint/Prettier

## Getting Started

```bash
# Python project setup with Poetry (recommended)
poetry install

# Run tests
poetry run pytest

# Run tests with coverage
poetry run pytest --cov

# Type checking
poetry run mypy src/

# Linting
poetry run ruff check src/

# Code formatting
poetry run ruff format src/

# Start development server (FastAPI example)
poetry run uvicorn src.main:app --reload

# Alternative: pip setup
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Project Commands Template

**With Poetry (Recommended)**:
- `poetry run pytest` - Run all tests
- `poetry run pytest --cov` - Run tests with coverage
- `poetry run mypy src/` - Type checking
- `poetry run ruff check src/` - Linting
- `poetry run ruff format src/` - Code formatting
- `poetry run uvicorn src.main:app --reload` - Start dev server (FastAPI)
- `poetry run flask run` - Start dev server (Flask)
- `poetry run python manage.py runserver` - Start dev server (Django)
- `poetry add <package>` - Add dependency
- `poetry add --group dev <package>` - Add dev dependency

**With pip**:
- `pytest` - Run all tests
- `pytest --cov` - Run tests with coverage
- `mypy src/` - Type checking
- `ruff check src/` - Linting

## Architecture Template

- **Source Code**: `/src` - Main application code
- **Tests**: `/tests` - Test suite
- **Docs**: `/docs` - Implementation plans and reviews
- **ADRs**: `/docs/adr` - Architecture Decision Records (linked to issues)
- **Closure Reports**: `/docs/reports` - Implementation completion reports for context discovery
- **Config**: Configuration files (requirements.txt, pyproject.toml, etc.)

### Closure Report Naming Convention
`docs/reports/YYYY-MM-DD-issue-N-feature-name.md`

Examples:
- `docs/reports/2025-09-03-issue-5-user-authentication.md`
- `docs/reports/2025-09-02-issue-4-api-rate-limiting.md`

## Workflow Rules

See `WORKFLOW_RULES.md` for detailed multi-agent development workflow enforcement.

## Important GitHub Commands for Workflow

```bash
# Issue comments (for plans, research, approvals)
gh issue comment <issue-number> --body "content"

# View issue with comments
gh issue view <issue-number> --comments

# PR comments (for code review)
gh pr comment <pr-number> --body "content"

# PR review (multi-user repos)
gh pr review <pr-number> --approve --body "content"
gh pr review <pr-number> --request-changes --body "content"

# PR review (single-user repos - use comments due to GitHub limitation)
gh pr comment <pr-number> --body "## Principal Engineer Review - APPROVED ✅"
```

## Repository Setup Recommendations

### Multi-User Development (Preferred)
- Add team members as collaborators for proper PR approvals
- Use branch protection rules requiring reviews
- Enable proper GitHub workflow with `gh pr review` commands

### Single-User Development (Acceptable)
- Use `gh pr comment` for PE reviews (GitHub blocks self-approval)
- Maintain same review quality and documentation standards
- Consider adding a bot or second account for proper approvals

## Notes

- Uses proper SWE/PE agent delegation for all development tasks
- All coordination happens through GitHub issues and PRs
- Maintains complete traceability from requirement to deployment