# ClickUp Setup Guide for AIOS Story Synchronization

**Version:** 1.0
**Last Updated:** 2025-10-10
**Audience:** Project Administrators, Product Owners

---

## Overview

This guide provides step-by-step instructions for configuring ClickUp to work with the AIOS story synchronization system. The AIOS framework automatically creates stories as ClickUp subtasks of Epics and maintains bidirectional status synchronization.

### What You'll Set Up

1. **ClickUp Workspace** - Your AIOS project workspace
2. **Backlog List** - Central list for Epics and Stories
3. **Custom Fields** - Four required fields for story metadata
4. **Tag Structure** - Epic and Story tagging conventions
5. **Status Configuration** - Epic (native) vs Story (custom field) statuses
6. **API Authentication** - Secure API access for AIOS

---

## Prerequisites

- ClickUp account with Admin or Owner permissions
- Workspace where AIOS stories will be tracked
- API token with read/write permissions

---

## Table of Contents

1. [ClickUp Workspace Setup](#1-clickup-workspace-setup)
2. [Create Backlog List](#2-create-backlog-list)
3. [Configure Custom Fields](#3-configure-custom-fields)
4. [Set Up Tag Structure](#4-set-up-tag-structure)
5. [Configure Status Settings](#5-configure-status-settings)
6. [API Authentication Setup](#6-api-authentication-setup)
7. [Validation and Testing](#7-validation-and-testing)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. ClickUp Workspace Setup

### 1.1 Create or Select Workspace

1. Log in to ClickUp at https://app.clickup.com
2. Either:
   - **Existing Workspace:** Navigate to your AIOS project workspace
   - **New Workspace:** Click **+ New Workspace** → Name it "AIOS Project" (or your preferred name)

### 1.2 Workspace Settings

Navigate to **Workspace Settings** (click workspace name → Settings):

- **Name:** AIOS Project (or your choice)
- **Privacy:** Team (recommended) or Private
- **Members:** Add team members who will use AIOS

---

## 2. Create Backlog List

### 2.1 Create Space (If Needed)

1. In your workspace, click **+ New Space**
2. **Name:** "Product Development" (or your choice)
3. **Color:** Choose a color for easy identification
4. **Privacy:** Shared with workspace

### 2.2 Create Backlog List

1. Inside your Space, click **+ New List**
2. **Name:** `Backlog` (exact name, case-sensitive)
3. **Description:** "Central backlog for Epics and Stories"
4. **List Settings:**
   - **View:** List View (default)
   - **Permissions:** Editable by team members
   - **Enable Subtasks:** ✅ (critical for Epic-Story relationships)

⚠️ **IMPORTANT:** The list name must be exactly `Backlog` (case-sensitive) for AIOS to find it.

---

## 3. Configure Custom Fields

Custom fields store story metadata that AIOS needs for synchronization.

### 3.1 Access Custom Fields

1. Open the **Backlog** list
2. Click **+ Add Custom Field** (top right of list view)
3. Create the following 4 required custom fields:

### 3.2 Custom Field: epic_number

**Field Configuration:**
- **Name:** `epic_number` (exact spelling, case-sensitive)
- **Type:** Number
- **Description:** "Epic number from story ID (e.g., 5 from '5.2.2')"
- **Required:** No (only for Epics)
- **Decimal Places:** 0
- **Format:** Plain Number

**Purpose:** Stores the epic number (e.g., `5` for Epic 5). Used to link stories to their Epic.

### 3.3 Custom Field: story_number

**Field Configuration:**
- **Name:** `story_number` (exact spelling, case-sensitive)
- **Type:** Short Text
- **Description:** "Full story ID (e.g., '5.2.2')"
- **Required:** No (only for Stories)
- **Max Length:** 20 characters

**Purpose:** Stores the complete story identifier (e.g., `5.2.2`). Used for story identification and tracking.

### 3.4 Custom Field: story_file_path

**Field Configuration:**
- **Name:** `story_file_path` (exact spelling, case-sensitive)
- **Type:** Short Text
- **Description:** "Relative path to story .md file in repository"
- **Required:** No (only for Stories)
- **Max Length:** 255 characters

**Purpose:** Links the ClickUp task to the local story file (e.g., `docs/stories/5.2.2.clickup-synchronization-layer.md`).

### 3.5 Custom Field: story-status

**Field Configuration:**
- **Name:** `story-status` (exact spelling, case-sensitive, with hyphen)
- **Type:** Dropdown (Single Select)
- **Description:** "Story-specific status (separate from Epic status)"
- **Required:** Yes (for Stories)
- **Dropdown Options:** (Add in this exact order)
  1. Draft (Color: Gray)
  2. Ready for Dev (Color: Blue)
  3. In Progress (Color: Yellow)
  4. Ready for Review (Color: Orange)
  5. Review (Color: Purple)
  6. Done (Color: Green)
  7. Blocked (Color: Red)
- **Default Value:** Draft

**Purpose:** Tracks story-specific status for bidirectional synchronization with local .md files.

⚠️ **CRITICAL DISTINCTION:**
- **Epics** use native ClickUp `status` field (Planning, In Progress, Done)
- **Stories** use custom field `story-status` (7 values listed above)

### 3.6 Verify Custom Fields

After creating all 4 fields:

1. Click **Customize** → **Custom Fields** in the Backlog list
2. Verify all 4 fields appear:
   - `epic_number` (Number)
   - `story_number` (Short Text)
   - `story_file_path` (Short Text)
   - `story-status` (Dropdown - 7 options)

---

## 4. Set Up Tag Structure

Tags organize Epics and Stories for easy filtering.

### 4.1 Tag Naming Conventions

AIOS uses a structured tagging system:

**Epic Tags:**
- `epic` - Applied to all Epic tasks
- `epic-{N}` - Specific Epic number (e.g., `epic-5`, `epic-12`)

**Story Tags:**
- `story` - Applied to all Story tasks
- `epic-{N}` - Links story to its Epic (e.g., `epic-5`)
- `story-{N}.{M}` - Specific Story identifier (e.g., `story-5.2.2`)

### 4.2 Create Tags

Tags are created automatically when AIOS creates tasks. However, you can pre-create them:

1. In the Backlog list, click **Tags** filter → **+ Create Tag**
2. Create initial tags:
   - `epic` (Color: Blue)
   - `story` (Color: Green)

Additional tags (`epic-5`, `story-5.2.2`, etc.) will be created automatically as Epics and Stories are added.

### 4.3 Tag Usage Examples

**Epic Task Example:**
- Tags: `epic`, `epic-5`
- Name: "Epic 5: Tools System"
- Status: Planning

**Story Task Example:**
- Tags: `story`, `epic-5`, `story-5.2.2`
- Name: "Story 5.2.2: ClickUp Synchronization Layer"
- Parent: Epic 5 task (subtask relationship)
- Custom Field `story-status`: Draft

---

## 5. Configure Status Settings

### 5.1 Epic Status Configuration (Native Field)

Epics use ClickUp's **native status field**:

**Required Statuses for Epics:**
1. **Planning** - Epic is in planning phase
2. **In Progress** - Epic is actively being worked on
3. **Done** - Epic is complete

**To Configure:**

1. Open a test Epic task in the Backlog list
2. Click the **Status** dropdown (native field, top of task)
3. Ensure these statuses exist:
   - Planning (or create by typing "Planning")
   - In Progress (usually exists by default)
   - Done (usually exists by default)

### 5.2 Story Status Configuration (Custom Field)

Stories use the **custom field `story-status`** (configured in Section 3.5):

**Story Statuses (Custom Field):**
1. Draft
2. Ready for Dev
3. In Progress
4. Ready for Review
5. Review
6. Done
7. Blocked

These were configured when you created the `story-status` custom field dropdown.

### 5.3 Status Mapping Reference

**Bidirectional Mapping (Story ↔ ClickUp):**

```
Local .md Status          ←→  ClickUp story-status Field
────────────────────────      ──────────────────────────
Draft                     ←→  Draft
Ready for Review          ←→  Ready for Review
Review                    ←→  Review
In Progress               ←→  In Progress
Done                      ←→  Done
Blocked                   ←→  Blocked

Special Case:
Ready for Review          ←   Ready for Dev (ClickUp only)
```

**Epic Status (Native Field Only):**
- Planning
- In Progress
- Done

---

## 6. API Authentication Setup

AIOS requires API access to create and sync tasks.

### 6.1 Generate ClickUp API Token

1. Click your **profile icon** (bottom left) → **Settings**
2. Navigate to **Apps** section
3. Scroll to **API Token**
4. Click **Generate** (or **Regenerate** if one exists)
5. **Copy the token** - you won't see it again!

Example token format: `pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456`

⚠️ **Security Warning:** Treat this token like a password. It grants full access to your ClickUp workspace.

### 6.2 Configure AIOS with API Token

**Option A: Environment Variable (Recommended)**

1. Create or edit `.env` file in your AIOS project root:
   ```bash
   CLICKUP_API_TOKEN=pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
   ```

2. Add `.env` to `.gitignore` to prevent committing the token:
   ```bash
   echo ".env" >> .gitignore
   ```

**Option B: MCP Configuration**

1. Edit your Claude Code MCP configuration:
   ```json
   {
     "mcpServers": {
       "clickup": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-clickup"],
         "env": {
           "CLICKUP_API_TOKEN": "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456"
         }
       }
     }
   }
   ```

### 6.3 Verify API Access

Run the validation script to test your setup:

```bash
npm run validate-clickup-config
```

Expected output:
```
✅ All required custom fields are correctly configured!
   List "Backlog" is ready for AIOS story synchronization.
```

---

## 7. Validation and Testing

### 7.1 Run Configuration Validation

```bash
# Validate ClickUp configuration
npm run validate-clickup-config

# Validate with specific list name
npm run validate-clickup-config -- --list "Backlog"
```

The script checks:
- ✅ Backlog list exists
- ✅ All 4 custom fields exist
- ✅ Custom field types are correct
- ✅ story-status dropdown has all 7 required values
- ✅ API authentication works

### 7.2 Manual Test: Create Test Epic

**Create a test Epic to validate your setup:**

1. In the Backlog list, click **+ New Task**
2. **Name:** `Epic 99: Test Epic`
3. **Status:** Planning (native field)
4. **Tags:** Add tags `epic`, `epic-99`
5. **Custom Fields:**
   - `epic_number`: 99
   - Leave others empty (not needed for Epics)
6. **Save**

### 7.3 Manual Test: Create Test Story via AIOS

**Test the full AIOS story creation workflow:**

```bash
# Activate AIOS PO agent
@po

# Create story for test Epic 99
*create-story --epic 99 --story 1 --title "Test Story"
```

**Expected Results:**

1. ✅ AIOS finds Epic 99 in ClickUp
2. ✅ Creates local story file: `docs/stories/99.1.test-story.md`
3. ✅ Creates ClickUp task as **subtask of Epic 99**
4. ✅ Story task has:
   - Name: "Story 99.1: Test Story"
   - Tags: `story`, `epic-99`, `story-99.1`
   - Parent: Epic 99 task
   - Custom Fields:
     - `epic_number`: 99
     - `story_number`: "99.1"
     - `story_file_path`: "docs/stories/99.1.test-story.md"
     - `story-status`: Draft
5. ✅ Local story file has ClickUp metadata in frontmatter

### 7.4 Manual Test: Status Synchronization

**Test bidirectional status sync:**

1. **Local → ClickUp:**
   - Edit `docs/stories/99.1.test-story.md`
   - Change `**Status:** Draft` → `**Status:** In Progress`
   - Save file
   - Verify: ClickUp task's `story-status` custom field updates to "In Progress"

2. **ClickUp → Local:**
   - In ClickUp, change story-status to "Review"
   - Run manual sync: `npm run sync-story -- --story 99.1`
   - Verify: Local file status updates to "Review"

### 7.5 Cleanup Test Data

After successful testing, clean up:

1. Delete test story: `docs/stories/99.1.test-story.md`
2. Delete ClickUp tasks: Epic 99 and Story 99.1
3. Remove test tags: `epic-99`, `story-99.1`

---

## 8. Troubleshooting

### 8.1 Common Issues

#### Issue: "List 'Backlog' not found"

**Cause:** List name is incorrect or doesn't exist.

**Solution:**
1. Verify list name is exactly `Backlog` (case-sensitive)
2. Check you're in the correct ClickUp workspace
3. List must be a **List**, not a Folder or Space

#### Issue: "Custom field 'story-status' not found"

**Cause:** Custom field missing or incorrectly named.

**Solution:**
1. Navigate to Backlog list → **Customize** → **Custom Fields**
2. Verify field name is exactly `story-status` (with hyphen)
3. Verify field type is **Dropdown**
4. Re-run validation: `npm run validate-clickup-config`

#### Issue: "API token invalid or expired"

**Cause:** API token is incorrect, expired, or not configured.

**Solution:**
1. Go to ClickUp Settings → Apps → API Token
2. Regenerate token if needed
3. Update `.env` or MCP configuration with new token
4. Restart Claude Code to reload configuration

#### Issue: "Epic not found in ClickUp"

**Cause:** Epic doesn't exist or doesn't have correct tags.

**Solution:**
1. Verify Epic exists in Backlog list
2. Check Epic has tags: `epic`, `epic-{N}`
3. Verify Epic status is "Planning" or "In Progress" (not "Done")
4. Epic name should follow format: "Epic {N}: {Title}"

#### Issue: "Story created locally but ClickUp sync failed"

**Cause:** ClickUp API error, rate limit, or network issue.

**Solution:**
1. Check network connection
2. Verify API token is valid
3. Check ClickUp rate limit (100 requests/minute)
4. Re-run story creation after fixing issue
5. Story file will retain metadata for future sync attempts

#### Issue: "Dropdown option 'Ready for Dev' missing"

**Cause:** story-status dropdown doesn't have all required values.

**Solution:**
1. Edit `story-status` custom field
2. Add missing dropdown options (see Section 3.5)
3. Ensure all 7 options exist in correct order
4. Re-run validation script

### 8.2 Validation Script Errors

**Error: "Field type mismatch"**

Example:
```
❌ epic_number: Type mismatch: expected 'number', got 'text'
```

**Solution:** Delete and recreate the field with correct type.

**Error: "Missing dropdown options"**

Example:
```
❌ story-status: Missing dropdown options: Ready for Dev, Blocked
```

**Solution:** Edit the dropdown custom field and add missing options.

### 8.3 Getting Help

**If you continue to experience issues:**

1. **Check Validation Output:**
   ```bash
   npm run validate-clickup-config
   ```

2. **Review AIOS Logs:**
   - Check console output for error messages
   - Look for ClickUp API error codes

3. **Verify ClickUp Permissions:**
   - Ensure you have Admin/Owner role
   - Verify API token has read/write permissions

4. **Contact Support:**
   - AIOS GitHub Issues: https://github.com/yourusername/aios/issues
   - ClickUp Support: https://help.clickup.com

---

## Appendix A: Quick Reference

### Custom Fields Summary

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `epic_number` | Number | Epics only | Epic number (e.g., 5) |
| `story_number` | Text | Stories only | Full story ID (e.g., "5.2.2") |
| `story_file_path` | Text | Stories only | Path to story .md file |
| `story-status` | Dropdown | Stories only | Story-specific status (7 options) |

### Tag Structure Summary

| Entity | Required Tags | Example |
|--------|---------------|---------|
| Epic | `epic`, `epic-{N}` | `epic`, `epic-5` |
| Story | `story`, `epic-{N}`, `story-{N}.{M}` | `story`, `epic-5`, `story-5.2.2` |

### Status Configuration Summary

| Entity | Status Field | Valid Values |
|--------|--------------|--------------|
| Epic | Native `status` | Planning, In Progress, Done |
| Story | Custom `story-status` | Draft, Ready for Dev, In Progress, Ready for Review, Review, Done, Blocked |

### CLI Commands Summary

```bash
# Validate ClickUp configuration
npm run validate-clickup-config

# Manual sync: ClickUp → Local
npm run sync-story -- --story 5.2.2

# Create story (AIOS PO agent)
@po
*create-story --epic 5 --story 2 --title "New Feature"
```

---

## Appendix B: ClickUp API Rate Limits

**ClickUp API Rate Limit:** 100 requests per minute

**AIOS Optimizations:**
- Caches Epic task_id after first lookup
- Batches operations where possible
- Implements exponential backoff on rate limit errors
- Debounces rapid changes (waits 5 seconds after last edit)

**If you hit rate limits:**
1. Wait 60 seconds and retry
2. Reduce frequency of story updates
3. Contact ClickUp support to request higher limits

---

## Appendix C: Security Best Practices

**API Token Security:**
- ✅ Store token in `.env` file (never commit to git)
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variables in CI/CD pipelines
- ✅ Rotate tokens periodically (every 90 days)
- ✅ Revoke tokens immediately if compromised

**ClickUp Workspace Security:**
- ✅ Use Team or Private workspace (not Public)
- ✅ Enable two-factor authentication (2FA)
- ✅ Limit API token permissions to minimum required
- ✅ Regularly audit workspace members
- ✅ Use ClickUp's guest permissions for external collaborators

---

## Appendix D: Migration from Existing ClickUp Setup

**If you already have Epics and Stories in ClickUp:**

1. **Add Custom Fields:**
   - Add all 4 required custom fields to Backlog list
   - Manually populate custom fields for existing tasks

2. **Update Tags:**
   - Add `epic` and `epic-{N}` tags to Epic tasks
   - Add `story`, `epic-{N}`, and `story-{N}.{M}` tags to Story tasks

3. **Convert to Subtasks:**
   - Manually set Epic as parent for each Story task
   - In ClickUp: Drag Story task onto Epic task to create subtask relationship

4. **Update Local Story Files:**
   - Add ClickUp metadata to frontmatter:
     ```yaml
     clickup:
       task_id: "{existing_task_id}"
       epic_task_id: "{existing_epic_task_id}"
       list: "Backlog"
       url: "https://app.clickup.com/t/{existing_task_id}"
       last_sync: "{current_timestamp}"
     ```

5. **Run Validation:**
   ```bash
   npm run validate-clickup-config
   ```

---

**Guide Version:** 1.0
**Last Updated:** 2025-10-10
**Next Review:** 2025-11-10

For the latest version of this guide, see: `docs/clickup-setup-guide.md`
