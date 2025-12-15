# Agent Responsibility Matrix - Story 6.1.2.3

**Date:** 2025-01-15
**Analyst:** Dex (Developer)
**Story:** STORY-6.1.2.3 - Agent Command Rationalization
**Epic:** Epic-6.1 - Agent Identity System

---

## Executive Summary

This matrix clarifies responsibility boundaries for 4 agents that commonly cause user confusion: **architect**, **analyst**, **pm**, and **sm**.

### Key Findings

**Primary Confusion Points:**
1. **PRD Creation:** PM vs Analyst overlap
2. **Research:** Analyst vs Architect (market vs technical)
3. **Epic/Story Creation:** PM vs SM overlap
4. **Architecture:** PM strategy vs Architect technical
5. **Brainstorming:** Analyst facilitation vs PM

product management strategy

### Clear Delegation Pattern

```
Research Phase → @analyst (Atlas)
    ↓
Strategic Planning → @pm (Morgan)
    ↓
Technical Design → @architect (Aria)
    ↓
Story Breakdown → @sm (River)
    ↓
Implementation → @dev (Dex)
    ↓
Quality → @qa (Quinn)
    ↓
Deployment → @github-devops (Gage)
```

---

## Agent Boundary Definitions

### @architect (Aria) - Technical Design Authority

**Icon:** 🏛️ | **Archetype:** Visionary | **Zodiac:** ♐ Sagittarius

#### PRIMARY RESPONSIBILITIES

**System Architecture:**
- Fullstack, backend, frontend, infrastructure design
- Technology stack selection (from technical perspective)
- API design (REST, GraphQL, tRPC, WebSocket)
- Security architecture (authentication, authorization, encryption)
- Performance optimization across all layers
- Cross-cutting concerns (logging, monitoring, error handling)

**Technical Decisions:**
- Framework selection (React, Vue, Angular, etc.)
- Database technology (PostgreSQL, MongoDB - system level)
- Deployment architecture (cloud, serverless, containers)
- Service boundaries and integration patterns
- Caching strategies (application level)

#### DELEGATE TO OTHER AGENTS

**→ @analyst (Atlas) for:**
- Market research
- Competitive analysis
- User research
- Brainstorming sessions
- Project discovery (brownfield)

**→ @pm (Morgan) for:**
- PRD creation
- Product strategy
- Feature prioritization
- Roadmap planning
- Business requirements

**→ @data-engineer (Dara) for:**
- Database schema design (tables, relationships, indexes)
- Query optimization and performance tuning
- Data modeling (normalization, denormalization)
- RLS policies and database-specific optimizations
- ETL pipeline design

#### RETAINS FROM DATA LAYER

**Architect still owns:**
- Database technology selection (system perspective)
- Integration of data layer with application architecture
- Data access patterns and API design
- Caching strategy at application level

#### WHEN USER SHOULD CHOOSE @architect

**User Scenarios:**
- "How should I architect this system?"
- "What technology stack should I use?"
- "Design my API structure"
- "Review architecture for security vulnerabilities"
- "How do I scale this application?"
- "What's the best deployment strategy?"

**NOT for:**
- "Research market trends" → Use @analyst
- "Create PRD" → Use @pm
- "Design database schema" → Use @data-engineer

---

### @analyst (Atlas) - Strategic Research & Discovery

**Icon:** 🔍 | **Archetype:** Decoder | **Zodiac:** ♏ Scorpio

#### PRIMARY RESPONSIBILITIES

**Research & Analysis:**
- Market research and competitive landscape analysis
- User research and persona development
- Industry trends and emerging technologies
- Feasibility studies and opportunity assessment
- Project discovery (brownfield documentation)

**Ideation & Facilitation:**
- Brainstorming session facilitation
- Structured ideation workshops
- Creative exploration and divergent thinking
- Advanced elicitation for requirements gathering

**Documentation:**
- Project briefs
- Research reports
- Competitive analysis documents
- Market research findings

#### DELEGATE TO OTHER AGENTS

**→ @pm (Morgan) for:**
- Creating PRD from research findings
- Product strategy formation
- Feature prioritization decisions
- Roadmap planning

