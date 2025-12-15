# Command Inventory Report - Story 6.1.2.3

**Date:** 2025-01-15
**Analyst:** Dex (Developer)
**Story:** STORY-6.1.2.3 - Agent Command Rationalization
**Epic:** Epic-6.1 - Agent Identity System

---

## Executive Summary

This report provides a comprehensive analysis of commands across 2 primary agents (aios-master and data-engineer) to identify opportunities for rationalization, consolidation, and optimization.

### Key Findings

**Command Counts (Actual vs. Story Expected):**
- **aios-master:** 44 commands (story expected: 43) - 2.3% variance
- **data-engineer:** 31 commands (story expected: 19) - 63.2% variance ⚠️
- **Total:** 75 commands (story expected: 62) - 21% variance

**Variance Analysis:**
The significant variance in data-engineer count (31 vs 19) suggests the story was written with outdated information or the agent file was expanded since story creation. The actual file contains:
- 6 universal commands (help, guide, yolo, exit, doc-out, execute-checklist)
- 25 domain-specific commands

### High-Level Recommendations

**aios-master (44 commands):**
- ✅ **Keep:** 25-28 commands (core orchestration)
- 🔀 **Merge:** 8-10 commands (create-*/modify-* consolidation)
- 🔄 **Delegate:** 3-5 commands (specialized agent tasks)
- ❌ **Remove:** 1-3 commands (unused utilities)
- **Target:** 28-30 commands (32-36% reduction)

**data-engineer (31 commands):**
- ✅ **Keep:** 20-22 commands (core DBA operations)
- 🔀 **Merge:** 6-8 commands (performance analysis consolidation)
- ❌ **Remove:** 1-2 commands (low usage)
- **Target:** 22-24 commands (23-29% reduction)

---

## Detailed Command Analysis

### aios-master Commands (44 total)

#### Category 1: Core Commands (6 commands) ✅ KEEP ALL
| # | Command | Usage | Rationale |
|---|---------|-------|-----------|
| 1 | help | UNIVERSAL | Core interface command |
| 2 | kb | HIGH | AIOS Method knowledge access |
| 3 | status | HIGH | Progress tracking |
| 4 | guide | MED | Self-documentation |
| 5 | yolo | MED | Workflow acceleration |
| 6 | exit | UNIVERSAL | Core interface command |

**Recommendation:** Keep all 6 - essential interface commands.

---

#### Category 2: Framework Component Creation (11 commands) 🔀 CONSOLIDATE

**Current Commands:**
| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 7 | create-agent | create-agent.md | HIGH | 🔀 MERGE → create {type} |
| 8 | create-task | create-task.md | HIGH | 🔀 MERGE → create {type} |
| 9 | create-workflow | create-workflow.md | MED | 🔀 MERGE → create {type} |
| 10 | update-manifest | update-manifest.md | MED | ✅ KEEP (unique) |
| 11 | validate-component | TBD | LOW | ✅ KEEP (quality gate) |
| 12 | deprecate-component | deprecate-component.md | LOW | ✅ KEEP (lifecycle mgmt) |
| 13 | modify-agent | modify-agent.md | MED | 🔀 MERGE → modify {type} |
| 14 | modify-task | modify-task.md | LOW | 🔀 MERGE → modify {type} |
| 15 | modify-workflow | modify-workflow.md | LOW | 🔀 MERGE → modify {type} |
| 16 | propose-modification | propose-modification.md | LOW | ✅ KEEP (governance) |
| 17 | undo-last | undo-last.md | LOW | ✅ KEEP (safety) |

**Consolidation Opportunity:**
```yaml
# BEFORE: 6 commands (create-* and modify-*)
create-agent, create-task, create-workflow
modify-agent, modify-task, modify-workflow

# AFTER: 2 commands with type parameter
create {type} {name}    # Types: agent, task, workflow, template, checklist
modify {type} {name}    # Types: agent, task, workflow, template, checklist
```

**Net Impact:** 11 commands → 7 commands (36% reduction in category)

---

