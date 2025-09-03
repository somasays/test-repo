# Workflow Rules for Multi-Agent Development

## GitHub Issue-Centric Coordination

### 🎯 **CENTRAL PRINCIPLE**: GitHub Issues are the Single Source of Truth

All feature development, decisions, and approvals happen through GitHub issues and PRs. No separate documentation files for reviews - everything lives in GitHub.

## Issue-Based Workflow

### Phase 0: Issue Management & Assignment

**Issue Creator** (Product/PE/User):
```bash
# Create issue
gh issue create --title "Feature: <description>" --body "<requirements>"

# Assign to SWE and label for implementation
gh issue edit <issue> --add-assignee "@developer" --add-label "ready-for-implementation"
```

**Software Engineer Agent Restrictions**:
- ✅ Works ONLY on assigned issues with `ready-for-implementation` label
- ❌ Does NOT create issues without explicit approval
- ✅ May request PE to create debt/tech improvement issues

### Phase 1: Research & Planning (SWE on Assigned Issue)

**Software Engineer Agent** (On Assigned Issue):
```bash
# Post research findings
gh issue comment <issue> --body "## Research Findings
- Analyzed existing patterns...
- Best practices identified...
- Performance considerations..."

# Post implementation plan
gh issue comment <issue> --body "## Implementation Plan
### Approach
- Architecture: ...
- Technology choices: ...
- Testing strategy: ...
### Phases
1. Phase 1: ...
2. Phase 2: ..."

# If ADR needed, create and link
gh issue comment <issue> --body "## Architecture Decision Record
ADR created: [docs/adr/XXX-decision.md](link)
Key decisions:
- Decision 1: ...
- Decision 2: ..."
```

### Phase 2: PE Review (IN THE ISSUE)

**Principal Engineer Agent** (Review & Approval):
```bash
# Review and approve
gh issue comment <issue> --body "## Principal Engineer Review

### Assessment
✅ Architecture aligns with patterns
✅ Technology choices appropriate
✅ Security considerations addressed

### Decision: APPROVED ✅
Proceed with implementation following the plan."

# OR request changes
gh issue comment <issue> --body "## Principal Engineer Review

### Concerns
❌ Missing error handling strategy
❌ Performance implications not addressed

### Decision: CHANGES REQUESTED ❌
Please address the above before proceeding."
```

### Phase 3: Implementation

**Software Engineer Agent**:
- Implements ONLY after "APPROVED ✅" appears in issue
- Follows TDD methodology
- Creates feature branch
- References issue in commits

### Phase 4: PR Creation & Review

**Software Engineer Agent**:
```bash
gh pr create --title "feat: <description>" \
  --body "## Summary
  Implementation of feature requested in #<issue>
  
  ## Changes
  - ...
  
  Closes #<issue>"
```

**Principal Engineer Agent** (Code Review in PR):
```bash
# Approve PR
gh pr review <pr> --approve --body "Code review complete.
✅ Implementation follows approved plan
✅ Tests comprehensive
✅ Quality gates pass"

# Request changes
gh pr review <pr> --request-changes --body "Issues found:
- Missing test coverage for edge case X
- Performance concern in module Y"
```

### Phase 5: Merge & Close

**Software Engineer Agent**:
```bash
gh pr merge <pr> --squash
# Issue automatically closes due to "Closes #N" in PR

# Create closure report for context discovery
# docs/reports/YYYY-MM-DD-issue-N-feature-name.md
```

### Phase 6: Closure Report Creation

**Software Engineer Agent**:
```bash
# Create implementation closure report
# Template: docs/reports/2025-09-03-issue-5-priority-system.md
```

**Closure Report Contents**:
- **Implementation Summary**: What was built and why
- **Key Technical Decisions**: Technology choices and rationale  
- **Architecture Changes**: How the system evolved
- **Testing Strategy**: Coverage and quality assurance approach
- **Performance Impact**: Metrics and benchmarks
- **Future Considerations**: Technical debt, improvements, scaling
- **Lessons Learned**: What worked well, what could be improved

## ADR Bidirectional Linking

### When Creating ADR:

**In the ADR file** (`docs/adr/XXX-decision.md`):
```markdown
# ADR-XXX: Title

## Status
Accepted

## Related Issue
GitHub Issue: #<issue-number>
Link: https://github.com/org/repo/issues/<issue>

## Context
[Reference issue for full context]

## Decision
...
```

