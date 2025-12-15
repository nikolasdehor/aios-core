# AIOS Tools System Guide

## Overview

The AIOS Tools System provides a universal framework for agents to leverage external capabilities through standardized tool definitions. It supports both simple tools (v1.0) and complex tools (v2.0) with executable knowledge, API complexity handling, and anti-pattern libraries.

**Key Features:**
- **Universal Schema**: Single YAML format for all tool types (MCP, CLI, Local, Meta)
- **Auto-Detection**: Automatically detects v1.0 vs v2.0 based on features
- **Sandboxed Execution**: JavaScript helpers/validators run in isolated-vm (security-first)
- **Backward Compatible**: v1.0 tools work unchanged, no breaking changes
- **Performance Optimized**: <50ms resolution, <5ms cached lookups
- **Extensible**: Type-specific extensions for MCP, CLI, Local, Meta tools

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AIOS Agent Layer                     │
│  - Declares tool dependencies in agent YAML             │
│  - Uses tools through standardized interface            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Tools Infrastructure                   │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────┐│
│  │  ToolResolver  │  │HelperExecutor   │  │Validator ││
│  │  - File search │  │ - Sandboxed JS  │  │ - Pre-   ││
│  │  - Caching     │  │ - 1s timeout    │  │   check  ││
│  │  - Validation  │  │ - 8MB memory    │  │ - <50ms  ││
│  └────────────────┘  └─────────────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Tool Definitions                      │
│  aios-core/tools/           expansion-packs/{pack}/tools/│
│  ├── mcp/                   ├── mcp/                    │
│  ├── api/                   ├── api/                    │
│  ├── cli/                   ├── cli/                    │
│  └── local/                 └── local/                  │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Create a Simple Tool (v1.0)

Create `aios-core/tools/mcp/exa.yaml`:

```yaml
tool:
  id: exa
  type: mcp
  name: Exa Search
  version: 1.0.0
  description: Web search using Exa AI API

  commands:
    - web_search
    - research_paper_search

  mcp_specific:
    server_command: npx -y @modelcontextprotocol/server-exa
    transport: stdio
```

**Features:**
- No schema_version = auto-detected as v1.0
- Simple, straightforward definition
- Type-specific fields in `mcp_specific`

### 2. Create a Complex Tool (v2.0)