#### Category 3: Framework Analysis (4 commands) 🔀 PARTIAL CONSOLIDATION

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 18 | analyze-framework | analyze-framework.md | MED | ✅ KEEP |
| 19 | learn-patterns | learn-patterns.md | LOW | 🔀 MERGE → analyze-framework |
| 20 | list-components | N/A (inline) | MED | ✅ KEEP (utility) |
| 21 | test-memory | N/A (diagnostic) | LOW | ✅ KEEP (debugging) |

**Consolidation Opportunity:**
- Merge `learn-patterns` into `analyze-framework --learn-mode` or similar

**Net Impact:** 4 commands → 3 commands (25% reduction in category)

---

#### Category 4: Task Execution (2 commands) ✅ KEEP ALL

| # | Command | Usage | Rationale |
|---|---------|-------|-----------|
| 22 | task {task} | UNIVERSAL | Core workflow execution |
| 23 | execute-checklist {checklist} | HIGH | Quality validation |

**Recommendation:** Keep both - fundamental to AIOS workflow.

---

#### Category 5: Workflow & Planning (5 commands) ⚠️ REVIEW

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 24 | workflow {name} | N/A (built-in) | HIGH | ✅ KEEP |
| 25 | workflow-guidance | TBD | LOW | ❌ REMOVE → use *help |
| 26 | plan | N/A (planning) | MED | ✅ KEEP |
| 27 | plan-status | N/A (planning) | LOW | 🔀 MERGE → plan --status |
| 28 | plan-update | N/A (planning) | LOW | 🔀 MERGE → plan --update |

**Consolidation Opportunity:**
```yaml
# BEFORE: 3 plan commands
plan, plan-status, plan-update

# AFTER: 1 command with subcommands
plan [create|status|update]    # Default: create
```

**Net Impact:** 5 commands → 3 commands (40% reduction in category)

---

#### Category 6: Document Operations (4 commands) ✅ KEEP MOST

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 29 | create-doc {template} | create-doc.md | HIGH | ✅ KEEP |
| 30 | doc-out | N/A (output) | MED | ✅ KEEP (shared utility) |
| 31 | shard-doc {doc} {dest} | shard-doc.md | LOW | ✅ KEEP (unique function) |
| 32 | document-project | document-project.md | MED | ✅ KEEP |

**Recommendation:** Keep all 4 - document operations are core to orchestration.

---

#### Category 7: Story & Epic Creation (3 commands) 🔄 DELEGATE?

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 33 | brownfield-create-epic | brownfield-create-epic.md | MED | 🔄 Consider @pm delegation |
| 34 | brownfield-create-story | brownfield-create-story.md | MED | 🔄 Consider @sm delegation |
| 35 | create-next-story | create-next-story.md | HIGH | ✅ KEEP (workflow critical) |

**Analysis:**
- aios-master orchestrates workflows, so having these makes sense
- However, could delegate to @pm (epics) and @sm (stories)
- **USER DECISION REQUIRED:** Keep in master or delegate?

---

#### Category 8: Facilitation (3 commands) 🔄 DELEGATE

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 36 | facilitate-brainstorming | facilitate-brainstorming-session.md | MED | 🔄 DELEGATE → @analyst |
| 37 | advanced-elicitation | advanced-elicitation.md | HIGH | ✅ KEEP (core capability) |
| 38 | chat-mode | N/A (mode switch) | MED | ✅ KEEP (UX feature) |

**Recommendation:**
- Delegate `facilitate-brainstorming` to @analyst (Atlas) - ideation specialist
- Keep `advanced-elicitation` and `chat-mode` for master orchestrator

**Net Impact:** 3 commands → 2 commands (1 delegated)

---

#### Category 9: Utilities (2 commands) ⚠️ REVIEW

| # | Command | Usage | Decision | Rationale |
|---|---------|-------|----------|-----------|
| 39 | agent {name} | MED | ✅ KEEP | Agent info/delegation |
| 40 | party-mode | ZERO | ❌ REMOVE | Novelty, unused |

**Recommendation:** Remove `party-mode` - zero usage, novelty feature.

**Net Impact:** 2 commands → 1 command (50% reduction)

---

