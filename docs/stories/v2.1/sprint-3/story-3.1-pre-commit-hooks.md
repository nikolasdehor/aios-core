# STORY 3.1: Pre-Commit Hooks (Layer 1)

**ID:** 3.1 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 5 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** 🟡 Ready for Dev

**Reference:** [Quality Gates Decision 4](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)
**Quality Gate:** [3.1-pre-commit-hooks.yml](../../qa/gates/3.1-pre-commit-hooks.yml)

**Predecessor:** Story 3.0 (Security Hardening) ✅

---

## User Story

**Como** developer, **Quero** validation automática antes de commit, **Para** catch erros em < 5s

---

## Acceptance Criteria

### Core Functionality
- [ ] AC3.1.1: Husky installed and configured
- [ ] AC3.1.2: lint-staged configured for JS/TS/MD files
- [ ] AC3.1.3: ESLint runs on staged files
- [ ] AC3.1.4: Prettier runs on staged files
- [ ] AC3.1.5: TypeScript check runs on staged files

### Performance
- [ ] AC3.1.6: Pre-commit hook completes in < 5 seconds
- [ ] AC3.1.7: Only staged files are checked (not entire codebase)

### Developer Experience
- [ ] AC3.1.8: Clear error messages on failure
- [ ] AC3.1.9: Hook can be bypassed with --no-verify (for emergencies)
- [ ] AC3.1.10: Documentation for hook usage

---

## Scope

### Layer 1: Local Validation (< 5s)
- **Executor:** Worker (deterministic, fast, cheap)
- **Tools:** ESLint, Prettier, TypeScript, Husky, lint-staged

### Configuration Files

```javascript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

```json
// package.json (lint-staged config)
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

---

## Tasks

### Setup (2h)
- [ ] 3.1.1: Install Husky + lint-staged

### Configuration (6h)
- [ ] 3.1.2: Configure ESLint rules (3h)
- [ ] 3.1.3: Configure Prettier (1h)
- [ ] 3.1.4: Configure TypeScript checks (2h)

### Validation (5h)
- [ ] 3.1.5: Test pre-commit hook (2h)
- [ ] 3.1.6: Performance optimization (< 5s) (3h)

**Total Estimated:** 13h (~2 days)

---

## Smoke Tests (HOOK-01 to HOOK-05)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| HOOK-01 | ESLint Runs | ESLint checks staged .js/.ts files | P0 | Errors block commit |
| HOOK-02 | Prettier Runs | Prettier formats staged files | P0 | Auto-fix applies |
| HOOK-03 | TypeScript Checks | TSC validates types | P0 | Type errors block |
| HOOK-04 | Performance | Hook completes < 5s | P1 | Time measured |
| HOOK-05 | Bypass Works | --no-verify skips hook | P1 | Commit succeeds |

---

## Dependencies

**Depends on:**
- Story 3.0 (Security Hardening) ✅
- Story 2.10 (Quality Gate Manager) ✅

**Blocks:**
- Story 3.3-3.4 (PR Automation)
- Story 3.5 (Human Review)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Husky + lint-staged working
- [ ] Pre-commit hook < 5s execution
- [ ] HOOK-01 to HOOK-05 tests pass
- [ ] Documentation updated
- [ ] QA Review passed
- [ ] PR created and approved

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-19 | 1.0 | Story created (combined file) | River |
| 2025-12-01 | 2.0 | Separated into individual story file | Pax (@po) |

---

**Created by:** River 🌊
**Separated by:** Pax 🎯 (PO)
