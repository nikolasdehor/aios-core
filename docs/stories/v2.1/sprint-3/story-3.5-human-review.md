# STORY 3.5: Human Review Orchestration (Layer 3)

**ID:** 3.5 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Points:** 5 | **Priority:** 🟠 High | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** ⚪ Blocked

**Reference:** [Quality Gates Decision 4](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)
**Quality Gate:** [3.5-human-review.yml](../../qa/gates/3.5-human-review.yml)

**Predecessor:** Stories 3.1, 3.3, 3.4 (All Layer 1+2)

---

## User Story

**Como** tech lead, **Quero** review estratégico apenas, **Para** focar em architecture e não syntax

---

## Acceptance Criteria

### Orchestration Logic
- [ ] AC3.5.1: Layer 1+2 pass detection implemented
- [ ] AC3.5.2: Layer 1+2 fail blocking implemented
- [ ] AC3.5.3: Human review request system working

### Review Focus
- [ ] AC3.5.4: Focus area recommendations generated
- [ ] AC3.5.5: CodeRabbit + Quinn summary provided to reviewer
- [ ] AC3.5.6: Strategic aspects highlighted (architecture, business logic, security)

### Notifications
- [ ] AC3.5.7: Human reviewer notified when layers 1+2 pass
- [ ] AC3.5.8: Blocking notification when layers 1+2 fail

### End-to-End
- [ ] AC3.5.9: Full 3-layer flow tested
- [ ] AC3.5.10: Review time reduced to ~30min (from 2-4h baseline)

---

## Scope

### Layer 3: Human (30min vs. 2-4h)
- **Executor:** Human (strategic decisions only)
- **Focus Areas:** Architecture, business logic, UX, security

### Orchestration Flow

1. Layers 1+2 pass → Notify human reviewer
2. Layers 1+2 fail → Block human review (fix first)
3. Provide CodeRabbit + Quinn summary to human reviewer
4. Human reviews only strategic aspects
5. Human approves → Merge allowed

```javascript
// Quality Gate Manager orchestration
async function orchestrateReview(pr) {
  const layer1 = await runPreCommitChecks();
  if (!layer1.pass) return block('Fix linting first');

  const layer2 = await runPRAutomation();
  if (!layer2.pass) return block('Fix Quinn/CodeRabbit issues');

  return requestHumanReview({
    focus: ['architecture', 'business-logic', 'security'],
    skip: ['syntax', 'formatting', 'simple-logic']
  });
}
```

---

## Tasks

### Implementation (9h)
- [ ] 3.5.1: Implement orchestration logic (4h)
- [ ] 3.5.2: Human review request system (3h)
- [ ] 3.5.3: Focus area recommendations (2h)

### Integration (2h)
- [ ] 3.5.4: Notification system (2h)

### Validation (4h)
- [ ] 3.5.5: Test end-to-end flow (4h)

**Total Estimated:** 15h (~2 days)

---

## Smoke Tests (HUMAN-01 to HUMAN-05)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| HUMAN-01 | Orchestration | Layer flow executes correctly | P0 | 3 layers in sequence |
| HUMAN-02 | Blocking | Failed layers block human review | P0 | Block message shown |
| HUMAN-03 | Notification | Human notified when ready | P0 | Notification sent |
| HUMAN-04 | Focus Areas | Strategic aspects highlighted | P1 | Recommendations shown |
| HUMAN-05 | Time Reduction | Review completes in ~30min | P1 | Time measured |

---

## Dependencies

**Depends on:**
- Story 3.1 (Pre-Commit Hooks)
- Story 3.3 (PR Automation)
- Story 3.4 (Quinn Layer 2 Integration)
- Story 2.10 (Quality Gate Manager) ✅

**Blocks:**
- Story 3.11 (Quality Gates Dashboard)

---

## Success Criteria (Shared with 3.1-3.4)

- [ ] 80% auto-catch rate achieved
- [ ] Human review time reduced 75%
- [ ] False positive rate < 15%
- [ ] 3-layer flow working end-to-end

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Orchestration logic working
- [ ] Notification system functional
- [ ] Human review focus areas generated
- [ ] HUMAN-01 to HUMAN-05 tests pass
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