**In the Issue**:
```bash
gh issue comment <issue> --body "## Architecture Decision Record Created
📝 ADR: [docs/adr/XXX-decision.md](/docs/adr/XXX-decision.md)

This ADR documents the architectural decisions for this feature."
```

## Critical Rules for Agent Delegation

### ❌ NEVER Do This (Direct Implementation):
```python
# When issue needs work, DO NOT:
Edit("file.ts", "implementation")  # ❌ WRONG
Write("new-file.ts", "...")  # ❌ WRONG
Bash("npm test")  # ❌ WRONG (unless just checking status)
```

### ✅ ALWAYS Do This (Proper Delegation):
```python
# For assigned issues with ready-for-implementation label:
Task(
    subagent_type="software-engineer",
    prompt="""Work on assigned Issue #5 (ready-for-implementation):
    1. Verify you are assigned and issue has 'ready-for-implementation' label
    2. Post your research findings as issue comment
    3. Post implementation plan as issue comment
    4. Wait for PE approval in issue
    5. Only implement after approval
    """
)

# For creating technical debt issues:
Task(
    subagent_type="principal-engineer",
    prompt="""Create technical debt issue for:
    - Performance optimization needed in module X
    - Refactoring opportunity in component Y
    """
)
```

## Workflow Validation Checklist

Before ANY action, ask:
- [ ] Is this a technical task? → Delegate to SWE
- [ ] Is this a review? → Delegate to PE
- [ ] Should findings be in issue comments? → Use `gh issue comment`
- [ ] Is PE approval visible in the issue? → Check for "APPROVED ✅"
- [ ] Does ADR need bidirectional linking? → Link in both ADR and issue

## Example: Complete Feature Workflow

```bash
# 1. Product/User creates issue
gh issue create --title "Add rate limiting"

# 2. PE/Product assigns and labels
gh issue edit 5 --add-assignee "@john-swe" --add-label "ready-for-implementation"

# 3. SWE verifies assignment and posts research (via agent)
gh issue comment 5 --body "## Research: Rate limiting patterns..."

# 4. SWE posts plan (via agent)
gh issue comment 5 --body "## Plan: Token bucket implementation..."

# 5. SWE creates ADR and links (via agent)
gh issue comment 5 --body "ADR created: [003-rate-limiting.md](link)"

# 6. PE approves in issue (via agent)
gh issue comment 5 --body "## Review: APPROVED ✅"

# 7. SWE implements and creates PR
gh pr create --title "feat: Add rate limiting" --body "Closes #5"

# 8. PE reviews PR (via agent)
gh pr review 10 --approve --body "Implementation approved"

# 9. Merge (closes issue automatically)
gh pr merge 10
```

## SWE vs PE Responsibilities

### Software Engineer (SWE):
- ✅ Works on **assigned** issues with `ready-for-implementation` label
- ✅ Posts research and plans in issue comments
- ✅ Creates ADRs when needed
- ✅ Implements after approval
- ✅ Creates PRs
- ❌ Does NOT create issues (without approval)
- ❌ Does NOT self-assign issues

### Principal Engineer (PE):
- ✅ Reviews plans in issue comments
- ✅ Approves/rejects implementations
- ✅ Reviews PRs
- ✅ Creates technical debt issues
- ✅ May assign issues to SWEs
- ✅ Identifies architectural improvements

## Enforcement Mechanism

### Self-Check Protocol
1. **Before editing code**: "Is there an APPROVED ✅ in the issue?"
2. **Before posting plan**: "Should this be an issue comment?"
3. **Before creating ADR**: "Have I planned the bidirectional link?"
4. **Before merging PR**: "Is there PE approval in the PR?"

## Benefits of This Workflow

1. **Complete Traceability**: All decisions recorded in GitHub
2. **Clear Approval Chain**: Visible approvals in issues
3. **No Lost Documentation**: Everything in GitHub, not local files
4. **ADR Integration**: Architectural decisions linked to implementation
5. **Asynchronous Collaboration**: Teams can work across time zones

## Common Mistakes to Avoid

❌ **Creating review documents in files** → Use issue/PR comments
❌ **Implementing before issue approval** → Wait for "APPROVED ✅"
❌ **Forgetting ADR links** → Always bidirectional link
❌ **Skipping issue comments** → All plans/research in issues
❌ **Direct implementation** → Always delegate to agents

## Summary

**Issues = Coordination Hub**
**Issue Comments = Plans, Research, Approvals**
**PR Comments = Code Review**
**ADRs = Architectural Decisions (linked to issues)**
**Everything = In GitHub, not files**