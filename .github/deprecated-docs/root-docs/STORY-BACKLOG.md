# Story Backlog

Centralized tracking for follow-up tasks, technical debt, and optimization opportunities identified during story reviews, development, and QA processes.

## Statistics

- **Total Items**: 19
- **Active Items**: 17 (2 promoted to stories)
- **Promoted to Stories**: 2
- **Completed Items**: 0
- **Last Updated**: 2025-12-05

## Backlog Items by Priority

### 🔴 HIGH Priority

#### [story-6.1.2.5-T1] Fix greeting-builder.js execution during agent activation ✅ RESOLVED
- **Source**: Story 6.1.2.5 QA Review (2025-11-16)
- **Priority**: 🔴 HIGH (CRITICAL BLOCKER - RESOLVED)
- **Effort**: 6-8 hours (completed in 2 hours)
- **Status**: ✅ COMPLETE (2025-11-16)
- **Assignee**: @qa (Quinn) - implemented Option A
- **Sprint**: Sprint 2 (URGENT)
- **Tags**: `blocker`, `agent-activation`, `architecture`, `greeting-system`, `investigated`
- **Investigation Findings (2025-11-16 - Quinn)**:
  - **Root Cause:** Claude Code slash commands are **PROMPT EXPANSION**, not **CODE EXECUTION**
  - **Implication:** ADR-001 Option B (Slash Command Wrapper) not viable as originally designed
  - **Slash Command Behavior:** `.claude/commands/*.md` files expand as prompts → Claude interprets as instructions → Claude executes via Bash/Read tools
  - **No Native JS Execution:** Cannot return values from JavaScript functions in slash commands
  - **Current Workaround:** Bash node -e with quote escaping (fragile, not production-ready)
- **Revised Options**:
  - **Option A (Recommended):** Inline YAML greeting logic in activation-instructions (verbose but reliable, no external deps)
  - **Option C (Alternative):** Pre-generate static greetings at build time (simple but loses dynamic context)
  - **Option Workaround:** Accept current Bash escaping approach (risky, maintenance burden)
- **Implementation Summary (Option A - Inline YAML Logic)**:
  - [x] User chose Option A (inline YAML greeting logic)
  - [x] Created inline greeting template (`.aios-core/templates/activation-instructions-inline-greeting.yaml`)
  - [x] Implemented in po.md test case - validated successfully ✅
  - [x] Applied to remaining 10 agents via batch script
  - [x] All 11 agents updated and synchronized to `.claude/commands/AIOS/agents/`
  - [x] Created backups (*.backup-pre-inline)
  - [x] Verified po agent activation (existing session scenario) ✅
  - [x] Documented architectural decision in Story 6.1.2.5
  - [ ] **Remaining:** Manual testing of AC2 (new session), AC4 (workflow), AC5 (git warning) → story-6.1.2.5-F1
- **Acceptance**: ✅ All agents successfully display contextual greetings with inline logic (po validated, others ready for testing)
- **Evidence**:
  - po.md and qa.md activation failures with quote syntax errors during manual node -e execution
  - Investigation confirmed slash commands cannot execute JavaScript natively
  - ADR-001 validation revealed incorrect assumption about execution model

---

#### [story-6.1.2.5-F1] Complete manual testing for contextual greetings
- **Source**: Story 6.1.2.5 QA Review (AC2-AC5)
- **Priority**: 🔴 HIGH
- **Effort**: 2 hours
- **Status**: ⏸️ BLOCKED (depends on story-6.1.2.5-T1)
- **Assignee**: User + @qa
- **Sprint**: Sprint 2
- **Tags**: `follow-up`, `testing`, `manual-validation`
- **Description**: Tasks 2.1-2.4 from Story 6.1.2.5 not performed - need user validation of 4 greeting scenarios after fixing BLOCKER issue. These manual tests are critical to verify contextual greeting system works in actual Claude Code sessions.
- **Success Criteria**:
  - [ ] Test AC2: New session shows full greeting (screenshot + verification)
  - [ ] Test AC3: Existing context shows quick greeting (screenshot + verification)
  - [ ] Test AC4: Workflow shows key commands + next steps (screenshot + verification)
  - [ ] Test AC5: Git warning displays correctly (screenshot + verification)
  - [ ] Document results in story QA Results section
- **Acceptance**: All 4 greeting scenarios validated with screenshots
- **Dependencies**: story-6.1.2.5-T1 must be resolved first