**→ @architect (Aria) for:**
- Technical architecture decisions
- Technology selection (technical evaluation)
- System design

**→ @sm (River) for:**
- Breaking down epics into stories
- Sprint planning
- Story refinement

#### WHEN USER SHOULD CHOOSE @analyst

**User Scenarios:**
- "Research the market for this idea"
- "Analyze our competitors"
- "Facilitate a brainstorming session"
- "Document our existing system" (brownfield)
- "What are the latest trends in [industry]?"
- "Help me explore different approaches"

**NOT for:**
- "Create PRD from this research" → Use @pm
- "Design the architecture" → Use @architect
- "Create stories for this feature" → Use @sm

---

### @pm (Morgan) - Product Strategy & Documentation

**Icon:** 📋 | **Archetype:** Strategist | **Zodiac:** ♑ Capricorn

#### PRIMARY RESPONSIBILITIES

**Product Documentation:**
- PRD creation (greenfield and brownfield)
- Epic creation and management
- Feature specifications
- Product briefs

**Product Strategy:**
- Product vision and strategy
- Feature prioritization (MoSCoW, RICE, etc.)
- Roadmap planning and timeline management
- Stakeholder communication
- Business case development

**Decision-Making:**
- Go/no-go decisions
- Scope definition
- Success metrics definition
- Risk assessment and mitigation

#### NEW RESPONSIBILITIES (from Gate 1 Decision)

**Epic/Story Creation (Delegated from aios-master):**
- `brownfield-create-epic` command
- `brownfield-create-story` command (will delegate actual story work to @sm)

Note: PM creates the *epic structure*, then delegates story creation to SM.

#### DELEGATE TO OTHER AGENTS

**→ @architect (Aria) for:**
- Technical architecture design
- Technology stack decisions (technical evaluation)
- System design and API design

**→ @analyst (Atlas) for:**
- Market research
- Competitive analysis
- User research
- Brainstorming facilitation

**→ @sm (River) for:**
- Story creation from PRD
- Story refinement and validation
- Sprint planning
- Backlog grooming

**→ @dev (Dex) for:**
- Technical feasibility assessment
- Implementation complexity estimation

#### WHEN USER SHOULD CHOOSE @pm

**User Scenarios:**
- "Create PRD for new feature"
- "Plan product roadmap"
- "Create epic structure"
- "Define product strategy"
- "Prioritize features for next quarter"
- "Write product specification"

**NOT for:**
- "Research market trends" → Use @analyst
- "Design architecture" → Use @architect
- "Create detailed user stories" → Use @sm (PM creates epic, SM creates stories)
- "Implement feature" → Use @dev

---

### @sm (River) - Story Crafting & Sprint Facilitation

**Icon:** 🌊 | **Archetype:** Facilitator | **Zodiac:** ♓ Pisces

#### PRIMARY RESPONSIBILITIES

**Story Management:**
- User story creation from PRD
- Story validation and completeness checking
- Acceptance criteria definition
- Story refinement and clarification
- Developer handoff preparation

**Sprint Planning:**
- Sprint backlog organization
- Capacity planning assistance
- Story point estimation facilitation
- Sprint goal definition

**Agile Facilitation:**
- Sprint ceremonies coordination
- Backlog grooming
- Retrospectives
- Daily standup facilitation

**Local Branch Management (Development Time):**
- Create feature branches (`git checkout -b feature/X.Y-story-name`)
- Switch branches (`git checkout branch-name`)
- List branches (`git branch`)
- Delete local branches (`git branch -d`)
- Local merges (`git merge`)

**CANNOT DO:** Push to remote, create PRs, delete remote branches → delegate to @github-devops

#### RECEIVES FROM OTHER AGENTS

**From @pm (Morgan):**
- PRD documents
- Epic structures
- Product requirements

**From @po (Pax):**
- Backlog priorities
- Acceptance criteria
- Business validation

#### DELEGATES TO OTHER AGENTS

**→ @dev (Dex):**
- Ready-for-development stories
- Implementation work

