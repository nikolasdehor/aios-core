# Project Management Tool Configuration

AIOS-FullStack supports integration with multiple PM tools or can run entirely standalone.

## Supported PM Tools

1. **ClickUp** - Full integration with ClickUp workspace
2. **GitHub Projects** - Native GitHub Projects v2 integration
3. **Jira** - Basic Jira Cloud integration
4. **Local-only** - Standalone mode (no external PM tool)

## Quick Start

### Initial Setup

Run the initialization wizard:

```bash
npx aios-fullstack init
```

You'll be prompted to select your PM tool:

1. **ClickUp** (requires API token)
2. **GitHub Projects** (uses existing gh auth)
3. **Jira** (requires API token)
4. **None** (local YAML files only)

### Configuration File

Configuration is stored in `.aios-pm-config.yaml` at your project root:

```yaml
pm_tool:
  type: "clickup"  # or "github-projects", "jira", "local"
  configured_at: "2025-10-25T20:00:00Z"
  config:
    # Tool-specific configuration

sync_behavior:
  auto_sync_on_status_change: true
  create_tasks_on_story_creation: false
  bidirectional_sync: false
```

## ClickUp Configuration

### Prerequisites

- ClickUp API token
- Team ID, Space ID, List ID

### Environment Variables

```bash
export CLICKUP_API_TOKEN="your-api-token"
export CLICKUP_TEAM_ID="12345"
export CLICKUP_SPACE_ID="67890"
export CLICKUP_LIST_ID="11111"
```

### Configuration Example

```yaml
pm_tool:
  type: "clickup"
  config:
    api_token: "${CLICKUP_API_TOKEN}"
    team_id: "12345"
    space_id: "67890"
    list_id: "11111"
```

### Features

- ✅ Full bidirectional sync
- ✅ Story status custom field
- ✅ Task descriptions
- ✅ Changelog comments
- ✅ Epic relationships

## GitHub Projects Configuration

### Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Organization or personal GitHub account
- GitHub Project created

### Authentication

```bash
gh auth login
```

### Configuration Example

```yaml
pm_tool:
  type: "github-projects"
  config:
    org: "your-org-or-username"
    project_number: 5
```

### Features

- ✅ Stories as GitHub issues
- ✅ Automatic labeling (story-{id}, epic-{num})
- ✅ Status sync (open/closed)
- ⚠️  Limited: No custom fields

## Jira Configuration

### Prerequisites

- Jira Cloud instance
- API token
- Project key

### Environment Variables

```bash
export JIRA_API_TOKEN="your-api-token"
export JIRA_EMAIL="your-email@example.com"
```

### Configuration Example

```yaml
pm_tool:
  type: "jira"
  config:
    base_url: "https://yourcompany.atlassian.net"
    api_token: "${JIRA_API_TOKEN}"
    email: "your-email@example.com"
    project_key: "AIOS"
```

### Features

- ✅ Create issues
- ✅ Update status
- ✅ Basic field mapping
- ⚠️  Limited: v1.0 has basic support only

### Limitations (v1.0)

- No custom field mapping
- No complex workflows
- No Jira automation integration

## Local-Only Mode

### When to Use

- No PM tool required
- Standalone development
- Full offline operation
- Git is the source of truth

### Configuration

```yaml
pm_tool:
  type: "local"
  config: {}
```

### Features

- ✅ 100% AIOS functionality
- ✅ No external dependencies
- ✅ YAML + Git versioning
- ✅ Instant sync (validates only)

## Using PM Tools

### Syncing Stories

From @po agent:

```bash
*sync-story docs/stories/3.20-pm-tool-agnostic.yaml
```

Or directly:

```javascript
const { syncStoryToPM } = require('./.aios-core/utils/story-manager');

await syncStoryToPM(storyPath);
```

### Pulling Updates

From @po agent:

```bash
*pull-story 3.20
```

Or directly:

```javascript
const { pullStoryFromPM } = require('./.aios-core/utils/story-manager');

const updates = await pullStoryFromPM('3.20');
```

## Migration from Existing Setup

If you're already using ClickUp:

```bash
node bin/migrate-pm-config.js
```

This script:
1. Detects existing ClickUp environment variables
2. Creates `.aios-pm-config.yaml` automatically
3. Maintains backward compatibility

No changes required to your workflow!

## Switching PM Tools

1. Delete `.aios-pm-config.yaml`
2. Run `aios init` again
3. Select new PM tool

Or manually edit `.aios-pm-config.yaml` and change the `type` field.

## Troubleshooting

### "No PM tool configured"

**Solution**: Run `aios init` or create `.aios-pm-config.yaml`

### ClickUp sync fails

**Check**:
- `CLICKUP_API_TOKEN` environment variable is set
- Team/Space/List IDs are correct
- API token has proper permissions

### GitHub Projects sync fails

**Check**:
- `gh auth status` shows "Logged in"
- Organization and project number are correct
- You have write access to the repository

### Jira sync fails

**Check**:
- `JIRA_API_TOKEN` and `JIRA_EMAIL` are set
- Base URL is correct (including https://)
- Project key exists and you have access

## Advanced: Custom Adapters

Want to add support for Azure DevOps, Asana, or another tool?

See: `.aios-core/utils/pm-adapters/README.md` for developer guide.

Steps:
1. Create new adapter extending `PMAdapter`
2. Implement 5 required methods
3. Add to `pm-adapter-factory.js`
4. Update `bin/aios-init.js` prompts
5. Write tests

## See Also

- [Adapter Pattern Documentation](.aios-core/utils/pm-adapters/README.md)
- [Story 3.20 - PM Tool-Agnostic Integration](docs/stories/epic-3-gap-remediation/3.20-pm-tool-agnostic-integration.yaml)
- [Story 3.14 - Repository-Agnostic Design](docs/stories/epic-3-gap-remediation/3.14-github-devops-agent-v2.yaml)

## Version

- **Current**: v1.0 (Story 3.20)
- **Introduced**: 2025-10-25
- **Status**: Production-ready
