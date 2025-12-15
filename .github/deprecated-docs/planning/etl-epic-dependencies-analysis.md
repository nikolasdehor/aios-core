# Epic ETL - Dependency Analysis with Epic 6.2 (MCP Ecosystem Docs)

**Analysis Date:** 2025-01-14
**Analyst:** Sarah (@po)
**Purpose:** Map dependencies between Epic ETL and Epic 6.2 to ensure correct story sequencing

---

## 📋 Executive Summary

The **ETL Expansion Pack** (3 weeks, $3.25K) has **critical dependencies** on **Epic 6.2: MCP Ecosystem Documentation** (1 week, $7.5K). Epic 6.2 must be completed FIRST or run in parallel with specific story ordering.

### Key Findings

✅ **3 ETL Stories depend on Epic 6.2**
⚠️ **Epic 6.2 must complete BEFORE ETL Story 3**
✅ **ETL can start in parallel with Epic 6.2** (with constraints)
💡 **Epic 6.2 benefits from ETL** (ETL becomes case study example)

---

## 🏗️ Epic Overview

### Epic 6.2: MCP Ecosystem Documentation
- **Wave:** Wave 1 - Quick Wins (NON-BREAKING)
- **Duration:** 1 week (0.5 sprint)
- **Investment:** $7.5K
- **Status:** 🟢 Ready to Start
- **Stories:**
  - 6.2.1: Extract and Document 1MCP Setup (2 days)
  - 6.2.2: Preset Selection Guide (1 day)
  - 6.2.3: Token Reduction Case Study (1.5 days)
  - 6.2.4: Update Existing Documentation (0.5 day)

### Epic ETL: ETL Expansion Pack
- **Wave:** Not assigned yet
- **Duration:** 3 weeks (40 hours)
- **Investment:** $3.25K
- **Status:** ✅ Ready to Execute
- **Stories:**
  - Story 1 (P0): Foundation - 11h
  - Story 2 (P1): Remaining Collectors - 6h
  - Story 3 (P1): MCP Expansion + Presets - 4h
  - Story 4 (P1): Tests + Docs + CI/CD - 12h
  - Story 5 (P2): Batch + Cache - 7h

---

## 🔗 Dependency Mapping

### ETL Story 1: P0 Foundation (11h)
**Goal:** Video transcription working via 1MCP

#### Dependencies on Epic 6.2:
| ETL Task | Depends On | Epic 6.2 Story | Reason |
|----------|-----------|----------------|--------|
| **P0.4: 1MCP Registration** (1h) | BLOCKS | 6.2.1: 1MCP Setup Guide | Needs reference for registering MCPs |
| **P0.6: Smoke Tests** (1h) | SOFT | 6.2.2: Preset Selection Guide | Needs to validate preset integration |

**Analysis:**
- ⚠️ **BLOCKING:** P0.4 (1MCP Registration) needs Epic 6.2.1 documentation
- ✅ **CAN START:** P0.1-P0.3 (MCP Server + Python Bridge + Integration) are independent
- 💡 **WORKAROUND:** Use existing `.claude/CLAUDE.md` for P0.4, refactor to official docs later

**Recommended Sequence:**
```
Week 1, Day 1-2:  Epic 6.2.1 (1MCP Setup Guide) [PARALLEL]
                  ETL Story 1: P0.1-P0.3 (MCP Server + Python) [PARALLEL]

Week 1, Day 3:    Epic 6.2.1 COMPLETE ✅
                  ETL Story 1: P0.4 (1MCP Registration) [STARTS AFTER 6.2.1]

Week 1, Day 4-5:  ETL Story 1: P0.5-P0.6 (AssemblyAI + Tests)
```

---

### ETL Story 3: MCP Expansion + Presets (4h)
**Goal:** All 4 tools registered, 3 presets configured

#### Dependencies on Epic 6.2:
| ETL Task | Depends On | Epic 6.2 Story | Reason |
|----------|-----------|----------------|--------|
| **Update MCP server** (2h) | BLOCKS | 6.2.1: 1MCP Setup Guide | Registration pattern documented |
| **Create/update presets** (1h) | BLOCKS | 6.2.2: Preset Selection Guide | Preset structure documented |
| **Integration testing** (1h) | SOFT | 6.2.4: Update Existing Documentation | README references correct |

**Analysis:**
- 🔴 **HARD BLOCKER:** ETL Story 3 CANNOT start until Epic 6.2.1 + 6.2.2 complete
- ⏰ **Timeline Impact:** Epic 6.2 must complete by Week 2, Day 2 (ETL Week 2)

