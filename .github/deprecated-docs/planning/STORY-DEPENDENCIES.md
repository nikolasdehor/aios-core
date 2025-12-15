# AIOS 2.0 Story Dependencies

**Generated:** 2025-11-14

## 🔗 Dependency Analysis

This document maps all dependencies between the 36 stories to identify:
- Critical path (longest sequential chain)
- Blocking relationships
- Parallel execution opportunities

---

## 📊 Dependency Diagram

```mermaid
graph TD
    Start[AIOS 2.0 Master Epic] --> Wave1[Wave 1: Foundation]

    Wave1 --> E6_1[Epic 6.1: Agent Identity]
    Wave1 --> E6_2[Epic 6.2: MCP Docs]
    Wave1 --> E6_3[Epic 6.3: CodeRabbit]
    Wave1 --> E6_4[Epic 6.4: Partner Program]

    E6_1 --> S6_1_1[6.1.1: Personas]
    S6_1_1 --> S6_1_2[6.1.2: Agent Files]
    S6_1_1 --> S6_1_3[6.1.3: @docs Agent]
    S6_1_2 --> S6_1_4[6.1.4: Config]
    S6_1_4 --> S6_1_5[6.1.5: Testing]

    E6_2 --> S6_2_1[6.2.1: 1MCP Guide]
    E6_2 --> S6_2_2[6.2.2: Preset Guide]
    E6_2 --> S6_2_3[6.2.3: Case Study]
    S6_2_1 --> S6_2_4[6.2.4: Update Docs]
    S6_2_2 --> S6_2_4
    S6_2_3 --> S6_2_4

    E6_3 --> S6_3_1[6.3.1: CodeRabbit Setup]
    S6_3_1 --> S6_3_2[6.3.2: Docs Update]

    E6_4 --> S6_4_1[6.4.1: Legal]
    E6_4 --> S6_4_2[6.4.2: Onboarding]
    S6_4_1 --> S6_4_3[6.4.3: ClickUp]

    S6_1_5 --> Wave2[Wave 2: i18n]

    Wave2 --> E7[Epic 7: i18n Core]
    E7 --> S7_1[7.1: Structure]
    S7_1 --> S7_2[7.2: Detection]
    S7_2 --> S7_3[7.3: Extract EN]
    S7_3 --> S7_4[7.4: Rendering]
    S7_4 --> S7_5[7.5: Integration]

    S7_5 --> E8[Epic 8: PT-BR]
    E8 --> S8_1[8.1: Translation]
    S8_1 --> S8_2[8.2: Prompts]
    S8_2 --> S8_3[8.3: Review]
    S8_3 --> S8_4[8.4: Launch]

    S8_4 --> Wave3[Wave 3: Phased Open Source]

    Wave3 --> E9[Epic 9: Phase 0]
    E9 --> S9_1[9.1: Demo]
    S9_1 --> S9_2[9.2: Landing]
    S9_2 --> KS9{KILL SWITCH: >1K upvotes?}
    KS9 -->|YES| E10[Epic 10: Phase 1]
    KS9 -->|NO| ABORT1[ABORT: Refine]

    E10 --> S10_1[10.1: MCP Repo]
    S10_1 --> S10_2[10.2: Marketing]
    S10_2 --> KS10{KILL SWITCH: >200 stars?}
    KS10 -->|YES| E11[Epic 11: Phase 2]
    KS10 -->|NO| ABORT2[Iterate]

    E11 --> S11_1[11.1: Packs Repo]
    S11_1 --> S11_2[11.2: Community]
    S11_2 --> KS11{KILL SWITCH: >10 packs?}
    KS11 -->|YES| E12[Epic 12: Phase 3]
    KS11 -->|NO| ABORT3[Add Examples]

    E12 --> S12_1[12.1: Backup]
    S12_1 --> S12_2[12.2: Core Repo]
    S12_2 --> S12_3[12.3: npm Publish]
    S12_2 --> S12_5[12.5: CI/CD]
    S12_3 --> S12_4[12.4: Archive]
    S12_4 --> Done[Complete]

    style E6_1 fill:#90EE90
    style E6_2 fill:#90EE90
    style E6_3 fill:#90EE90
    style E6_4 fill:#90EE90
    style E7 fill:#FFD700
    style E8 fill:#FFD700
    style E9 fill:#FF6347
    style E10 fill:#FF6347
    style E11 fill:#FF6347
    style E12 fill:#FF6347
    style KS9 fill:#FF0000
    style KS10 fill:#FF0000
    style KS11 fill:#FF0000
```

---

## 🎯 Critical Path Analysis

The **critical path** is the longest sequence of dependent stories that determines minimum project duration.

### Critical Path (16.6 weeks parallel, 21.5 weeks sequential)

```
6.1.1 (2d) → 6.1.2 (3d) → 6.1.4 (2d) → 6.1.5 (2d) → 
7.1 (1d) → 7.2 (2d) → 7.3 (3d) → 7.4 (2d) → 7.5 (2d) → 
8.1 (2w) → 8.2 (1w) → 8.3 (1w) → 8.4 (3d) → 
9.1 (0.5d) → 9.2 (0.25d) → [validation] → 
10.1 (2d) → 10.2 (3d) → [validation] → 
11.1 (3d) → 11.2 (2d) → [validation] → 
12.1 (1w) → 12.2 (2w) → 12.3 (1w) → 12.4 (1w)
```

**Bottlenecks:**
- Story 6.1.3 (@docs Agent) is 3 weeks but doesn't block other stories after 6.1.1
- Epic 7 → Epic 8 dependency forces sequential execution (6 weeks)
- Wave 3 validation gates force sequential epics (8 weeks)

---

## 📋 Dependency Matrix

| Story | Prerequisites | Blocks | Can Parallelize With |
|-------|--------------|--------|---------------------|
| 6.1.1 | None | 6.1.2, 6.1.3 | 6.2.*, 6.3.*, 6.4.* |
| 6.1.2 | 6.1.1 | 6.1.4 | 6.1.3, 6.2.*, 6.3.*, 6.4.* |
| 6.1.3 | 6.1.1 | None | 6.1.2-6.1.5, 6.2.*, 6.3.*, 6.4.* |

*Matrix abbreviated for brevity. Full matrix available in stories-data.json.*

---

**Last Updated:** 2025-11-14