**→ @github-devops (Gage):**
- Push branches to remote
- Create pull requests
- Merge PRs
- Delete remote branches

#### WHEN USER SHOULD CHOOSE @sm

**User Scenarios:**
- "Create user story from this PRD"
- "Draft next story in sequence"
- "Validate story completeness"
- "Plan sprint backlog"
- "Break down this epic into stories"
- "Refine acceptance criteria"

**NOT for:**
- "Create PRD" → Use @pm
- "Research competitors" → Use @analyst
- "Design architecture" → Use @architect
- "Implement this story" → Use @dev
- "Push code to GitHub" → Use @github-devops

---

## Responsibility Matrix Table

| Scenario | Confused Between | Recommended Agent | Rationale |
|----------|------------------|-------------------|-----------|
| **Create PRD** | @pm vs @analyst | **@pm (Morgan)** | Product documentation is PM responsibility |
| **Market research** | @analyst vs @pm | **@analyst (Atlas)** | Research before strategy formation |
| **Competitive analysis** | @analyst vs @pm | **@analyst (Atlas)** | Research and analysis specialist |
| **Brainstorming** | @analyst vs @pm | **@analyst (Atlas)** | Ideation and facilitation specialist |
| **Technology selection (technical)** | @architect vs @pm | **@architect (Aria)** | Technical evaluation is Architect domain |
| **Technology selection (business)** | @architect vs @pm | **@pm (Morgan)** | Business case and cost analysis |
| **Create architecture** | @pm vs @architect | **@architect (Aria)** | Technical design is Architect domain |
| **Create epic** | @pm vs @sm | **@pm (Morgan)** | Epic structure is product strategy |
| **Create stories** | @pm vs @sm | **@sm (River)** | Story crafting is SM specialty |
| **Database schema design** | @architect vs @data-engineer | **@data-engineer (Dara)** | Database-specific design |
| **API design** | @architect vs @data-engineer | **@architect (Aria)** | Application architecture |
| **Performance optimization (app)** | @architect vs @data-engineer | **@architect (Aria)** | Application-level optimization |
| **Performance optimization (queries)** | @architect vs @data-engineer | **@data-engineer (Dara)** | Database-level optimization |
| **Project discovery (brownfield)** | @analyst vs @pm | **@analyst (Atlas)** | Research and documentation phase |
| **Create brownfield PRD** | @analyst vs @pm | **@pm (Morgan)** | Product doc creation (after analysis) |
| **Sprint planning** | @sm vs @pm | **@sm (River)** | Agile process facilitation |
| **Feature prioritization** | @sm vs @pm | **@pm (Morgan)** | Product strategy decision |

---

## User Journey Mapping

### Journey 1: New Feature Development (Greenfield)

```
Step 1: Research Phase
@analyst (Atlas) → *perform-market-research
Output: Market research document

Step 2: Competitive Analysis
@analyst (Atlas) → *create-competitor-analysis
Output: Competitive landscape analysis

Step 3: Product Strategy
@pm (Morgan) → *create-prd
Input: Research findings from @analyst
Output: Product Requirements Document (PRD)

Step 4: Technical Design
@architect (Aria) → *create-full-stack-architecture
Input: PRD from @pm
Output: Architecture document

Step 5: Story Breakdown
@sm (River) → *draft (create-next-story)
Input: PRD + Architecture
Output: User stories (sequenced)

Step 6: Implementation
@dev (Dex) → *develop story-X.Y.Z
Input: User story from @sm
Output: Working code

Step 7: Quality Validation
@qa (Quinn) → *review story-X.Y.Z
Input: Implemented code
Output: QA gate decision

Step 8: Deployment
@github-devops (Gage) → *push, *create-pr, *merge
Input: Approved code from @qa
Output: Code in production
```

**Clear Handoffs:**
- Analyst → PM: Research findings
- PM → Architect: PRD
- Architect + PM → SM: PRD + Architecture
- SM → Dev: Story files
- Dev → QA: Implemented code
- QA → DevOps: Approved changes

---

### Journey 2: Brownfield Project Documentation