#### Category 10: Tools (4 commands) 🔄 MIXED

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 41 | generate-ai-prompt | generate-ai-frontend-prompt.md | LOW | 🔄 Consider @architect delegation |
| 42 | correct-course | correct-course.md | MED | ✅ KEEP (process governance) |
| 43 | index-docs | index-docs.md | LOW | ✅ KEEP (knowledge mgmt) |
| 44 | create-suite | create-suite.md | LOW | 🔄 Consider @qa delegation |

**Delegation Analysis:**
- `generate-ai-prompt` → @architect (technical specs)
- `create-suite` → @qa (test strategy)

**Net Impact:** 4 commands → 2 commands (2 delegated)

---

### aios-master Summary & Recommendations

**Current:** 44 commands
**Proposed Changes:**
- 🔀 Merge create-* and modify-* → Save 6 commands
- 🔀 Consolidate plan commands → Save 2 commands
- 🔀 Merge learn-patterns → Save 1 command
- ❌ Remove party-mode, workflow-guidance → Save 2 commands
- 🔄 Delegate 4 commands (brainstorming, generate-ai-prompt, create-suite) → Save 4 commands

**Target:** 44 - 15 = **29 commands** (34% reduction)

**Commands by Decision:**
- ✅ KEEP: 23 commands
- 🔀 MERGE INTO: 9 commands (becomes 3 consolidated)
- 🔄 DELEGATE: 4 commands
- ❌ REMOVE: 2 commands

---

## data-engineer Commands (31 total)

#### Universal Commands (6 commands) ✅ KEEP

| # | Command | Shared With | Usage | Decision |
|---|---------|-------------|-------|----------|
| 1 | help | All agents | UNIVERSAL | ✅ KEEP |
| 2 | guide | All agents | MED | ✅ KEEP |
| 3 | yolo | Some agents | MED | ✅ KEEP |
| 4 | exit | All agents | UNIVERSAL | ✅ KEEP |
| 5 | doc-out | Some agents | MED | ✅ KEEP (shared utility) |
| 6 | execute-checklist | Some agents | HIGH | ✅ KEEP |

---

#### Category 1: Architecture & Design (5 commands) ✅ KEEP ALL

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 7 | create-schema | db-domain-modeling.md | HIGH | ✅ KEEP |
| 8 | create-rls-policies | db-rls-policies.md | HIGH | ✅ KEEP |
| 9 | create-migration-plan | db-migration-plan.md | HIGH | ✅ KEEP |
| 10 | design-indexes | db-design-indexes.md | MED | ✅ KEEP |
| 11 | model-domain | db-domain-modeling.md | HIGH | ✅ KEEP |

**Recommendation:** Keep all - core DBA architecture functions.

---

#### Category 2: Operations & DBA (8 commands) ✅ KEEP ALL

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 12 | env-check | db-env-check.md | HIGH | ✅ KEEP (safety) |
| 13 | bootstrap | db-bootstrap.md | MED | ✅ KEEP (setup) |
| 14 | apply-migration | db-apply-migration.md | HIGH | ✅ KEEP (critical) |
| 15 | dry-run | db-dry-run.md | HIGH | ✅ KEEP (safety) |
| 16 | seed | db-seed.md | MED | ✅ KEEP |
| 17 | snapshot | db-snapshot.md | HIGH | ✅ KEEP (backup) |
| 18 | rollback | db-rollback.md | HIGH | ✅ KEEP (recovery) |
| 19 | smoke-test | db-smoke-test.md | MED | ✅ KEEP (validation) |

**Recommendation:** Keep all 8 - critical operations commands, no consolidation opportunity.

---

#### Category 3: Security & Performance (8 commands) 🔀 CONSOLIDATE

**Current Commands:**
| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 20 | rls-audit | db-rls-audit.md | HIGH | 🔀 MERGE → security-audit |
| 21 | policy-apply | db-policy-apply.md | HIGH | ✅ KEEP (action command) |
| 22 | impersonate | db-impersonate.md | MED | ✅ KEEP (test-as-user) |
| 23 | verify-order | db-verify-order.md | MED | ✅ KEEP (linting) |
| 24 | explain | db-explain.md | HIGH | 🔀 MERGE → analyze-performance |
| 25 | analyze-hotpaths | db-analyze-hotpaths.md | MED | 🔀 MERGE → analyze-performance |
| 26 | optimize-queries | TBD | MED | 🔀 MERGE → analyze-performance |
| 27 | audit-schema | db-schema-audit.md | MED | 🔀 MERGE → security-audit |

