# Tool Schema v2.0 Specification

## Overview

This document defines the complete YAML schema for AIOS tools, supporting both v1.0 (simple) and v2.0 (complex) tools with executable knowledge, API complexity handling, and anti-pattern libraries.

**Schema Version:** 2.0
**Status:** Active
**Backward Compatibility:** Full (v1.0 tools work unchanged)

## Table of Contents

1. [Core Fields (Universal)](#core-fields-universal)
2. [Executable Knowledge (v2.0 Only)](#executable-knowledge-v20-only)
3. [API Complexity (v2.0 Only)](#api-complexity-v20-only)
4. [Anti-Patterns Library (v2.0 Only)](#anti-patterns-library-v20-only)
5. [Enhanced Examples (v2.0)](#enhanced-examples-v20)
6. [Type-Specific Extensions](#type-specific-extensions)
7. [YAML Validation Rules](#yaml-validation-rules)
8. [Schema Detection Logic](#schema-detection-logic)

---

## Core Fields (Universal)

All tools (v1.0 and v2.0) MUST include these core fields:

```yaml
tool:
  # REQUIRED FIELDS
  schema_version: 2.0              # 1.0 (simple) | 2.0 (complex) | Auto-detected if omitted
  id: tool-name                    # Unique identifier (kebab-case)
  type: mcp | cli | local | meta   # Tool category
  name: Human-Readable Name        # Display name
  version: 1.0.0                   # Semantic versioning
  description: |                   # Multi-line description
    Complete tool description
    explaining purpose and use

  # OPTIONAL FIELDS
  knowledge_strategy: hybrid       # embedded|external|hybrid|executable|none (default: embedded)
```

### Field Definitions

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `schema_version` | string | No | Auto-detect | Explicitly sets schema version (1.0 or 2.0) |
| `id` | string | Yes | - | Unique tool identifier |
| `type` | enum | Yes | - | Tool category: mcp, cli, local, or meta |
| `name` | string | Yes | - | Human-readable display name |
| `version` | string | Yes | - | Semantic version (MAJOR.MINOR.PATCH) |
| `description` | string | Yes | - | Tool description and purpose |
| `knowledge_strategy` | enum | No | embedded | How knowledge is provided to agents |

---

## Executable Knowledge (v2.0 Only)

Complex tools (v2.0) can include executable JavaScript functions for helpers, processors, and validators. All code executes in an isolated sandbox with security constraints.

### Structure

```yaml
tool:
  schema_version: 2.0
  executable_knowledge:
    helpers: [...]        # Reusable utility functions
    processors: [...]     # Data transformation functions
    validators: [...]     # Pre-execution validation functions
```

### Helpers

Reusable JavaScript functions for common operations.

```yaml
helpers:
  - id: helper-name              # Unique helper identifier
    language: javascript         # Only 'javascript' supported
    runtime: isolated_vm         # Sandbox runtime (isolated-vm v5.0+)
    function: |                  # JavaScript function as string
      function helperName(args) {
        // Implementation
        // args = { param1, param2, ... }
        return result;
      }
      module.exports = { helperName };
```

**Security Constraints:**
- **Timeout:** 1000ms (1 second) max execution
- **Memory:** 8MB limit per execution
- **Isolation:** No external requires, no file system access
- **Sandbox:** isolated-vm with context isolation

### Processors

Data transformation functions for processing responses or inputs.

```yaml
processors:
  - id: processor-name           # Unique processor identifier
    language: javascript
    function: |
      function processData(data) {
        // Transform data
        return processedData;
      }
      module.exports = { processData };
```

**Security Constraints:** Same as helpers

### Validators

Pre-execution validation functions that run before tool calls.

```yaml
validators:
  - id: validator-name           # Unique validator identifier
    validates: command_name      # Which command this validates
    language: javascript
    checks:                      # Optional declarative checks
      - required_fields: [field1, field2]
      - format: email
    function: |
      function validateCommand(args) {
        const errors = [];

        // Validation logic
        if (!args.field1) {
          errors.push("field1 is required");
        }

        return {
          valid: errors.length === 0,
          errors: errors
        };
      }
      module.exports = { validateCommand };
```

**Security Constraints:**
- **Timeout:** 500ms safety timeout (target <50ms)
- **Memory:** 8MB limit
- **Isolation:** Same as helpers
- **Return Format:** Must return `{ valid: boolean, errors: string[] }`

**Performance Target:** <50ms execution (80%+ error prevention)

---

## API Complexity (v2.0 Only)

Handles complex API scenarios with multiple payload formats, custom field types, and known quirks.

### Payload Schemas

Define multiple API or webhook payload formats.

```yaml
api_complexity:
  payload_schemas:
    - type: standard                    # Schema type identifier
      detection: "event field exists"   # How to detect this format
      payload_path: "body.payload"      # Where data is located

    - type: webhook_variant
      detection: "webhook_id field"
      payload_path: "data.webhook.payload"
```

### Field Mappings

Custom field type definitions and extraction logic.

```yaml
api_complexity:
  field_mappings:
    custom_fields:
      location:                         # Field name
        structure:                      # Expected structure
          location: {lat: number, lng: number}
          formatted_address: string
        extraction: helpers.extract-custom-field  # Helper to extract

      assignees:
        structure:
          create_format: [user_id]      # Format for creation
          update_format: {add: [user_id], rem: [user_id]}
        note: "Different formats for create vs update"
```

### API Quirks

Document known API inconsistencies and mitigations.

```yaml
api_complexity:
  api_quirks:
    - quirk: assignee_format_mismatch
      description: "Create API expects [123], Update expects {add: [123]}"
      impact: "Runtime errors if wrong format used"
      mitigation: "Use command-specific validators"

    - quirk: rate_limit_undocumented
      description: "API has undocumented 100/min rate limit"
      mitigation: "Implement retry with exponential backoff"
```

---

## Anti-Patterns Library (v2.0 Only)

Documented common mistakes and correct usage patterns.

```yaml
anti_patterns:
  - pattern: wrong_assignee_format              # Pattern identifier
    description: "Using update format in create API"
    category: api_usage                          # Categorization
    wrong: |                                     # Incorrect usage
      create_task({
        assignees: {add: [456]}  // ❌ Wrong format
      })
    correct: |                                   # Correct usage
      create_task({
        assignees: [456]         // ✅ Correct format
      })
    rationale: "Create API expects array, not object"

  - pattern: missing_custom_field_validation
    description: "Not validating custom field structure"
    category: validation
    wrong: |
      update({
        custom_fields: [{id: "123", value: "invalid"}]  // ❌ No validation
      })
    correct: |
      // ✅ Use validator first
      const validation = await validate("update", args);
      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }
    rationale: "Custom fields have complex structure requirements"
```

### Categories

- `api_usage` - Incorrect API usage patterns
- `validation` - Missing or incorrect validation
- `error_handling` - Improper error handling
- `performance` - Performance anti-patterns
- `security` - Security vulnerabilities

---

## Enhanced Examples (v2.0)

v2.0 tools include 4 scenario types for each command:

```yaml
examples:
  command_name:
    - scenario: success                        # Successful execution
      description: "Standard successful use case"
      input:
        param1: value1
        param2: value2
      output:
        result: "Success"

    - scenario: failure_invalid_param          # Validation failure
      description: "Missing required parameter"
      input:
        param1: value1
        # param2 missing
      error:
        code: VALIDATION_ERROR
        message: "param2 is required"

    - scenario: failure_api_error              # API error
      description: "API returns error"
      input:
        param1: value1
        param2: value2
      error:
        code: API_ERROR
        message: "Rate limit exceeded"

    - scenario: edge_case_format_mismatch      # Edge case/quirk
      description: "Demonstrates assignee format quirk"
      input:
        assignees: {add: [123]}  # Wrong for create
      error:
        code: FORMAT_ERROR
        message: "Expected array, got object"
      mitigation: "Use validators.validate-assignee-format"
```

### Required Scenarios

1. **success** - Normal successful execution
2. **failure_invalid_param** - Validation error scenario
3. **failure_api_error** - API/runtime error scenario
4. **edge_case_*** - Quirk or edge case scenario

---

## Type-Specific Extensions

Each tool type can have additional fields beyond the core schema.

### MCP Tools

```yaml
tool:
  type: mcp
  mcp_specific:
    server_command: npx -y @package/server
    transport: stdio | sse | websocket
    health_check:
      method: tool_call
      command: health_check
      expected_response: { status: "ok" }
```

### CLI Tools

```yaml
tool:
  type: cli
  cli_specific:
    executable: gh                    # CLI executable name
    install_check: gh --version       # How to verify installation
    install_guide: |
      Run: brew install gh
      Or: https://cli.github.com
```

### Local Tools

```yaml
tool:
  type: local
  local_specific:
    entry_point: ./scripts/tool.js
    runtime: node
    dependencies: [package1, package2]
```

### Meta Tools

```yaml
tool:
  type: meta
  meta_specific:
    aggregates: [tool1, tool2, tool3]    # Tools this meta-tool wraps
    orchestration: helpers.orchestrate   # Orchestration logic
```

---

## YAML Validation Rules

### Structural Validation

1. **Root Element**
   - MUST have single `tool:` root key
   - No other root-level keys allowed

2. **Required Fields** (All Versions)
   - `id` (string, kebab-case, unique)
   - `type` (enum: mcp|cli|local|meta)
   - `name` (string, non-empty)
   - `version` (string, semver format)
   - `description` (string, non-empty)

3. **Optional Core Fields**
   - `schema_version` (string: "1.0" or "2.0")
   - `knowledge_strategy` (enum: embedded|external|hybrid|executable|none)

### v2.0 Specific Validation

4. **Executable Knowledge** (if present)
   - `helpers[]` array (optional)
     - Each helper MUST have: `id`, `language`, `runtime`, `function`
     - `language` MUST be "javascript"
     - `runtime` MUST be "isolated_vm"

   - `processors[]` array (optional)
     - Each processor MUST have: `id`, `language`, `function`

   - `validators[]` array (optional)
     - Each validator MUST have: `id`, `validates`, `language`, `function`
     - `function` MUST return `{ valid: boolean, errors: string[] }`

5. **API Complexity** (if present)
   - `payload_schemas[]` array (optional)
     - Each schema MUST have: `type`, `detection`, `payload_path`

   - `field_mappings` object (optional)
     - Each mapping MUST have: `structure` or `extraction`

   - `api_quirks[]` array (optional)
     - Each quirk MUST have: `quirk`, `description`, `mitigation`

6. **Anti-Patterns** (if present)
   - `anti_patterns[]` array (optional)
     - Each pattern MUST have: `pattern`, `description`, `wrong`, `correct`
     - `category` is optional but recommended

7. **Enhanced Examples** (if present)
   - `examples` object (optional)
   - Each command's examples array MUST include:
     - At least 1 `success` scenario
     - At least 1 `failure_*` scenario
   - Each example MUST have: `scenario`, `input`
   - MUST have either `output` (success) or `error` (failure)

### Naming Conventions

- `id` fields: kebab-case (e.g., `extract-custom-field`)
- Command names: snake_case or kebab-case
- Type values: lowercase
- Enum values: snake_case

### Security Validation

- All `function` fields containing JavaScript MUST be strings
- No external `require()` calls in functions
- No file system operations in functions
- Functions MUST be self-contained

---

## Schema Detection Logic

The system auto-detects schema version using this logic:

```javascript
function detectSchemaVersion(toolYaml) {
  // 1. Explicit schema_version field
  if (toolYaml.schema_version) {
    return parseFloat(toolYaml.schema_version);  // 1.0 or 2.0
  }

  // 2. Check for v2.0 features
  const hasExecutableKnowledge = !!toolYaml.executable_knowledge;
  const hasApiComplexity = !!toolYaml.api_complexity;
  const hasAntiPatterns = !!toolYaml.anti_patterns;
  const hasEnhancedExamples = toolYaml.examples &&
    Object.values(toolYaml.examples).some(ex =>
      ex.some(e => e.scenario && ['success', 'failure_invalid_param'].includes(e.scenario))
    );

  if (hasExecutableKnowledge || hasApiComplexity || hasAntiPatterns || hasEnhancedExamples) {
    return 2.0;
  }

  // 3. Default to v1.0 (simple tools)
  return 1.0;
}
```

### Detection Priority

1. **Explicit `schema_version` field** - Takes precedence
2. **Feature detection** - Presence of v2.0-only sections
3. **Default to v1.0** - If no indicators found

---

## Version Compatibility

### v1.0 (Simple Tools)

```yaml
tool:
  id: exa
  type: mcp
  name: Exa Search
  version: 1.0.0
  description: Web search via Exa API
  commands:
    - web_search
  # No schema_version = auto-detected as v1.0
  # No executable_knowledge = simple tool
```

**Features:**
- Core fields only
- No executable knowledge
- Basic examples (optional)
- Simple, straightforward

### v2.0 (Complex Tools)

```yaml
tool:
  schema_version: 2.0
  id: clickup
  type: mcp
  name: ClickUp
  version: 1.0.0
  description: ClickUp project management
  knowledge_strategy: executable

  executable_knowledge:
    helpers: [...]
    validators: [...]

  api_complexity:
    payload_schemas: [...]
    field_mappings: {...}
    api_quirks: [...]

  anti_patterns: [...]

  examples:
    create_task:
      - scenario: success
        ...
      - scenario: failure_invalid_param
        ...
```

**Features:**
- All core fields
- Executable knowledge (helpers, processors, validators)
- API complexity handling
- Anti-patterns library
- Enhanced 4-scenario examples
- Type-specific extensions

### Migration Path

Tools can be upgraded from v1.0 to v2.0 by:

1. Adding `schema_version: 2.0`
2. Adding executable knowledge sections (as needed)
3. Documenting API complexity (if applicable)
4. Adding anti-patterns (common mistakes)
5. Expanding examples to 4 scenarios per command

**Zero Breaking Changes:** v1.0 tools continue to work unchanged.

---

## Validation Error Codes

| Code | Severity | Description |
|------|----------|-------------|
| `MISSING_REQUIRED_FIELD` | Error | Required field missing |
| `INVALID_TYPE` | Error | Field type mismatch |
| `INVALID_ENUM_VALUE` | Error | Value not in allowed enum |
| `INVALID_SEMVER` | Error | Version not in semver format |
| `INVALID_FUNCTION_SYNTAX` | Error | JavaScript syntax error in function |
| `MISSING_SCENARIO` | Warning | Required example scenario missing |
| `NAMING_CONVENTION` | Warning | Field doesn't follow naming convention |

---

## References

- **Source Architecture:** `docs/architecture/tools-system-handoff.md#L134-236`
- **Epic:** `docs/epics/epic-5-tools-system.md`
- **Story:** `docs/stories/5.1.tools-infrastructure.md`

---

**Last Updated:** 2025-10-08
**Schema Version:** 2.0
**Status:** Active