---

#### [story-6.1.2.6-T1] Add unit tests for decision-log-generator
- **Source**: Legacy Backlog Migration
- **Priority**: 🔴 HIGH
- **Effort**: 2 hours
- **Status**: ✅ PROMOTED TO STORY
- **Story Created**: [story-6.1.2.6.1](aios migration/story-6.1.2.6.1-add-unit-tests-decision-log-generator.md)
- **Assignee**: Backend Developer
- **Sprint**: Sprint 2
- **Tags**: `testing`, `decision-logging`
- **Description**: Create comprehensive unit tests for the decision-log-generator utility to ensure reliability and catch regressions early. This utility is used in yolo mode development for autonomous decision tracking.
- **Success Criteria**:
  - [ ] Test decision log initialization
  - [ ] Test decision recording with all metadata
  - [ ] Test file modifications tracking
  - [ ] Test metrics collection
  - [ ] Test log file generation and formatting
- **Acceptance**: All tests pass with >80% code coverage for decision-log-generator module

---

#### [story-6.1.2.6-F1] Complete decision log automation infrastructure
- **Source**: Story 6.1.2.6 Scan (AC2 Partial)
- **Priority**: 🔴 HIGH
- **Effort**: 4 hours
- **Status**: ✅ PROMOTED TO STORY
- **Story Created**: [story-6.1.2.6.2](aios migration/story-6.1.2.6.2-complete-decision-log-automation.md)
- **Assignee**: Backend Developer
- **Sprint**: Sprint 2
- **Tags**: `automation`, `decision-logging`, `infrastructure`
- **Description**: Complete the decision log automation feature. Infrastructure is ready but generator implementation was deferred. This enables automatic tracking of architectural decisions and technical choices made during development.
- **Success Criteria**:
  - [ ] Implement decision log generator
  - [ ] Integrate with yolo mode development workflow
  - [ ] Test decision capture across multiple development scenarios
  - [ ] Document usage in developer guide
  - [ ] Validate log format adheres to ADR standards
- **Acceptance**: Decision logs are automatically generated during development with complete metadata

---

---

### 🟡 MEDIUM Priority