```
Step 1: Existing System Discovery
@analyst (Atlas) → *document-project
Output: Project documentation, system understanding

Step 2: Create Brownfield PRD
@pm (Morgan) → *create-brownfield-prd
Input: Project documentation from @analyst
Output: PRD for existing project

Step 3: Create Brownfield Architecture
@architect (Aria) → *create-brownfield-architecture
Input: PRD + existing code analysis
Output: Architecture documentation

Step 4: Create Epic Structure
@pm (Morgan) → *create-epic
Input: PRD + Architecture
Output: Epic with phases

Step 5: Break into Stories
@sm (River) → *draft
Input: Epic from @pm
Output: User stories for improvements
```

**Clear Handoffs:**
- Analyst → PM: System documentation
- PM → Architect: Brownfield PRD
- PM + Architect → SM: Epic structure
- SM → Dev: Stories

---

### Journey 3: Database Design

```
Step 1: Product Requirements
@pm (Morgan) → Define data requirements in PRD
Output: Business data needs

Step 2: System Architecture (Data Layer)
@architect (Aria) → Define data access patterns, API design, caching
Output: Application-level data strategy

Step 3: Database Design
@data-engineer (Dara) → *create-schema, *design-indexes, *create-rls-policies
Input: PRD + Architecture
Output: Database schema, indexes, RLS policies

Step 4: Implementation
@dev (Dex) → Implement data layer (repository pattern, DAL)
@data-engineer (Dara) → Implement migrations
Output: Working database + application code
```

**Clear Boundaries:**
- @architect: Owns application-level data patterns
- @data-engineer: Owns database implementation
- @dev: Implements application code using architecture

---

## "Not My Role" Guidelines

### When to Say "Not My Role" (Each Agent)

**@architect (Aria):**
- ❌ "Create PRD" → Redirect to @pm
- ❌ "Research competitors" → Redirect to @analyst
- ❌ "Design database schema" → Redirect to @data-engineer
- ❌ "Create user stories" → Redirect to @sm

**@analyst (Atlas):**
- ❌ "Create PRD" → Redirect to @pm (can provide research inputs)
- ❌ "Design architecture" → Redirect to @architect
- ❌ "Make technology decision" → Redirect to @architect (technical) or @pm (business)
- ❌ "Create stories" → Redirect to @sm

**@pm (Morgan):**
- ❌ "Research market" → Redirect to @analyst (can request research)
- ❌ "Design architecture" → Redirect to @architect
- ❌ "Create detailed stories" → Redirect to @sm (PM creates epic, SM creates stories)
- ❌ "Implement feature" → Redirect to @dev

**@sm (River):**
- ❌ "Create PRD" → Redirect to @pm
- ❌ "Design architecture" → Redirect to @architect
- ❌ "Implement code" → Redirect to @dev
- ❌ "Push to GitHub" → Redirect to @github-devops

---

## Agent Selection Decision Tree

```
START: What do you need?

├─ Need to understand market/competitors?
│  └─ YES → @analyst (Atlas)
│     └─ Then need product strategy? → @pm (Morgan)
│
├─ Need product documentation (PRD/Epic)?
│  └─ YES → @pm (Morgan)
│     └─ Then need architecture? → @architect (Aria)
│
├─ Need technical design/architecture?
│  └─ YES → @architect (Aria)
│     └─ Need database design? → @data-engineer (Dara)
│
├─ Need user stories?
│  └─ YES → @sm (River)
│     └─ Need implementation? → @dev (Dex)
│
├─ Need code implementation?
│  └─ YES → @dev (Dex)
│     └─ Need quality review? → @qa (Quinn)
│
├─ Need deployment/PR?
│  └─ YES → @github-devops (Gage)
│
└─ Need brainstorming/ideation?
   └─ YES → @analyst (Atlas)
      └─ Then formalize ideas? → @pm (Morgan)
```

---

## Command Overlap Analysis

### Commands Appearing in Multiple Agents