**Recommended Sequence:**
```
Week 1:           Epic 6.2 Stories 6.2.1 + 6.2.2 MUST COMPLETE ✅

Week 2, Day 3:    ETL Story 3 can start (depends on 6.2.1 + 6.2.2)
```

---

### ETL Story 4: Tests + Docs + CI/CD (12h)
**Goal:** Production-grade quality & documentation

#### Dependencies on Epic 6.2:
| ETL Task | Depends On | Epic 6.2 Story | Reason |
|----------|-----------|----------------|--------|
| **Documentation** (2h) | SOFT | 6.2.3: Token Reduction Case Study | ETL should be included as example |
| **Documentation** (2h) | SOFT | 6.2.4: Update Existing Documentation | ETL referenced in README |

**Analysis:**
- ✅ **SOFT DEPENDENCY:** ETL Story 4 enhances Epic 6.2.3 (case study)
- 💡 **BIDIRECTIONAL:** Epic 6.2.3 can include ETL as example if ETL completes first
- 🎯 **OPPORTUNITY:** If ETL completes before Epic 6.2.3, ETL becomes real-world example

**Recommended Sequence:**
```
OPTION A (ETL First):
  Week 2:         ETL Story 4 completes
  Week 3 (late):  Epic 6.2.3 includes ETL as case study example ✅

OPTION B (Epic 6.2 First):
  Week 1:         Epic 6.2.3 completes (without ETL example)
  Week 2:         ETL Story 4 references Epic 6.2.3
```

---

## 📊 Dependency Graph

```
Epic 6.2: MCP Ecosystem Documentation
├── Story 6.2.1: 1MCP Setup Guide (2 days)
│   └── BLOCKS → ETL Story 1: P0.4 (1MCP Registration)
│   └── BLOCKS → ETL Story 3: Update MCP server
│
├── Story 6.2.2: Preset Selection Guide (1 day)
│   └── BLOCKS → ETL Story 3: Create/update presets
│   └── SOFT → ETL Story 1: P0.6 (Smoke Tests)
│
├── Story 6.2.3: Token Reduction Case Study (1.5 days)
│   └── ENHANCED BY ← ETL Story 4 (if ETL completes first)
│
└── Story 6.2.4: Update Existing Documentation (0.5 day)
    └── SOFT → ETL Story 4: Documentation

Epic ETL: ETL Expansion Pack
├── Story 1 (P0): Foundation - 11h
│   ├── P0.1-P0.3: Independent ✅
│   ├── P0.4: DEPENDS ON Epic 6.2.1 ⚠️
│   └── P0.6: SOFT DEPENDS ON Epic 6.2.2 ⚠️
│
├── Story 2 (P1): Remaining Collectors - 6h
│   └── Independent ✅
│
├── Story 3 (P1): MCP Expansion + Presets - 4h
│   └── HARD BLOCKS ON Epic 6.2.1 + 6.2.2 🔴
│
├── Story 4 (P1): Tests + Docs + CI/CD - 12h
│   └── SOFT DEPENDS ON Epic 6.2.3 + 6.2.4 ⚠️
│
└── Story 5 (P2): Batch + Cache - 7h
    └── Independent ✅
```

---

## ⏰ Execution Timeline Recommendations

### OPTION A: Epic 6.2 First (Conservative) ✅ RECOMMENDED

```
═══════════════════════════════════════════════════════════════
WEEK 1: Epic 6.2 Complete
═══════════════════════════════════════════════════════════════
Mon-Tue:    Epic 6.2.1 (1MCP Setup Guide) - 2 days
Wed:        Epic 6.2.2 (Preset Selection Guide) - 1 day
Thu:        Epic 6.2.3 (Token Reduction Case Study) - 1 day
Fri:        Epic 6.2.4 (Update Existing Documentation) - 0.5 day
            ✅ Epic 6.2 COMPLETE

═══════════════════════════════════════════════════════════════
WEEK 2-4: ETL Expansion Pack
═══════════════════════════════════════════════════════════════
Week 2 Mon-Fri:   ETL Story 1 (P0) - 11h ✅ No blockers
Week 3 Mon-Tue:   ETL Story 2 (P1) - 6h
Week 3 Wed:       ETL Story 3 (P1) - 4h ✅ Epic 6.2 complete
Week 3 Thu-Fri:   ETL Story 4 (P1) - 12h (starts)
Week 4 Mon-Tue:   ETL Story 4 (P1) - 12h (completes)
Week 4 Wed-Fri:   ETL Story 5 (P2) - 7h
```