#### [AIOS-DEVOPS-F1] Improve *create-pr Next Steps UX with PR monitoring option
- **Source**: User Feedback (Story 3.9 PR #21 - 2025-12-05)
- **Priority**: 🟡 MEDIUM
- **Effort**: 2 hours
- **Status**: 📋 TODO
- **Assignee**: Framework Developer
- **Sprint**: Sprint 4
- **Tags**: `ux`, `devops-agent`, `pr-workflow`, `user-feedback`
- **Description**: After `*create-pr` completes, the Next Steps section shows options that may appear as manual tasks for non-technical users. Should offer immediate PR monitoring as an actionable option, not just informational links.
- **Current Behavior**:
  ```
  Next Steps
  1. Review PR at: https://github.com/.../pull/21
  2. Merge when ready
  3. Mark Story X as Done
  ```
- **Proposed Enhancement**:
  ```
  Next Steps
  1. 📊 Monitor PR Review → type 1 or "*monitor-pr 21"
  2. 🔗 View PR: https://github.com/.../pull/21
  3. ✅ After approval, merge and mark story as Done
  ```
- **Success Criteria**:
  - [ ] Add `*monitor-pr {pr-number}` command to @devops
  - [ ] Update `*create-pr` output to show numbered actionable options
  - [ ] User can type "1" to immediately start monitoring
  - [ ] Clear distinction between actions and informational items
- **Acceptance**: Users can immediately trigger PR monitoring from *create-pr output with a single keystroke

---

#### [AIOS-AGENT-F1] Add *backlog-add command to @devops and @qa agents
- **Source**: User Feedback (Story 3.9 Review - 2025-12-05)
- **Priority**: 🟡 MEDIUM
- **Effort**: 3 hours
- **Status**: 📋 TODO
- **Assignee**: Framework Developer
- **Sprint**: Sprint 4
- **Tags**: `cross-agent`, `backlog`, `workflow`, `user-feedback`
- **Description**: During PR review or *pre-push, @devops and @qa often find issues (like Coverage Threshold failures, pre-existing test failures) that are NOT related to the current story. Currently, users must switch to @po to add these as Technical Debt. The `*backlog-add` command should be available directly from @devops and @qa.
- **Problem Statement**:
  - @devops finds coverage threshold 66% < 80% during PR review → unrelated to Story 3.9
  - @qa finds pre-existing test failures → should be tracked as tech debt
  - Currently requires: exit @devops → activate @po → *backlog-add → return to @devops
- **Proposed Enhancement**:
  - Add `*backlog-add` (or `*backlog-debt`) to @devops and @qa agents
  - Same functionality as @po's *backlog-add
  - Auto-tags items with source agent (e.g., "Source: @devops PR Review")
- **Success Criteria**:
  - [ ] Add `*backlog-add` command to devops.md agent definition
  - [ ] Add `*backlog-add` command to qa.md agent definition
  - [ ] Reuse existing po-backlog-add.md task
  - [ ] Auto-populate source field with agent context
  - [ ] Test cross-agent backlog item creation
- **Acceptance**: @devops and @qa can add backlog items without switching to @po

---

#### [AIOS-CI-T1] Fix Coverage Threshold and Pre-existing Test Failures
- **Source**: Story 3.9 PR #21 Review - @devops (2025-12-05)
- **Priority**: 🟡 MEDIUM
- **Effort**: 4 hours
- **Status**: 📋 TODO
- **Assignee**: Backend Developer
- **Sprint**: Sprint 4
- **Tags**: `technical-debt`, `ci`, `testing`, `coverage`
- **Description**: CI pipeline fails on coverage threshold (66% < 80%) and has 2 pre-existing failing test suites. This blocks ALL PRs regardless of their specific changes. Issue discovered during Story 3.9 PR review.
- **Problem Statement**:
  - Coverage: 66.45% vs 80% threshold
  - `tests/unit/wizard/ide-config-generator.test.js` - ENOENT error
  - `tests/installer/v21-path-validation.test.js` - Empty test suite
  - 1448/1451 tests pass (99.8%), but CI reports failure
- **Proposed Fix Options**:
  1. Fix the 2 broken test files
  2. Adjust coverage threshold to realistic value (70%)
  3. Exclude broken tests from CI run temporarily
- **Success Criteria**:
  - [ ] Fix `ide-config-generator.test.js` ENOENT error
  - [ ] Remove or fix empty `v21-path-validation.test.js`
  - [ ] CI pipeline passes without coverage warnings
  - [ ] All 1451 tests pass (0 failures)
- **Acceptance**: CI pipeline passes cleanly for all PRs

---

#### [story-6.1.2.5-F1] Update remaining 9 agents with command visibility metadata
- **Source**: Story 6.1.2.5 Scan (Future Improvements)
- **Priority**: 🟡 MEDIUM
- **Effort**: 6 hours
- **Status**: 📋 TODO
- **Assignee**: Framework Developer
- **Sprint**: Sprint 2
- **Tags**: `agent-config`, `command-visibility`, `phase-2`
- **Description**: Phase 2 rollout of command visibility metadata to remaining 9 agents. 2 agents were updated in Story 6.1.2.5, but 9 more need the visibility metadata to support contextual command display.
- **Success Criteria**:
  - [ ] Audit all agent files to identify missing visibility metadata
  - [ ] Add visibility: [full, quick, key] to each command
  - [ ] Test contextual greeting with updated agents
  - [ ] Validate command filtering works correctly
  - [ ] Update agent config documentation
- **Acceptance**: All 11 agents have complete command visibility metadata and contextual greetings work

---

#### [story-6.1.2.6-F2] Complete story index and backlog formalization
- **Source**: Story 6.1.2.6 Scan (AC3 Partial)
- **Priority**: 🟡 MEDIUM
- **Effort**: 3 hours
- **Status**: 📋 TODO
- **Assignee**: Product Owner
- **Sprint**: Sprint 2
- **Tags**: `documentation`, `backlog`, `story-index`
- **Description**: Complete the story index and backlog formalization feature that was partially implemented in Story 6.1.2.6. Infrastructure exists but full implementation was deferred.
- **Success Criteria**:
  - [ ] Verify story index script works across all epics
  - [ ] Test backlog manager with all item types (F, T, O)
  - [ ] Add completion percentage calculation per epic
  - [ ] Update documentation with usage examples
  - [ ] Integration test with ClickUp sync
- **Acceptance**: Story index and backlog tools are production-ready and documented

---

### 🟢 LOW Priority

#### [story-6.1.2.5-O1] Add custom command visibility categories
- **Source**: Story 6.1.2.5 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 4 hours
- **Status**: 💡 IDEA
- **Assignee**: Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `command-visibility`, `customization`
- **Description**: Extend command visibility system beyond [full, quick, key] to support custom categories. This would allow teams to define their own command groupings based on workflow or expertise level.
- **Success Criteria**:
  - [ ] Design custom category schema
  - [ ] Update command visibility parser
  - [ ] Add category configuration to core-config.yaml
  - [ ] Test with custom categories
  - [ ] Update documentation
- **Acceptance**: Teams can define and use custom command visibility categories

---

#### [story-6.1.2.5-O2] Add user-specific workflow pattern overrides
- **Source**: Story 6.1.2.5 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 5 hours
- **Status**: 💡 IDEA
- **Assignee**: Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `workflow`, `customization`
- **Description**: Allow users to override default workflow patterns with their own custom patterns. This enables personalized workflow suggestions based on individual preferences.
- **Success Criteria**:
  - [ ] Design user-specific pattern override system
  - [ ] Create user config file format (.aios/user-workflows.yaml)
  - [ ] Implement pattern merge logic (user patterns override defaults)
  - [ ] Add validation for custom patterns
  - [ ] Test pattern priority system
- **Acceptance**: Users can define custom workflow patterns that override defaults

---

#### [story-6.1.2.5-O3] Implement dynamic workflow learning
- **Source**: Story 6.1.2.5 Scan (Nice to Have + Future Improvements)
- **Priority**: 🟢 LOW
- **Effort**: 12 hours
- **Status**: 💡 IDEA
- **Assignee**: ML Engineer / Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `ml`, `workflow`, `learning`
- **Description**: Context detection that learns from user behavior over time. System observes command patterns and suggests optimizations based on historical usage.
- **Success Criteria**:
  - [ ] Design learning algorithm (simple pattern matching or ML-based)
  - [ ] Implement usage tracking system
  - [ ] Create pattern detection engine
  - [ ] Build suggestion refinement logic
  - [ ] Privacy considerations for usage data
  - [ ] User opt-in/opt-out mechanism
- **Acceptance**: System suggests workflow improvements based on observed command patterns

---

#### [story-6.1.2.6-O1] Add visual dashboard for performance metrics
- **Source**: Story 6.1.2.6 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 8 hours
- **Status**: 💡 IDEA
- **Assignee**: Frontend Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `performance`, `visualization`, `dashboard`
- **Description**: Create visual dashboard to display agent load times, cache hit rates, and other performance metrics tracked by performance-tracker.js.
- **Success Criteria**:
  - [ ] Design dashboard UI (web-based or terminal-based)
  - [ ] Integrate with performance-tracker.js metrics
  - [ ] Add real-time metric updates
  - [ ] Include historical trend graphs
  - [ ] Export metrics to CSV/JSON
- **Acceptance**: Performance metrics are visually accessible via dashboard

---

#### [story-6.1.2.6-O2] Add hot reload for config changes
- **Source**: Story 6.1.2.6 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 6 hours
- **Status**: 💡 IDEA
- **Assignee**: Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `dx`, `config`, `hot-reload`
- **Description**: Enable hot reload for core-config.yaml changes without restarting Claude Code. This improves developer experience during framework configuration.
- **Success Criteria**:
  - [ ] Implement file watcher for core-config.yaml
  - [ ] Add config reload mechanism
  - [ ] Invalidate affected caches on reload
  - [ ] Add reload confirmation message
  - [ ] Handle reload errors gracefully
- **Acceptance**: Config changes take effect without restarting Claude Code

---

#### [story-6.1.4-O1] Add greeting preview command
- **Source**: Story 6.1.4 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 2 hours
- **Status**: 💡 IDEA
- **Assignee**: Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `dx`, `greeting`, `preview`
- **Description**: Add CLI command to preview agent greetings with different preference settings before applying them.
- **Success Criteria**:
  - [ ] Implement `aios config preview greeting <preference>` command
  - [ ] Show greeting for all preference levels
  - [ ] Display comparison view
  - [ ] Add agent selection option
- **Acceptance**: Users can preview greetings before changing preference

---

#### [story-6.1.4-O2] Add preference history tracking
- **Source**: Story 6.1.4 Scan (Nice to Have)
- **Priority**: 🟢 LOW
- **Effort**: 3 hours
- **Status**: 💡 IDEA
- **Assignee**: Framework Developer
- **Sprint**: Unscheduled
- **Tags**: `enhancement`, `analytics`, `preferences`
- **Description**: Track user preference changes over time to understand usage patterns and provide rollback capability.
- **Success Criteria**:
  - [ ] Create preference history log
  - [ ] Track changes with timestamps
  - [ ] Add `aios config history` command
  - [ ] Implement rollback to previous preference
  - [ ] Add analytics on preference trends
- **Acceptance**: Preference change history is tracked and accessible

---

#### [story-6.1.6-O1] Replace console.warn with proper logger
- **Source**: Story 6.1.6 QA Review (2025-11-16)
- **Priority**: 🟢 LOW
- **Effort**: 2 hours
- **Status**: 📋 TODO
- **Assignee**: Backend Developer
- **Sprint**: Sprint 3
- **Tags**: `enhancement`, `logging`, `code-quality`
- **Description**: Replace console.warn statements in output-formatter.js with proper logger (winston or similar) for better log management in production. Currently 6 console.warn statements provide diagnostic information but lack filtering and production-grade log management capabilities.
- **Success Criteria**:
  - [ ] Install and configure winston or similar logging library
  - [ ] Replace all console.warn calls in output-formatter.js
  - [ ] Add log level configuration (debug, info, warn, error)
  - [ ] Test logging in development and production modes
  - [ ] Update documentation for logging configuration
- **Acceptance**: All diagnostic logging uses proper logger with configurable log levels
- **References**: 
  - File: `.aios-core/scripts/output-formatter.js` (lines 46, 54, 63, 76, 134, 139)
  - QA Gate: `docs/qa/gates/6.1.6-output-formatter-implementation.yml`

---

#### [story-6.1.6-O2] Set up isolated coverage report for formatter module
- **Source**: Story 6.1.6 QA Review (2025-11-16)
- **Priority**: 🟢 LOW
- **Effort**: 1 hour
- **Status**: 📋 TODO
- **Assignee**: Backend Developer
- **Sprint**: Sprint 3
- **Tags**: `enhancement`, `testing`, `metrics`
- **Description**: Set up isolated coverage report generation for the output formatter module to quantify test coverage percentage. Currently coverage is estimated at ≥85% based on test analysis, but exact metrics would improve visibility into code quality.
- **Success Criteria**:
  - [ ] Configure Jest to generate coverage reports for formatter module
  - [ ] Create npm script for isolated coverage run
  - [ ] Set up coverage thresholds (≥80% target)
  - [ ] Add coverage badge to documentation
  - [ ] Document coverage reporting process
- **Acceptance**: Coverage reports generate successfully and show quantified metrics for formatter module
- **References**:
  - Test Files: `tests/unit/output-formatter.test.js`, `tests/integration/formatter-integration.test.js`
  - Source Files: `.aios-core/scripts/output-formatter.js`, `.aios-core/scripts/validate-output-pattern.js`
  - QA Gate: `docs/qa/gates/6.1.6-output-formatter-implementation.yml`

---

## Item Status Legend

- 📋 **TODO**: Not started
- 🚧 **IN PROGRESS**: Currently being worked on
- ⏸️ **BLOCKED**: Waiting on dependency
- ✅ **DONE**: Completed and verified
- 💡 **IDEA**: Proposed but not yet approved
- ❌ **CANCELLED**: Decided not to implement

## How to Add Items

Use the following commands from respective agents:

**QA Agent (@qa)**:
```bash
*backlog-add {story-id} {type} {priority} {title}
# Example: *backlog-add STORY-013 F HIGH "Install Jest+ESM transformer"
```

**Dev Agent (@dev)**:
```bash
*backlog-debt {title}
# Automatically adds technical debt with priority prompt
```

**PO Agent (@po)**:
```bash
*backlog-review              # Generate sprint planning review
*backlog-summary             # Quick status summary
*backlog-prioritize {item}   # Re-prioritize item
*backlog-schedule {item}     # Assign to sprint
```

## Item Types

- **F** = Follow-up (from QA reviews, incomplete work)
- **O** = Optimization (performance, refactoring opportunities)
- **T** = Technical Debt (shortcuts taken, missing tests, etc.)

---

*Backlog initialized: 2025-11-16*
*Story Backlog Management - Story 6.1.2.6*
