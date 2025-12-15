# Tools System Migration Guide: v1.0 → v2.0

## Overview

This guide helps you upgrade AIOS tool definitions from v1.0 (simple) to v2.0 (complex) when additional capabilities are needed. The migration is **opt-in** - v1.0 tools continue to work unchanged with **zero breaking changes**.

## When to Migrate

### Stay on v1.0 When:

✅ **Your tool is simple** - Basic MCP/CLI wrapper, no complex logic
✅ **No API quirks** - API is consistent, well-documented
✅ **No validation needed** - Arguments are straightforward
✅ **Basic examples sufficient** - Success cases cover usage

**Examples that should stay v1.0:**
- Exa search (simple API, no quirks)
- GitHub CLI wrapper (pass-through commands)
- Docker CLI (standard command interface)

### Migrate to v2.0 When:

✅ **Complex API quirks** - Different formats for create vs update (e.g., ClickUp assignees)
✅ **Validation required** - Pre-execution checks prevent errors
✅ **Reusable helpers needed** - Data transformation logic used multiple times
✅ **Common mistakes exist** - Anti-patterns need documentation
✅ **Complex examples needed** - 4 scenarios (success, validation error, API error, edge case)

**Examples that should be v2.0:**
- ClickUp (quirky API, complex custom fields)
- Stripe (amount formatting, validation rules)
- Custom internal APIs with known edge cases

## Auto-Detection Behavior

### How It Works

If you **omit `schema_version`**, the system auto-detects based on features:

```javascript
// Auto-detection logic
const isV2 =
  !!tool.executable_knowledge ||
  !!tool.api_complexity ||
  !!tool.anti_patterns ||
  hasEnhancedExamples(tool.examples);

return isV2 ? 2.0 : 1.0; // Default to v1.0
```

### Detection Examples

**Detected as v1.0:**
```yaml
tool:
  # No schema_version
  id: exa
  type: mcp
  name: Exa Search
  # Simple structure → v1.0
```

**Detected as v2.0:**
```yaml
tool:
  # No schema_version
  id: clickup
  executable_knowledge:  # ← Triggers v2.0 detection
    validators: [...]
  # Has v2.0 features → v2.0
```

**Explicit v2.0:**
```yaml
tool:
  schema_version: 2.0  # ← Explicit
  # Rest of definition
```

## Backward Compatibility Guarantees

### ✅ Zero Breaking Changes

1. **v1.0 tools work unchanged** - No modifications required
2. **Auto-detection safe** - v1.0 tools stay v1.0
3. **Gradual migration** - Upgrade one tool at a time
4. **Agents unaffected** - Tool dependency syntax unchanged
5. **No performance impact** - v1.0 tools keep same performance

### ✅ Optional Features

All v2.0 features are **optional additive enhancements**:
- `executable_knowledge` - Optional
- `api_complexity` - Optional
- `anti_patterns` - Optional
- Enhanced examples - Optional

**You can add just what you need.**

## Migration Steps

### Step 1: Add Schema Version (Optional but Recommended)

```yaml
tool:
  schema_version: 2.0  # ← Add this
  id: my-tool
  type: mcp
  name: My Tool
  version: 1.0.0
  description: Tool description
```

**Why explicit is better:**
- Clear intent - readers know this is a complex tool
- Prevents accidental downgrade
- Better for documentation

### Step 2: Add Executable Knowledge (As Needed)

#### Add Validators

**When:** You need pre-execution validation to prevent errors

```yaml
executable_knowledge:
  validators:
    - id: validate-my-command
      validates: create_item
      language: javascript
      checks:
        - required_fields: [name, type]
      function: |
        function validateCommand(args) {
          const errors = [];

          // Business logic validation
          if (args.args.amount < 100) {
            errors.push("amount must be >= 100");
          }

          return {
            valid: errors.length === 0,
            errors: errors
          };
        }
        module.exports = { validateCommand };
```

**Performance Target:** < 50ms execution, 500ms timeout

#### Add Helpers

**When:** You have reusable data transformation logic

