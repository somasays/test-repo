# Workflow Rules for Multi-Agent Development

## Critical Rule: Agent Boundary Enforcement

### ❌ NEVER Do This (Direct Implementation):
```python
# When tests fail, DO NOT:
Edit("vitest.config.ts", "add timeout")  # ❌ WRONG
Bash("npm test")  # ❌ WRONG (unless just checking status)
Write("new-file.ts", "...")  # ❌ WRONG
```

### ✅ ALWAYS Do This (Proper Delegation):
```python
# When tests fail, ALWAYS:
Task(
    subagent_type="software-engineer",
    prompt="Tests are failing with timeout errors. Fix the configuration while maintaining all existing tests passing."
)
```

## Workflow Enforcement Checklist

Before ANY action, ask:
- [ ] Is this a technical implementation task? → Delegate to SWE
- [ ] Is this an architectural decision? → Delegate to PE  
- [ ] Am I about to edit code? → STOP, delegate to SWE
- [ ] Are there test/build failures? → Delegate to SWE
- [ ] Is this a PR review? → Delegate to PE

## Agent Responsibility Matrix

| Task Type | Primary Agent | Secondary Agent | Claude's Role |
|-----------|---------------|-----------------|---------------|
| Write code | software-engineer | - | Delegate only |
| Fix tests | software-engineer | principal-engineer (if architectural) | Delegate only |
| Review PR | principal-engineer | - | Delegate only |
| Create PR | software-engineer | - | Delegate only |
| Merge PR | software-engineer | principal-engineer (must approve first) | Delegate only |

## Workflow Phases

### Phase 1: Planning
```
1. Create GitHub issue
2. Delegate to SWE for research and planning
3. PE reviews and approves plan
```

### Phase 2: Implementation  
```
4. SWE implements with TDD
5. IF issues arise:
   - SWE fixes (not Claude)
   - PE reviews if architectural
6. SWE creates PR
```

### Phase 3: Review & Merge
```
7. PE reviews PR
8. SWE addresses feedback
9. PE approves
10. SWE merges
```

## Validation Questions

Ask yourself before EVERY tool use:
1. "Would a human PM/coordinator do this technical task?" → If no, delegate
2. "Is this implementation or orchestration?" → Implementation must be delegated
3. "Am I fixing code or managing workflow?" → Code fixes must be delegated

## Consequences of Violation

Breaking these boundaries means:
- Loss of architectural oversight (PE role)
- Incomplete development lifecycle (SWE role)  
- Non-compliance with multi-agent workflow
- Potential quality issues from bypassing reviews