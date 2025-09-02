# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL WORKFLOW ENFORCEMENT RULES
### Multi-Agent Development Workflow - MANDATORY COMPLIANCE

### ⚠️ NEVER handle these directly - ALWAYS delegate:
1. **Code Implementation** → `Task(subagent_type="software-engineer", ...)`
2. **Test/Build Fixes** → `Task(subagent_type="software-engineer", ...)`  
3. **Architecture Reviews** → `Task(subagent_type="principal-engineer", ...)`
4. **PR Reviews** → `Task(subagent_type="principal-engineer", ...)`

### 🚫 FORBIDDEN ACTIONS (without subagent delegation):
- `Edit`, `Write`, `MultiEdit`, `NotebookEdit` for implementation
- Bash commands for: `npm test`, `npm build`, `eslint`, `tsc`, `vitest`
- Creating or merging PRs without PE approval
- Fixing test failures or build issues directly

### ✅ WORKFLOW VALIDATION - Before EVERY action:
1. "Is this technical implementation?" → Delegate to SWE
2. "Is this an architectural decision?" → Delegate to PE
3. "Am I about to edit code?" → STOP, delegate to SWE
4. "Are there failures to fix?" → Delegate to SWE

### 📊 COMPLIANCE CHECK:
If you find yourself using Edit/Write for code or Bash for builds without an active software-engineer Task, you are VIOLATING the workflow. STOP and delegate properly.

## Project Status

This project contains a Todo application backend with:
- Express + TypeScript API
- Three-layer architecture (Controller → Service → Model)
- 148 tests with 93.52% coverage
- Full CRUD operations

## Getting Started

```bash
cd backend
npm install
npm run dev  # Start development server
npm test     # Run tests
```

## Project Commands

- `npm run dev` - Start development server
- `npm test` - Run all tests
- `npm run test:coverage` - Run tests with coverage
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Architecture

- **Backend**: `/backend` - Express API with TypeScript
- **Docs**: `/docs` - Implementation plans and reviews
- **Tests**: `/backend/tests` - Comprehensive test suite

## Workflow Rules

See `WORKFLOW_RULES.md` for detailed multi-agent development workflow enforcement.

## Notes

- Located at: `/Users/soma/ssa/code/personal/claude-scaffolding`
- Uses proper SWE/PE agent delegation for all development tasks