Create `aios-core/tools/mcp/clickup.yaml`:

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
        function: |
          function validateCommand(args) {
            const errors = [];

            // Create API expects array, not object
            if (args.args.assignees && typeof args.args.assignees === 'object' && !Array.isArray(args.args.assignees)) {
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
            // Extract custom field logic
            return response.custom_fields?.find(f => f.name === fieldName);
          }
          module.exports = { extractField };

  api_complexity:
    api_quirks:
      - quirk: assignee_format_mismatch
        description: "Create API expects [123], Update expects {add: [123]}"
        mitigation: "Use validators to enforce correct format"

  anti_patterns:
    - pattern: wrong_assignee_format
      description: "Using update format in create API"
      wrong: |
        create_task({
          assignees: {add: [456]}  // ❌ Wrong
        })
      correct: |
        create_task({
          assignees: [456]         // ✅ Correct
        })

  mcp_specific:
    server_command: npx -y @modelcontextprotocol/server-clickup
    transport: stdio
```

**Features:**
- Explicit `schema_version: 2.0`
- Executable knowledge (validators, helpers)
- API quirks documentation
- Anti-patterns library

### 3. Agent References Tools

In `aios-core/agents/developer.md`:

```yaml
agent:
  name: Developer
  id: dev
  title: 🛠️ James - Senior Developer

dependencies:
  tasks:
    - develop-story
    - create-component
  tools:
    - clickup
    - github-cli
    - exa
```

**Agent gets automatic access to:**
- ClickUp commands with validation
- GitHub CLI operations
- Exa search capabilities

### 4. Use Tools in Code

```javascript
const toolResolver = require('../common/utils/tool-resolver');
const ToolHelperExecutor = require('../common/utils/tool-helper-executor');
const ToolValidationHelper = require('../common/utils/tool-validation-helper');

// Resolve tool
const clickup = await toolResolver.resolveTool('clickup');
console.log(clickup.schema_version); // 2.0 (auto-detected)

// Validate before execution
const validator = new ToolValidationHelper(clickup.executable_knowledge?.validators);
const validation = await validator.validate('create_task', {
  assignees: {add: [123]}
});

if (!validation.valid) {
  console.error(validation.errors);
  // ["assignees must be array for create_task, got object"]
}

// Execute helper
const executor = new ToolHelperExecutor(clickup.executable_knowledge?.helpers);
const field = await executor.execute('extract-custom-field', {
  response: apiResponse,
  fieldName: 'Priority'
});
```

## Tool Types

### MCP Tools (Model Context Protocol)

**When to use:** External services via stdio/sse/websocket

```yaml
tool:
  type: mcp
  mcp_specific:
    server_command: npx -y @package/server
    transport: stdio | sse | websocket
    health_check:
      method: tool_call
      command: health_check
```

**Examples:** ClickUp, Exa, GitHub, Supabase

### CLI Tools (Command Line)

**When to use:** System commands, installed binaries

```yaml
tool:
  type: cli
  cli_specific:
    executable: gh
    install_check: gh --version
    install_guide: |
      brew install gh
      # or: https://cli.github.com
```

**Examples:** GitHub CLI, Docker CLI, kubectl

### Local Tools (Local Scripts)

**When to use:** Project-specific scripts, custom tooling

```yaml
tool:
  type: local
  local_specific:
    entry_point: ./scripts/deploy.js
    runtime: node
    dependencies:
      - dotenv
      - axios
```

**Examples:** Deployment scripts, data migration tools

### Meta Tools (Tool Orchestrators)

**When to use:** Combining multiple tools, workflows

```yaml
tool:
  type: meta
  meta_specific:
    aggregates:
      - github-cli
      - clickup
      - slack
    orchestration: helpers.orchestrate-deployment
```

**Examples:** Deployment orchestrator, CI/CD pipeline

## ToolResolver API

### Resolve a Tool

```javascript
const toolResolver = require('../common/utils/tool-resolver');

// Basic resolution
const tool = await toolResolver.resolveTool('clickup');

// Expansion pack specific
const customTool = await toolResolver.resolveTool('custom-api', {
  expansionPack: 'company-pack'
});

// Check cache
const stats = toolResolver.getCacheStats();
console.log(stats); // { size: 2, keys: ['core:clickup', 'company-pack:custom-api'] }

// Clear cache (for hot-reload)
toolResolver.clearCache();
```

### Search Priority

1. **Expansion Pack** (if specified): `expansion-packs/{pack}/tools/**/{name}.yaml`
2. **Common**: `common/tools/**/{name}.yaml`
3. **Core**: `aios-core/tools/**/{name}.yaml`

First match wins, cached for subsequent requests.

### Performance

- **Cached lookup:** < 5ms (Map O(1))
- **Uncached lookup:** < 50ms (glob + parse + validate)
- **Health check:** Varies by method (tool_call, command, http)

## ToolHelperExecutor API

### Execute Helpers

```javascript
const ToolHelperExecutor = require('../common/utils/tool-helper-executor');

const executor = new ToolHelperExecutor(tool.executable_knowledge?.helpers);

// Execute helper
const result = await executor.execute('extract-custom-field', {
  response: apiData,
  fieldName: 'Status'
});

// Check if helper exists
if (executor.hasHelper('parse-webhook')) {
  const parsed = await executor.execute('parse-webhook', webhookData);
}

// List available helpers
console.log(executor.listHelpers());
// ['extract-custom-field', 'parse-webhook', 'format-assignees']

// Get helper info
const info = executor.getHelperInfo('extract-custom-field');
console.log(info);
// { id: 'extract-custom-field', language: 'javascript', runtime: 'isolated_vm', hasFunction: true }
```

### Security Constraints

- **Timeout:** 1000ms (1 second) enforced
- **Memory:** 8MB limit per execution
- **Isolation:** No external requires, no file system access
- **Sandbox:** isolated-vm with automatic disposal
- **Console:** Scoped logging for debugging

## ToolValidationHelper API

### Pre-Execution Validation

```javascript
const ToolValidationHelper = require('../common/utils/tool-validation-helper');

const validator = new ToolValidationHelper(tool.executable_knowledge?.validators);

// Validate command args
const validation = await validator.validate('create_task', {
  assignees: {add: [123]},
  name: "New Task"
});

if (!validation.valid) {
  console.error(validation.errors);
  // ["assignees must be array for create_task, got object"]
} else {
  // Proceed with tool execution
  await executeTool('create_task', args);
}

// Performance tracking
console.log(validation._duration); // e.g., 12ms

// Batch validation
const results = await validator.validateBatch([
  { command: 'create_task', args: {...} },
  { command: 'update_task', args: {...} }
]);
```

### Validation Flow

1. **Check validator exists** - If not, auto-pass (backward compatible)
2. **Execute in sandbox** - isolated-vm, 500ms timeout
3. **Measure performance** - Warn if > 50ms
4. **Return standardized format** - `{ valid: boolean, errors: string[] }`

### Performance

- **Target:** < 50ms execution
- **Safety timeout:** 500ms
- **Goal:** 80%+ error prevention before MCP call

## Schema Detection

### Auto-Detection Logic

```javascript
// Tool with no schema_version field
tool:
  id: simple-api
  type: api
  # No schema_version = auto-detect

// Detection checks for v2.0 features:
const isV2 =
  !!tool.executable_knowledge ||
  !!tool.api_complexity ||
  !!tool.anti_patterns ||
  hasEnhancedExamples(tool.examples);

return isV2 ? 2.0 : 1.0; // Default to v1.0
```

### When to Use v1.0

✅ **Use v1.0 when:**
- Tool is simple, no complex logic needed
- No API quirks or edge cases
- No validation required
- Basic examples sufficient

**Example:** Exa search, GitHub CLI wrapper

### When to Use v2.0

✅ **Use v2.0 when:**
- Complex API with quirks (different formats for create vs update)
- Custom validation logic needed (pre-execution checks)
- Reusable helpers for data processing
- Anti-patterns need documentation
- 4-scenario examples required (success, validation error, API error, edge case)

**Example:** ClickUp, Stripe, complex APIs

## Examples by Type

### Example 1: Simple MCP Tool (v1.0)

```yaml
tool:
  id: github-search
  type: mcp
  name: GitHub Search
  version: 1.0.0
  description: Search GitHub repos and code

  commands:
    - search_repositories
    - search_code

  mcp_specific:
    server_command: npx -y @modelcontextprotocol/server-github
    transport: stdio
```

### Example 2: Complex API Tool (v2.0)

```yaml
tool:
  schema_version: 2.0
  id: stripe
  type: api
  name: Stripe Payments
  version: 1.0.0
  knowledge_strategy: executable

  executable_knowledge:
    validators:
      - id: validate-payment-intent
        validates: create_payment_intent
        function: |
          function validateCommand(args) {
            const errors = [];
            if (args.args.amount < 50) {
              errors.push("amount must be >= 50 cents");
            }
            if (!args.args.currency) {
              errors.push("currency is required");
            }
            return { valid: errors.length === 0, errors };
          }

  api_complexity:
    api_quirks:
      - quirk: amount_in_cents
        description: "All amounts must be in smallest currency unit (cents)"
        mitigation: "Multiply dollar amounts by 100"
```

### Example 3: CLI Tool (v1.0)

```yaml
tool:
  id: docker
  type: cli
  name: Docker CLI
  version: 1.0.0
  description: Docker container management

  commands:
    - ps
    - build
    - run
    - stop

  cli_specific:
    executable: docker
    install_check: docker --version
    install_guide: |
      macOS: brew install docker
      Linux: apt-get install docker.io
      Windows: https://docker.com/download
```

### Example 4: Meta Tool (v2.0)

```yaml
tool:
  schema_version: 2.0
  id: deployment-pipeline
  type: meta
  name: Deployment Pipeline
  version: 1.0.0

  meta_specific:
    aggregates:
      - github-cli
      - docker
      - kubernetes
    orchestration: helpers.orchestrate-deploy

  executable_knowledge:
    helpers:
      - id: orchestrate-deploy
        language: javascript
        function: |
          async function orchestrateDeploy(args) {
            // 1. Build with Docker
            // 2. Push to registry
            // 3. Deploy to Kubernetes
            // 4. Update GitHub deployment status
            return { success: true };
          }
```

## Best Practices

### 1. Tool Definition

✅ **DO:**
- Use semantic versioning for tool versions
- Include comprehensive description
- Add health checks for MCP tools
- Document all commands clearly
- Use auto-detection (omit schema_version unless explicit v2.0)

❌ **DON'T:**
- Hard-code API keys in YAML
- Mix concerns (keep validators simple)
- Duplicate logic in multiple helpers
- Skip error handling in JavaScript functions

### 2. Validators

✅ **DO:**
- Keep validators < 50ms execution time
- Return standardized `{ valid, errors }` format
- Validate business logic, not just types
- Use declarative checks for simple validation

❌ **DON'T:**
- Make API calls in validators (pre-check only)
- Use validators for data transformation (use helpers)
- Exceed 500ms timeout
- Assume args structure without checking

### 3. Helpers

✅ **DO:**
- Keep helpers < 1s execution time
- Use helpers for data transformation
- Make helpers pure functions when possible
- Add console.log for debugging

❌ **DON'T:**
- Access file system (sandbox prevents this)
- Require external modules (not allowed)
- Mutate global state
- Use helpers for validation (use validators)

### 4. Agent Integration

✅ **DO:**
- Declare all tool dependencies in agent YAML
- Check tool health before use
- Handle tool errors gracefully
- Cache tool resolution results

❌ **DON'T:**
- Assume tools are always available
- Skip validation when provided
- Hard-code tool paths
- Ignore performance warnings

## Troubleshooting

### Issue: Tool Not Found

```
Error: Tool 'clickup' not found in search paths: aios-core/tools, common/tools
```

**Solution:**
1. Check tool file exists: `aios-core/tools/mcp/clickup.yaml`
2. Verify file naming (must match tool id)
3. Check file is valid YAML

### Issue: Validator Timeout

```
Validator 'create_task' exceeded 500ms timeout. Validation failed for safety.
```

**Solution:**
1. Optimize validator logic (target < 50ms)
2. Remove complex operations
3. Use declarative checks for simple validation
4. Consider splitting complex validation

### Issue: Helper Exceeds Memory

```
Helper 'process-large-dataset' exceeded 8MB memory limit.
```

**Solution:**
1. Process data in chunks
2. Avoid loading entire dataset into memory
3. Use streaming approaches
4. Consider using external processor instead

### Issue: Schema Version Mismatch

```
Tool detected as v1.0 but has executable_knowledge
```

**Solution:**
1. Add explicit `schema_version: 2.0` to tool YAML
2. Ensure v2.0 features are properly structured
3. Validate YAML syntax

## Migration Guide

### Upgrading v1.0 → v2.0

**Step 1:** Add schema_version

```yaml
tool:
  schema_version: 2.0  # Add this
  id: my-tool
  # ... rest of definition
```

**Step 2:** Add executable knowledge (optional)

```yaml
executable_knowledge:
  validators:
    - id: validate-my-command
      validates: my_command
      function: |
        # Validation logic
```

**Step 3:** Document API complexity (if applicable)

```yaml
api_complexity:
  api_quirks:
    - quirk: format_mismatch
      description: "..."
      mitigation: "..."
```

**Step 4:** Add anti-patterns (recommended)

```yaml
anti_patterns:
  - pattern: wrong_usage
    wrong: |
      # Wrong way
    correct: |
      # Correct way
```

**Step 5:** Enhance examples

Add 4 scenarios: success, failure_invalid_param, failure_api_error, edge_case

## Reference

### File Locations

- **Core Tools:** `aios-core/tools/{mcp|api|cli|local}/*.yaml`
- **Common Tools:** `common/tools/{mcp|api|cli|local}/*.yaml`
- **Expansion Pack Tools:** `expansion-packs/{pack}/tools/{mcp|api|cli|local}/*.yaml`
- **Schema Spec:** `docs/tool-schema-v2.0-spec.md`
- **Utilities:** `common/utils/tool-*.js`

### Related Documentation

- [Tool Schema v2.0 Specification](tool-schema-v2.0-spec.md)
- [Epic 5: Tools System](epics/epic-5-tools-system.md)
- [Story 5.1: Tools Infrastructure](stories/5.1.tools-infrastructure.md)
- [Agent Development Guide](agent-development-guide.md)

---

**Last Updated:** 2025-10-08
**Version:** 1.0
**Author:** James (Developer)