| Command | Agents | Recommendation |
|---------|--------|----------------|
| `research` / `research-prompt` | @pm, @analyst, @data-engineer | ✅ KEEP in all - different contexts (product vs strategic vs technical) |
| `doc-out` | @pm, @analyst, @aios-master, @data-engineer | ✅ KEEP - shared utility command |
| `create-epic` | @pm (NEW from Gate 1) | ✅ KEEP - PM owns epic structure |
| `brownfield-create-epic` | @pm (NEW from Gate 1) | ✅ KEEP - PM responsibility |
| `brownfield-create-story` | @pm (NEW from Gate 1) | 🔄 DELEGATE to @sm after epic creation |
| `brainstorm` | @analyst only | ✅ CORRECT - ideation specialist |
| `facilitate-brainstorming` | @aios-master | 🔄 DELEGATE to @analyst (per Gate 1) |

### Resolved Overlaps (from Gate 1)

1. **Epic/Story Creation:**
   - BEFORE: Confusion between @aios-master, @pm, @sm
   - AFTER: @pm creates epic structure → @sm creates stories

2. **Brainstorming:**
   - BEFORE: @aios-master had `facilitate-brainstorming`
   - AFTER: Delegate to @analyst (facilitation specialist)

---

## Implementation Guidance

### Updating `whenToUse` Fields

**@architect (Aria):**
```yaml
whenToUse: |
  Use for system design, architecture documents, technology selection,
  API design, and infrastructure planning.

  NOT for: Market research (@analyst), PRDs (@pm), DB schema (@data-engineer)
```

**@analyst (Atlas):**
```yaml
whenToUse: |
  Use for market research, brainstorming, competitive analysis, creating
  project briefs, initial project discovery, and documenting existing
  projects (brownfield).

  NOT for: PRD creation (@pm), Architecture design (@architect), Stories (@sm)
```

**@pm (Morgan):**
```yaml
whenToUse: |
  Use for creating PRDs, product strategy, feature prioritization, epic
  creation, roadmap planning, and stakeholder communication.

  NOT for: Research (@analyst), Architecture (@architect), Stories (@sm)
```

**@sm (River):**
```yaml
whenToUse: |
  Use for story creation, epic management, sprint planning, backlog
  organization, and agile ceremony coordination.

  NOT for: PRD creation (@pm), Research (@analyst), Architecture (@architect)
```

---

## Validation Criteria

Before finalizing responsibility clarifications:

- [ ] **No responsibility gaps:** All scenarios covered by an agent
- [ ] **No overlaps:** Clear owner for each responsibility
- [ ] **Delegation patterns clear:** Agents know when to redirect
- [ ] **User journeys validated:** End-to-end flows work smoothly
- [ ] **whenToUse updated:** All 4 agents have clear guidance
- [ ] **Commands aligned:** No command conflicts across agents

---

## DECISION GATE 2 - APPROVED ✅

**Approval Date:** 2025-01-15
**Approved By:** User

### User Decisions

1. **Delegation Patterns:** ✅ **APPROVED**
   - architect → data-engineer delegation for DB design confirmed
   - @architect owns app-level data patterns
   - @data-engineer owns database implementation

2. **Epic/Story Split:** ✅ **APPROVED**
   - @pm creates epic structure
   - @sm breaks epic into detailed stories
   - Clear handoff pattern established

3. **Research Split:** ✅ **APPROVED**
   - @analyst: Strategic/market research
   - @data-engineer: Technical DB research
   - @architect: Technical evaluation
   - Each maintains research in their domain (no overlap)

4. **Brainstorming:** ✅ **APPROVED**
   - Move `facilitate-brainstorming` from @aios-master to @analyst
   - @analyst is ideation/facilitation specialist

### Final Approval Criteria

- ✅ Agent boundaries validated
- ✅ Delegation patterns approved
- ✅ User journey flows reviewed
- ✅ No objections to "Not My Role" guidelines
- ✅ Ready to proceed to aios-master command analysis (Task 3)

---

**Report Status:** ✅ APPROVED - Proceeding to Task 3
**Analyst:** Dex (Developer)
**Approved:** 2025-01-15
**Next Step:** Task 3 - aios-master Command Rationalization Plan