**Major Consolidation Opportunity:**

**Performance Commands (3→1):**
```yaml
# BEFORE: 3 separate performance commands
explain {sql}              # Single query analysis
analyze-hotpaths           # Common query analysis
optimize-queries           # Interactive optimization

# AFTER: 1 unified command
analyze-performance {type} [query]
# Types: query, hotpaths, interactive
# Example: *analyze-performance query "SELECT * FROM users WHERE id = $1"
# Example: *analyze-performance hotpaths
# Example: *analyze-performance interactive
```

**Security Audit Commands (2→1):**
```yaml
# BEFORE: 2 separate audit commands
rls-audit                  # RLS policy audit
audit-schema               # Schema quality audit

# AFTER: 1 unified command
security-audit {scope}
# Scopes: rls, schema, full
# Example: *security-audit rls
# Example: *security-audit schema
# Example: *security-audit full  # Both RLS + schema
```

**Net Impact:** 8 commands → 4 commands (50% reduction in category)

---

#### Category 4: Data Operations (2 commands) ✅ KEEP ALL

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 28 | load-csv | db-load-csv.md | MED | ✅ KEEP |
| 29 | run-sql | db-run-sql.md | HIGH | ✅ KEEP |

**Recommendation:** Keep both - essential data operations.

---

#### Category 5: Setup & Documentation (3 commands) ⚠️ REVIEW

| # | Command | Task File | Usage | Decision |
|---|---------|-----------|-------|----------|
| 30 | setup-supabase | db-supabase-setup.md | LOW | ⚠️ Consider docs only |
| 31 | research | create-deep-research-prompt.md | LOW | 🔄 DELEGATE → @analyst |

**Analysis:**
- `setup-supabase`: One-time command, rarely used after initial setup
- `research`: Research is @analyst domain, not DBA

**Net Impact:** 3 commands → 1-2 commands (1-2 delegated/removed)

---

### data-engineer Summary & Recommendations

**Current:** 31 commands
**Proposed Changes:**
- 🔀 Consolidate performance commands (3→1) → Save 2 commands
- 🔀 Consolidate security audit commands (2→1) → Save 1 command
- 🔄 Delegate `research` to @analyst → Save 1 command
- ⚠️ Consider removing `setup-supabase` (move to docs) → Save 1 command

**Target:** 31 - 5 = **26 commands** (16% reduction) - conservative
**Target:** 31 - 6 = **25 commands** (19% reduction) - aggressive (if setup-supabase removed)

**Commands by Decision:**
- ✅ KEEP: 24-25 commands
- 🔀 MERGE INTO: 5 commands (becomes 2 consolidated)
- 🔄 DELEGATE: 1 command
- ❌ REMOVE: 0-1 commands

---

## Usage Pattern Analysis

**NOTE:** Detailed usage counts require scanning entire codebase. Preliminary categorization uses these heuristics:

- **UNIVERSAL:** Core interface commands (help, exit) - always high usage
- **HIGH:** Used in ≥3 stories/workflows, critical path commands
- **MEDIUM:** Used in 1-2 stories/workflows, important but not critical
- **LOW:** Referenced in docs/templates, infrequent usage
- **ZERO:** No references found in quick scan

**Validation Needed:** Full grep-based usage counting for final recommendations.

---

## Command Dependency Mapping

### Cross-Agent Dependencies

**Commands Shared Across Agents:**
- `help`, `guide`, `exit` - Universal (all agents)
- `yolo` - aios-master, data-engineer, dev, qa
- `doc-out` - aios-master, data-engineer, pm
- `execute-checklist` - aios-master, data-engineer, dev

**Delegation Patterns Discovered:**
- `facilitate-brainstorming` → Should delegate to @analyst
- `create-suite` → Should delegate to @qa
- `generate-ai-prompt` → Should delegate to @architect
- `research` → Should delegate to @analyst

