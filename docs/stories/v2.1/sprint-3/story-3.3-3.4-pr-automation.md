# STORIES 3.3-3.4: PR Automation (Layer 2)

**ID:** 3.3-3.4 | **Epic:** [EPIC-S3](../../../epics/epic-s3-quality-templates.md)
**Sprint:** 3 | **Combined Points:** 13 | **Priority:** 🔴 Critical | **Created:** 2025-01-19
**Updated:** 2025-12-01
**Status:** ⚪ Blocked

**Reference:** [Quality Gates Decision 4](../../../audits/PEDRO-DECISION-LOG.md#decisão-4)
**Quality Gate:** [3.3-3.4-pr-automation.yml](../../qa/gates/3.3-3.4-pr-automation.yml)

**Predecessor:** Story 3.1 (Pre-Commit Hooks)

---

## Story 3.3: PR Automation

**Points:** 5 | **Priority:** 🔴 Critical

### User Story

**Como** developer, **Quero** automação em PRs, **Para** validation completa antes de merge

---

### Acceptance Criteria

#### Core Automation
- [ ] AC3.3.1: GitHub Actions workflow created
- [ ] AC3.3.2: CodeRabbit GitHub App integrated
- [ ] AC3.3.3: Test runner configured
- [ ] AC3.3.4: PR validation completes in < 3 minutes

#### GitHub Actions
- [ ] AC3.3.5: Workflow triggers on pull_request event
- [ ] AC3.3.6: Tests run automatically
- [ ] AC3.3.7: CodeRabbit analysis runs
- [ ] AC3.3.8: Quinn QA Agent runs

---

### Scope

**Layer 2: PR (< 3min)**
- Executor: Agent (Quinn) + CodeRabbit GitHub App
- GitHub Actions workflow

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: CodeRabbit analysis
        uses: coderabbitai/coderabbit-action@v1
      - name: Quinn QA Agent
        run: npx aios agents run quinn --task=pr-review
```

---

### Tasks (5 pts)
- [ ] 3.3.1: Create GitHub Actions workflow (3h)
- [ ] 3.3.2: Integrate CodeRabbit GitHub App (3h)
- [ ] 3.3.3: Configure test runner (2h)
- [ ] 3.3.4: Test on real PRs (4h)

**Total Estimated:** 12h (~1.5 days)

---

## Story 3.4: Quinn Layer 2 Integration

**Points:** 8 | **Priority:** 🔴 Critical

### User Story

**Como** QA (Quinn), **Quero** revisar PRs automaticamente, **Para** catch logic issues que linters não detectam

---

### Acceptance Criteria

#### PR Analysis
- [ ] AC3.4.1: PR diff analysis implemented
- [ ] AC3.4.2: Related story detection working
- [ ] AC3.4.3: Code analysis engine functional

#### Quality Checks
- [ ] AC3.4.4: Acceptance criteria checker implemented
- [ ] AC3.4.5: Test coverage analyzer working
- [ ] AC3.4.6: Logic issue detector functional

#### Integration
- [ ] AC3.4.7: CodeRabbit output integration complete
- [ ] AC3.4.8: Review comment generator working
- [ ] AC3.4.9: Successfully tested on 10+ PRs

---

### Scope

**Quinn's Role in Layer 2:**
- Analyze code changes
- Check acceptance criteria compliance
- Verify test coverage
- Detect logic issues
- Generate review comments
- **Integrate with CodeRabbit output** for comprehensive analysis

```javascript
// Quinn's PR review task
async function reviewPR(prNumber) {
  const diff = await github.getPRDiff(prNumber);
  const story = await findRelatedStory(prNumber);

  const analysis = await analyzeCode(diff, {
    acceptanceCriteria: story.acceptanceCriteria,
    testCoverage: true,
    logicIssues: true
  });

  await postReview(prNumber, analysis);
}
```

---

### Tasks (8 pts)
- [ ] 3.4.1: Implement PR analysis logic (8h)
- [ ] 3.4.2: Acceptance criteria checker (5h)
- [ ] 3.4.3: Test coverage analyzer (4h)
- [ ] 3.4.4: Logic issue detector (5h)
- [ ] 3.4.5: CodeRabbit output integration (3h)
- [ ] 3.4.6: Review comment generator (3h)
- [ ] 3.4.7: Test with 10+ PRs (5h)

**Total Estimated:** 33h (~4 days)

---

## Smoke Tests (PR-01 to PR-08)

| Test ID | Name | Description | Priority | Pass Criteria |
|---------|------|-------------|----------|---------------|
| PR-01 | Actions Trigger | Workflow triggers on PR | P0 | Workflow runs |
| PR-02 | Tests Execute | npm test runs in workflow | P0 | Results shown |
| PR-03 | CodeRabbit Runs | CodeRabbit analysis completes | P0 | Comments posted |
| PR-04 | Quinn Reviews | Quinn QA Agent runs | P0 | Review generated |
| PR-05 | Performance | Complete in < 3min | P1 | Time measured |
| PR-06 | AC Checker | Acceptance criteria validated | P1 | Issues flagged |
| PR-07 | Coverage Check | Test coverage reported | P1 | Coverage % shown |
| PR-08 | Logic Detection | Logic issues detected | P1 | Issues flagged |

---

## Dependencies

**Depends on:**
- Story 3.1 (Pre-Commit Hooks)
- Story 2.10 (Quality Gate Manager) ✅

**Blocks:**
- Story 3.5 (Human Review Orchestration)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] GitHub Actions workflow working
- [ ] CodeRabbit integration complete
- [ ] Quinn PR review functional
- [ ] PR-01 to PR-08 tests pass
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