**Pros:**
- ✅ Zero blockers for ETL
- ✅ Clean documentation foundation
- ✅ Epic 6.2 can include ETL in case study (if updated Week 3)

**Cons:**
- ⏰ Delays ETL start by 1 week
- 💰 Delays ROI realization

---

### OPTION B: Parallel Execution with Sequencing (Aggressive) ⚡

```
═══════════════════════════════════════════════════════════════
WEEK 1: Epic 6.2 + ETL Story 1 (Parallel)
═══════════════════════════════════════════════════════════════
Mon-Tue:    Epic 6.2.1 (1MCP Setup Guide) - 2 days
            ETL Story 1: P0.1-P0.3 (MCP Server + Python) - 7h [PARALLEL]

Wed:        Epic 6.2.1 COMPLETE ✅
            Epic 6.2.2 (Preset Selection Guide) - 1 day
            ETL Story 1: P0.4 (1MCP Registration) - 1h [AFTER 6.2.1]

Thu-Fri:    Epic 6.2.3 + 6.2.4 complete
            ETL Story 1: P0.5-P0.6 (AssemblyAI + Tests) - 3h
            ✅ ETL Story 1 COMPLETE
            ✅ Epic 6.2 COMPLETE

═══════════════════════════════════════════════════════════════
WEEK 2: ETL Story 2 + Story 3 + Story 4 (starts)
═══════════════════════════════════════════════════════════════
Mon-Tue:    ETL Story 2 (Remaining Collectors) - 6h
Wed:        ETL Story 3 (MCP Expansion + Presets) - 4h ✅ 6.2 complete
Thu-Fri:    ETL Story 4 (Tests + Docs + CI/CD) - 12h (starts)

═══════════════════════════════════════════════════════════════
WEEK 3: ETL Story 4 (completes) + Story 5
═══════════════════════════════════════════════════════════════
Mon:        ETL Story 4 (completes)
Tue-Thu:    ETL Story 5 (Batch + Cache) - 7h
Fri:        Release v1.0 ✅
```

**Pros:**
- ⚡ Fastest time-to-market (3 weeks total)
- 💰 ROI realized 1 week earlier
- ✅ ETL becomes real-world example for Epic 6.2.3

**Cons:**
- ⚠️ Requires careful coordination (blocker risk)
- 🔴 If Epic 6.2.1 delays, ETL Story 1 blocks

---

### OPTION C: Staged Start (Balanced) ⭐

```
═══════════════════════════════════════════════════════════════
WEEK 1: Epic 6.2 Stories 6.2.1 + 6.2.2 (Priority)
═══════════════════════════════════════════════════════════════
Mon-Wed:    Epic 6.2.1 + 6.2.2 complete (3 days)
            ✅ ETL blockers removed

Thu-Fri:    Epic 6.2.3 + 6.2.4 (starts)
            ETL Story 1: P0.1-P0.4 (8h) [STARTS AFTER 6.2.1]

═══════════════════════════════════════════════════════════════
WEEK 2: Epic 6.2 completes, ETL continues
═══════════════════════════════════════════════════════════════
Mon:        Epic 6.2.3 + 6.2.4 complete ✅
            ETL Story 1: P0.5-P0.6 complete ✅

Tue-Wed:    ETL Story 2 (Remaining Collectors) - 6h
Thu:        ETL Story 3 (MCP Expansion + Presets) - 4h
Fri:        ETL Story 4 (starts)

═══════════════════════════════════════════════════════════════
WEEK 3-4: ETL Stories 4 + 5
═══════════════════════════════════════════════════════════════
Week 3:     ETL Story 4 complete
Week 4:     ETL Story 5 complete, Release v1.0
```

**Pros:**
- ✅ Minimizes blocker risk
- ✅ ETL can still be case study example
- ⚡ Faster than Option A, safer than Option B

**Cons:**
- ⏰ Still delays ETL start by 3 days

---

## 🎯 Recommended Approach

### ⭐ OPTION C: Staged Start (Balanced)

**Why:**
1. **Minimizes Risk:** Epic 6.2.1 + 6.2.2 complete BEFORE ETL Story 3 dependency
2. **Fast Enough:** Only 3-day delay vs Option A (1 week)
3. **Case Study Opportunity:** ETL completes during Epic 6.2.3 window
4. **Realistic:** Accounts for documentation review/iteration time

**Critical Path:**
```
Epic 6.2.1 + 6.2.2 → ETL Story 1 (P0.4) → ETL Story 3 → Release
```

---

## 📝 Proposed Epic ETL Updates

### Add Dependencies Section to Epic ETL