---

## Rationalization Priorities

### Phase 1: High Confidence (No Breaking Changes)
1. ✅ Merge create-* commands → `create {type}`
2. ✅ Merge modify-* commands → `modify {type}`
3. ✅ Remove `party-mode` (zero usage)
4. ✅ Consolidate data-engineer performance commands

### Phase 2: Medium Confidence (Requires Testing)
5. 🔀 Consolidate plan commands
6. 🔀 Consolidate security audit commands
7. 🔄 Delegate facilitation commands to @analyst

### Phase 3: Requires User Decision
8. ⚠️ Keep or delegate story/epic creation commands?
9. ⚠️ Remove `setup-supabase` or keep as command?
10. ⚠️ Rename `impersonate` → `test-as-user` for clarity?

---

## Impact Assessment

### Backward Compatibility

**Breaking Changes:** 0 (if aliases provided)
**Deprecated Commands:** 15-17 (with 6-month sunset plan)
**New Consolidated Commands:** 5-7

**Migration Strategy:**
- Phase 1 (v2.0): New commands available, old commands show deprecation warning
- Phase 2 (v2.5): Enhanced warnings, migration guide published
- Phase 3 (v3.0): Old commands removed (6 months after v2.0)

### Expected Benefits

**User Experience:**
- 30-35% fewer commands to learn (75 → 50-53)
- Clearer mental model (verb + type pattern)
- Reduced help text clutter

**Maintenance:**
- Fewer command handlers to maintain
- Clearer agent responsibilities
- Better delegation patterns

**Performance:**
- No impact (commands are lightweight)

---

## DECISION GATE 1 - APPROVED ✅

**Approval Date:** 2025-01-15
**Approved By:** User

### User Decisions

1. **aios-master Delegation:** ✅ **DELEGATE to @pm**
   - `brownfield-create-epic` → Delegate to @pm (Morgan)
   - `brownfield-create-story` → Delegate to @sm (River)
   - Rationale: Epic/story creation is PM responsibility, not orchestrator

2. **data-engineer Consolidation:** ✅ **APPROVED**
   - Performance commands merge (3→1): APPROVED
   - Security audit merge (2→1): APPROVED

3. **Removal Confirmation:** ✅ **REMOVE party-mode**
   - Purpose: "Group chat simulation with all agents" for retrospectives
   - Usage: ZERO references in codebase
   - Decision: Remove - novelty feature never adopted, better alternatives exist (@analyst brainstorming)

4. **research Command:** ✅ **KEEP in data-engineer**
   - Rationale: Contextualized technical research during DB tasks
   - Use case: Fetch PostgreSQL docs, performance patterns, RLS examples during design
   - Different from @analyst formal research (strategic/market)
   - Aligns with future ETL expansion (all agents get research tools, each specialized)

5. **setup-supabase:** ✅ **KEEP and ENHANCE**
   - Rename: `setup-supabase` → `setup-database`
   - Make database-agnostic (PostgreSQL, MongoDB, MySQL, Supabase, etc.)
   - Detect DB type from PRD/tech-stack/core-config
   - Decision: Keep as command (useful for new projects)

### Additional Decisions

6. **db-schema.md Context File:** ✅ **FOLLOW-UP WORK**
   - Registered as [STORY-6.1.2.3-F1] in Story Backlog
   - Implement database-agnostic schema tracking
   - Auto-created during shard prd/architecture
   - Auto-updated after migrations
   - Loaded via data-engineer alwaysdbload

### Final Approval Criteria

- ✅ Command counts validated (actual vs. story)
- ✅ Consolidation proposals reviewed and approved
- ✅ Delegation decisions made (delegate to @pm)
- ✅ No objections to removals (party-mode approved for removal)
- ✅ Ready to proceed to Responsibility Mapping (Task 2)

---

**Report Status:** ✅ APPROVED - Proceeding to Task 2
**Analyst:** Dex (Developer)
**Approved:** 2025-01-15
**Next Step:** Task 2 - Agent Responsibility Matrix