```yaml
executable_knowledge:
  helpers:
    - id: extract-custom-field
      language: javascript
      runtime: isolated_vm
      function: |
        function extractField(args) {
          const { data, fieldName } = args;

          // Extract logic
          return data.custom_fields?.find(f => f.name === fieldName);
        }
        module.exports = { extractField };
```

**Performance Target:** < 1s execution, 1000ms timeout

### Step 3: Document API Complexity (If Applicable)

#### Add Payload Schemas

**When:** API has multiple payload formats (webhooks, variants)

```yaml
api_complexity:
  payload_schemas:
    - type: standard
      detection: "event field exists"
      payload_path: "body.payload"

    - type: webhook_variant
      detection: "webhook_id field"
      payload_path: "data.webhook.payload"
```

#### Add Field Mappings

**When:** Custom fields have complex structures

```yaml
api_complexity:
  field_mappings:
    custom_fields:
      location:
        structure:
          location: {lat: number, lng: number}
          formatted_address: string
        extraction: helpers.extract-custom-field
```

#### Document API Quirks

**When:** API has known inconsistencies

```yaml
api_complexity:
  api_quirks:
    - quirk: assignee_format_mismatch
      description: "Create API expects [123], Update expects {add: [123]}"
      impact: "Runtime errors if wrong format used"
      mitigation: "Use command-specific validators"
```

### Step 4: Add Anti-Patterns (Recommended)

**When:** Common mistakes exist in API usage

```yaml
anti_patterns:
  - pattern: wrong_assignee_format
    description: "Using update format in create API"
    category: api_usage
    wrong: |
      create_task({
        assignees: {add: [456]}  // ❌ Wrong format
      })
    correct: |
      create_task({
        assignees: [456]         // ✅ Correct format
      })
    rationale: "Create API expects array, not object"
```

**Categories:**
- `api_usage` - Incorrect API usage
- `validation` - Missing validation
- `error_handling` - Improper error handling
- `performance` - Performance issues
- `security` - Security vulnerabilities

### Step 5: Enhance Examples (Optional)

Expand from basic examples to 4-scenario format:

```yaml
examples:
  create_task:
    - scenario: success
      description: "Standard successful creation"
      input:
        name: "New Task"
        assignees: [123]
      output:
        id: "task-456"
        status: "created"

    - scenario: failure_invalid_param
      description: "Missing required parameter"
      input:
        assignees: [123]
        # name missing
      error:
        code: VALIDATION_ERROR
        message: "name is required"

    - scenario: failure_api_error
      description: "API rate limit"
      input:
        name: "Task"
        assignees: [123]
      error:
        code: API_ERROR
        message: "Rate limit exceeded"

    - scenario: edge_case_format_mismatch
      description: "Assignee format quirk"
      input:
        name: "Task"
        assignees: {add: [123]}  # Wrong format
      error:
        code: FORMAT_ERROR
        message: "Expected array, got object"
      mitigation: "Use validators.validate-assignee-format"
```

## Migration Checklist

### Pre-Migration

- [ ] Review tool for complexity indicators:
  - [ ] API quirks or inconsistencies?
  - [ ] Validation logic needed?
  - [ ] Common user mistakes?
  - [ ] Complex data transformations?

- [ ] Decide which v2.0 features to add:
  - [ ] Validators (pre-execution checks)?
  - [ ] Helpers (data transformation)?
  - [ ] API complexity documentation?
  - [ ] Anti-patterns library?
  - [ ] Enhanced examples?

### During Migration

- [ ] **Step 1:** Add `schema_version: 2.0`
- [ ] **Step 2:** Add executable_knowledge (if needed)
  - [ ] Validators with < 50ms target
  - [ ] Helpers with < 1s target
  - [ ] Test in isolated-vm sandbox
- [ ] **Step 3:** Document API complexity (if applicable)
  - [ ] Payload schemas
  - [ ] Field mappings
  - [ ] API quirks with mitigations
- [ ] **Step 4:** Add anti-patterns (recommended)
  - [ ] Document common mistakes
  - [ ] Provide correct examples
- [ ] **Step 5:** Enhance examples to 4 scenarios

### Post-Migration