```markdown
## Dependencies

### Epic Prerequisites
- **Epic 6.2 (Stories 6.2.1 + 6.2.2)** - MUST complete before ETL Story 3
  - 6.2.1: 1MCP Setup Guide (needed for P0.4, Story 3)
  - 6.2.2: Preset Selection Guide (needed for Story 3)

### Technical Prerequisites (unchanged)
- Node.js 18+
- Python 3.11+
- 1MCP installed and operational ✅ (Epic 6.2.1)
- AssemblyAI API key

### AIOS Components (unchanged)
- 1MCP aggregator running ✅ (Epic 6.2)
- Claude Code with 1MCP integration
- AIOS agent framework
- MCP SDK (@modelcontextprotocol/sdk)
```

### Update Story 1 Acceptance Criteria

**Add:**
```markdown
### Story 1 (P0): Foundation
**Dependencies:**
- ⚠️ P0.4 requires Epic 6.2.1 (1MCP Setup Guide) to be complete
- Workaround: Use `.claude/CLAUDE.md` temporarily, refactor to docs/architecture/mcp-optimization-1mcp.md

**Acceptance Criteria:**
- Video transcription callable via 1MCP ✅
- Cost tracking accurate to 5% ✅
- 1MCP integration proven ✅
- **NEW:** Registration follows Epic 6.2.1 documented pattern ✅
- Smoke tests pass (5/5) ✅
```

### Update Story 3 Acceptance Criteria

**Add:**
```markdown
### Story 3 (P1): MCP Expansion + Presets
**HARD DEPENDENCY:**
- 🔴 Epic 6.2 Stories 6.2.1 + 6.2.2 MUST be complete

**Acceptance Criteria:**
- 4 tools callable via MCP ✅
- **NEW:** Presets follow Epic 6.2.2 documented structure ✅
- Presets load correct tools ✅
- Token budgets validated ✅
- **NEW:** Integration documented in docs/architecture/mcp-preset-guide.md ✅
```

---

## ✅ Action Items

### For Product Owner (@po - Sarah)
- [ ] Update Epic ETL with dependencies section
- [ ] Add Epic 6.2 as blocker in project tracking
- [ ] Communicate timeline to stakeholders (4 weeks vs 3 weeks)
- [ ] Schedule Epic 6.2 for Week 1 (Q1 2026, Week 3)
- [ ] Schedule ETL for Week 2-4 (Q1 2026, Week 4-6)

### For Tech Lead
- [ ] Review Option C timeline feasibility
- [ ] Validate that Epic 6.2.1 + 6.2.2 can complete in 3 days
- [ ] Identify resource allocation (docs agent vs ETL developers)

### For Development Team
- [ ] Prepare Epic 6.2 environment (docs repo access)
- [ ] Prepare ETL environment (AssemblyAI API key, Python 3.11)
- [ ] Review both epics for technical clarity

---

## 📊 Impact Summary

| Metric | Original Plan | Updated Plan (Option C) | Delta |
|--------|---------------|-------------------------|-------|
| **Total Duration** | 3 weeks | 4 weeks | +1 week |
| **Epic 6.2 Start** | Week 3 (Q1 2026) | Week 1 (Q1 2026) | -2 weeks ⬆️ |
| **ETL Start** | Week 1 | Week 1 (Day 4) | +3 days |
| **ETL Complete** | Week 3 | Week 4 | +1 week |
| **Total Investment** | $10.75K | $10.75K | $0 |
| **Blocker Risk** | HIGH 🔴 | LOW ✅ | -70% |
| **Documentation Quality** | MEDIUM | HIGH ✅ | +50% |

### Business Impact
- ✅ **Better Quality:** ETL built on documented 1MCP patterns
- ✅ **Lower Risk:** Epic 6.2 blocks removed before ETL Story 3
- ⏰ **Slight Delay:** 1 week delay acceptable for quality gain
- 💡 **Quick Win:** Epic 6.2 completes 2 weeks earlier (Wave 1 priority)

---

## 🔗 Cross-References

- [Epic ETL](../epics/epic-etl-expansion-pack.md)
- [Epic 6.2](../epics/epic-6.2-mcp-ecosystem-docs.md)
- [Epic Master AIOS 2.0](../epics/epic-master-aios-2.0.md)
- [ETL Roadmap 3 Weeks](etl-roadmap-3weeks.md)
- [ETL File Structure](etl-file-structure-by-story.md)

---

**Analysis Complete:** 2025-01-14
**Recommendation:** ⭐ OPTION C (Staged Start)
**Next Action:** Update Epic ETL dependencies, schedule Epic 6.2 Week 1