- [ ] Test tool resolution: `await toolResolver.resolveTool('my-tool')`
- [ ] Verify schema_version: `console.log(tool.schema_version)` → `2.0`
- [ ] Test validators: `await validator.validate('command', args)`
- [ ] Test helpers: `await executor.execute('helper-id', args)`
- [ ] Update documentation if needed
- [ ] Update agent dependencies (no changes needed, but verify)

## Complete Migration Example

### Before (v1.0)

```yaml
tool:
  id: clickup
  type: mcp
  name: ClickUp
  version: 1.0.0
  description: ClickUp project management

  commands:
    - create_task
    - update_task

  mcp_specific:
    server_command: npx -y @modelcontextprotocol/server-clickup
    transport: stdio
```

**Issues:**
- No validation (assignee format errors common)
- No custom field extraction (repetitive code)
- No quirk documentation (developers make mistakes)

### After (v2.0)

```yaml
tool:
  schema_version: 2.0
  id: clickup
  type: mcp
  name: ClickUp
  version: 1.0.0
  description: ClickUp project management with validation
  knowledge_strategy: executable

  commands:
    - create_task
    - update_task

  executable_knowledge:
    validators:
      - id: validate-assignee-format
        validates: create_task
        language: javascript
        checks:
          - required_fields: [name]
        function: |
          function validateCommand(args) {
            const errors = [];

            // Validate assignees format
            if (args.args.assignees &&
                typeof args.args.assignees === 'object' &&
                !Array.isArray(args.args.assignees)) {
              errors.push("assignees must be array for create_task, got object");
            }

            return {
              valid: errors.length === 0,
              errors: errors
            };
          }
          module.exports = { validateCommand };

    helpers:
      - id: extract-custom-field
        language: javascript
        runtime: isolated_vm
        function: |
          function extractField(args) {
            const { response, fieldName } = args;
            return response.custom_fields?.find(f => f.name === fieldName);
          }
          module.exports = { extractField };

  api_complexity:
    field_mappings:
      custom_fields:
        assignees:
          structure:
            create_format: [user_id]
            update_format: {add: [user_id], rem: [user_id]}
          note: "Different formats for create vs update"

    api_quirks:
      - quirk: assignee_format_mismatch
        description: "Create API expects [123], Update expects {add: [123]}"
        impact: "Runtime errors if wrong format used"
        mitigation: "Use validators.validate-assignee-format"

  anti_patterns:
    - pattern: wrong_assignee_format
      description: "Using update format in create API"
      category: api_usage
      wrong: |
        create_task({
          assignees: {add: [456]}
        })
      correct: |
        create_task({
          assignees: [456]
        })
      rationale: "Create API expects array, not object"

  examples:
    create_task:
      - scenario: success
        input: {name: "Task", assignees: [123]}
        output: {id: "456", status: "created"}

      - scenario: failure_invalid_param
        input: {assignees: [123]}
        error: {code: VALIDATION_ERROR, message: "name is required"}

      - scenario: edge_case_format_mismatch
        input: {name: "Task", assignees: {add: [123]}}
        error: {code: FORMAT_ERROR, message: "Expected array"}
        mitigation: "Use validators.validate-assignee-format"

  mcp_specific:
    server_command: npx -y @modelcontextprotocol/server-clickup
    transport: stdio
```

**Benefits:**
- ✅ 80%+ error prevention via validators
- ✅ Reusable custom field extraction
- ✅ Documented quirks (developers avoid mistakes)
- ✅ Comprehensive examples (4 scenarios)

## Testing After Migration

### 1. Test Auto-Detection

```javascript
const toolResolver = require('../common/utils/tool-resolver');

const tool = await toolResolver.resolveTool('my-tool');
console.log(tool.schema_version);
// Expected: 2.0 (if explicit or auto-detected from features)
```

### 2. Test Validators

```javascript
const ToolValidationHelper = require('../common/utils/tool-validation-helper');

const validator = new ToolValidationHelper(tool.executable_knowledge?.validators);

const validation = await validator.validate('create_task', {
  assignees: {add: [123]}  // Wrong format
});

console.log(validation);
// Expected: { valid: false, errors: ["assignees must be array..."], _duration: 12 }
```

### 3. Test Helpers

```javascript
const ToolHelperExecutor = require('../common/utils/tool-helper-executor');

const executor = new ToolHelperExecutor(tool.executable_knowledge?.helpers);

const result = await executor.execute('extract-custom-field', {
  response: apiData,
  fieldName: 'Priority'
});

console.log(result);
// Expected: { id: '123', name: 'Priority', value: 'High' }
```

### 4. Performance Verification

```javascript
// Validators should be < 50ms
const start = Date.now();
await validator.validate('command', args);
const duration = Date.now() - start;
console.assert(duration < 50, `Validator took ${duration}ms (target: <50ms)`);

// Helpers should be < 1s
const start2 = Date.now();
await executor.execute('helper-id', args);
const duration2 = Date.now() - start2;
console.assert(duration2 < 1000, `Helper took ${duration2}ms (target: <1s)`);
```

## Common Migration Patterns

### Pattern 1: Add Validation Only

**Use case:** Simple tool that just needs validation

```yaml
tool:
  schema_version: 2.0
  id: simple-api
  # ... basic fields ...

  executable_knowledge:
    validators:
      - id: validate-amount
        validates: create_payment
        function: |
          function validateCommand(args) {
            const errors = [];
            if (args.args.amount < 100) {
              errors.push("amount must be >= 100 cents");
            }
            return { valid: errors.length === 0, errors };
          }
  # No helpers, no api_complexity - just validation
```

### Pattern 2: Add Helpers Only

**Use case:** Data transformation needed, no validation

```yaml
tool:
  schema_version: 2.0
  id: data-processor
  # ... basic fields ...

  executable_knowledge:
    helpers:
      - id: parse-response
        language: javascript
        function: |
          function parseResponse(args) {
            // Transform API response
            return args.data.map(item => ({
              id: item._id,
              name: item.display_name
            }));
          }
  # No validators - just helpers
```

### Pattern 3: Document Quirks Only

**Use case:** API has quirks but no executable code needed

```yaml
tool:
  schema_version: 2.0
  id: quirky-api
  # ... basic fields ...

  api_complexity:
    api_quirks:
      - quirk: pagination_format
        description: "First page uses page=1, subsequent use cursor"
        mitigation: "Check if cursor exists in response"

  anti_patterns:
    - pattern: wrong_pagination
      wrong: "Always using page number"
      correct: "Use cursor when available"
  # No executable_knowledge - just documentation
```

## Rollback Procedure

If you need to roll back to v1.0:

1. **Remove schema_version** (or change to 1.0)
2. **Remove executable_knowledge section** (if present)
3. **Remove api_complexity section** (if present)
4. **Remove anti_patterns section** (if present)
5. **Simplify examples** (keep only success cases)

**Tool will auto-detect as v1.0** and work as before.

## FAQs

### Q: Do I need to migrate all my tools at once?

**A:** No! Migration is per-tool, opt-in. Migrate only tools that benefit from v2.0 features.

### Q: Will v1.0 tools stop working?

**A:** No. **Zero breaking changes.** v1.0 tools work indefinitely.

### Q: What if I add `executable_knowledge` but forget `schema_version`?

**A:** Auto-detection will detect v2.0 features and classify as v2.0. Explicit is better for clarity.

### Q: Can I mix v1.0 and v2.0 tools in the same agent?

**A:** Yes! Agents don't care about schema version - they just reference tool IDs.

### Q: How do I know if my validator is fast enough?

**A:** The system warns if > 50ms. Target < 50ms, safety timeout at 500ms.

### Q: Can I use npm packages in helpers/validators?

**A:** No. Sandbox prevents `require()`. Functions must be self-contained.

### Q: What happens if validator times out?

**A:** Validation fails with timeout error. Fix: optimize logic or split validation.

## Resources

- [Tools System Guide](tools-system-guide.md)
- [Tool Schema v2.0 Specification](tool-schema-v2.0-spec.md)
- [Epic 5: Tools System](epics/epic-5-tools-system.md)
- [Story 5.1: Tools Infrastructure](stories/5.1.tools-infrastructure.md)

---

**Last Updated:** 2025-10-08
**Version:** 1.0
**Author:** James (Developer)
