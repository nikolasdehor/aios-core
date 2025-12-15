# Manual Testing Guide: ClickUp Story Synchronization

**Story:** 5.2.2 - ClickUp Synchronization Layer
**Purpose:** Validate bidirectional synchronization between local story files and ClickUp tasks
**Estimated Time:** 30-45 minutes
**Prerequisites:** ClickUp API access, AIOS project setup, Backlog list configured

---

## Setup Requirements

### ClickUp Configuration

Before starting manual testing, ensure ClickUp is configured correctly:

1. **Workspace Access:** You have access to the AIOS ClickUp workspace
2. **Backlog List:** List "Backlog" exists with all required custom fields
3. **Custom Fields Validated:** Run `npm run validate-clickup-config` to verify configuration
4. **API Token:** Environment variable `CLICKUP_API_TOKEN` is set

**Validation Command:**
```bash
npm run validate-clickup-config
```

**Expected Output:**
```
✅ All required custom fields are correctly configured!
   List "Backlog" is ready for AIOS story synchronization.
```

### Local Environment Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Verify MCP Tools:**
   ```bash
   claude mcp list
   ```

   Confirm `clickup` MCP server is listed and active.

3. **Check Git Status:**
   ```bash
   git status
   ```

   Ensure working directory is clean before testing.

---

## Manual Test Cases

### Test Case 1: Create Epic in ClickUp Backlog

**Objective:** Verify Epic creation with correct tags and status for story dependency.

**Steps:**

1. **Open ClickUp Workspace**
   - Navigate to your AIOS workspace
   - Select the "Backlog" list

2. **Create New Epic Task**
   - Click "+ New Task" button
   - **Task Name:** `Epic 99: Manual Testing Epic`
   - **Status:** Set to "Planning" or "In Progress" (use dropdown)
   - **Tags:** Add tags in this exact order:
     - `epic` (general epic tag)
     - `epic-99` (specific epic identifier)

3. **Verify Epic Configuration**
   - Open the Epic task details
   - Confirm status is "Planning" or "In Progress"
   - Confirm both tags (`epic` and `epic-99`) are visible
   - **Record Epic Task ID:** Click "Copy Task ID" (will look like `abc123xyz`)

**Expected Result:**
- ✅ Epic task created with name "Epic 99: Manual Testing Epic"
- ✅ Status is "Planning" or "In Progress"
- ✅ Both tags (`epic`, `epic-99`) are applied
- ✅ Task appears in Backlog list

**Pass/Fail:** [ ]

**Notes:**
_Record any issues or observations here_

---

### Test Case 2: Run create-next-story for Epic 99, Story 1

**Objective:** Test story creation workflow with Epic verification and ClickUp synchronization.

**Steps:**

1. **Trigger Story Creation**
   - Use AIOS master agent or directly invoke:
   ```bash
   # Option A: Via AIOS Master
   @aios-master *task create-next-story

   # Option B: Direct command (if available)
   npm run create-story -- --epic 99 --story 1
   ```

2. **Provide Story Details When Prompted**
   - **Epic Number:** `99`
   - **Story Number:** `1`
   - **Story Title:** `Manual Test Story for ClickUp Sync`
   - **Story Type:** `Feature`
   - **Complexity:** `Low`

3. **Monitor Console Output**
   - Look for: `✅ Found Epic 99 (task_id: ...)`
   - Look for: `✅ Story created in ClickUp`
   - Look for: `✅ Story 99.1 created and synced to ClickUp`

4. **Check Local File Created**
   ```bash
   ls docs/stories/99.1.*.md
   ```

5. **Read Story Frontmatter**
   ```bash
   head -n 20 docs/stories/99.1.*.md
   ```

   Verify `clickup:` section exists with:
   - `task_id`
   - `epic_task_id`
   - `list: "Backlog"`
   - `url`
   - `last_sync`

**Expected Result:**
- ✅ Console shows Epic 99 found
- ✅ Console shows story created in ClickUp
- ✅ Local story file created: `docs/stories/99.1.manual-test-story-for-clickup-sync.md`
- ✅ Story frontmatter contains `clickup:` section with all fields populated
- ✅ `task_id` and `epic_task_id` are valid ClickUp task IDs
- ✅ `url` is valid ClickUp task URL

**Pass/Fail:** [ ]

**Task ID Captured:** _____________

**Story File Path:** _____________

**Notes:**
_Record any issues or observations here_

---

### Test Case 3: Verify Story Appears as Subtask in ClickUp

**Objective:** Confirm parent-child (Epic-Story) relationship in ClickUp.

**Steps:**

1. **Open ClickUp Backlog List**
   - Navigate to Backlog list

2. **Locate Epic 99**
   - Find "Epic 99: Manual Testing Epic"

3. **Expand Epic to Show Subtasks**
   - Click the expand arrow next to Epic 99
   - OR: Open Epic task and view "Subtasks" section

4. **Verify Story Subtask**
   - Confirm story appears as subtask: `Story 99.1: Manual Test Story for ClickUp Sync`
   - Verify indentation shows parent-child relationship

5. **Open Story Task**
   - Click on Story 99.1 to open task details
   - **Verify Description:** Should contain full story markdown
   - **Verify Tags:** Should have 3 tags:
     - `story`
     - `epic-99`
     - `story-99.1`
   - **Verify Custom Fields:**
     - `epic_number`: 99
     - `story_number`: "99.1"
     - `story_file_path`: "docs/stories/99.1.manual-test-story-for-clickup-sync.md"
     - `story-status`: "Draft"

**Expected Result:**
- ✅ Story 99.1 appears as subtask under Epic 99
- ✅ Indentation/hierarchy shows parent-child relationship
- ✅ Story task name is "Story 99.1: Manual Test Story for ClickUp Sync"
- ✅ Story description contains full markdown from local file
- ✅ All three tags are present
- ✅ All four custom fields are populated correctly
- ✅ `story-status` custom field is "Draft"

**Pass/Fail:** [ ]

**Screenshot Attached:** [ ] _(Optional but recommended)_

**Notes:**
_Record any issues or observations here_

---

### Test Case 4: Modify Story Status Locally (Draft → In Progress)

**Objective:** Test local → ClickUp status synchronization.

**Steps:**

1. **Open Local Story File**
   ```bash
   # Replace with actual filename
   code docs/stories/99.1.manual-test-story-for-clickup-sync.md
   ```

2. **Locate Frontmatter Status**
   - Find line: `status: Draft`

3. **Change Status to In Progress**
   ```yaml
   status: In Progress
   ```

4. **Save File**
   - Save changes (Ctrl+S or Cmd+S)

5. **Trigger Synchronization**
   - If automatic hook enabled: sync should trigger on save
   - If manual trigger needed:
     ```bash
     npm run sync-story-to-clickup -- --story 99.1
     ```

6. **Monitor Console Output**
   - Look for: `✅ Story synced to ClickUp (1 changes)`
   - Look for: `Status: Draft → In Progress`

**Expected Result:**
- ✅ File saved successfully
- ✅ Console shows synchronization triggered
- ✅ Console shows status change detected
- ✅ No errors in console output

**Pass/Fail:** [ ]

**Notes:**
_Record any issues or observations here_

---

### Test Case 5: Verify ClickUp story-status Custom Field Updated

**Objective:** Confirm ClickUp receives status update from local file.

**Steps:**

1. **Open ClickUp**
   - Navigate to Backlog list
   - Open Story 99.1 task

2. **Check story-status Custom Field**
   - Scroll to Custom Fields section
   - Locate `story-status` field

3. **Verify Value**
   - Confirm `story-status` shows "In Progress" (not "Draft")

4. **Check Task Description**
   - Verify description still contains full story markdown
   - Confirm status in markdown frontmatter shows "In Progress"

5. **Wait 5-10 Seconds and Refresh**
   - If status hasn't updated, refresh page
   - Check again

**Expected Result:**
- ✅ `story-status` custom field shows "In Progress"
- ✅ Task description updated with new status
- ✅ Update happened within 5-10 seconds
- ✅ No error messages in ClickUp

**Pass/Fail:** [ ]

**Screenshot Attached:** [ ] _(Recommended)_

**Notes:**
_Record any issues or observations here_

---

### Test Case 6: Add Task Completion in Story .md

**Objective:** Test changelog generation and comment synchronization.

**Steps:**

1. **Open Local Story File**
   ```bash
   code docs/stories/99.1.manual-test-story-for-clickup-sync.md
   ```

2. **Locate Tasks Section**
   - Find the `## Tasks` or similar section

3. **Mark a Task as Complete**
   - Change: `- [ ] Example task`
   - To: `- [x] Example task`

   If no tasks exist, add one:
   ```markdown
   ## Tasks
   - [x] Setup testing environment
   - [ ] Run manual tests
   ```

4. **Save File**
   - Save changes

5. **Trigger Synchronization**
   - Automatic or manual trigger as before

6. **Monitor Console**
   - Look for: `✅ Story synced to ClickUp`
   - Look for: `Completed tasks: 1`

**Expected Result:**
- ✅ Task marked complete in local file
- ✅ Synchronization triggered successfully
- ✅ Console shows task completion detected

**Pass/Fail:** [ ]

**Notes:**
_Record any issues or observations here_

---

### Test Case 7: Verify ClickUp Comment Added with Changelog

**Objective:** Confirm automatic changelog comments are created in ClickUp.

**Steps:**

1. **Open ClickUp Story 99.1**
   - Navigate to Backlog → Story 99.1

2. **Scroll to Comments Section**
   - Look for new comment from AIOS system

3. **Verify Comment Content**
   - Comment should be titled: `**Story Updated: {timestamp}**`
   - Should contain `**Changes:**` section
   - Should list: `- Tasks: 1 completed` (or similar)
   - May also list: `- Status: Draft → In Progress`

4. **Check Comment Timestamp**
   - Verify comment was posted within last 5 minutes

5. **Check Comment Author**
   - Should be posted by API user (your AIOS bot account)

**Expected Result:**
- ✅ New comment appears in Comments section
- ✅ Comment contains "Story Updated" title
- ✅ Changelog lists completed tasks
- ✅ Changelog lists status change (if both occurred)
- ✅ Comment timestamp is recent
- ✅ Markdown formatting preserved in comment

**Pass/Fail:** [ ]

**Screenshot Attached:** [ ] _(Recommended)_

**Notes:**
_Record any issues or observations here_

---

### Test Case 8: Manually Change story-status in ClickUp to "Review"

**Objective:** Prepare for ClickUp → Local synchronization test.

**Steps:**

1. **Open ClickUp Story 99.1**
   - Navigate to Backlog → Story 99.1

2. **Locate story-status Custom Field**
   - Find in Custom Fields section

3. **Change Value**
   - Click on `story-status` dropdown
   - Select "Review" from options
   - Save/confirm change

4. **Verify Change Applied**
   - Refresh page
   - Confirm `story-status` shows "Review"

5. **Record Timestamp**
   - Note the current time for sync verification

**Expected Result:**
- ✅ `story-status` custom field changed to "Review"
- ✅ Change persisted after page refresh
- ✅ Dropdown included "Review" option (validates configuration)

**Pass/Fail:** [ ]

**Time Changed:** _____________

**Notes:**
_Record any issues or observations here_

---

### Test Case 9: Run Manual Sync Command (ClickUp → Local)

**Objective:** Test ClickUp → Local status synchronization.

**Steps:**

1. **Run Manual Sync Command**
   ```bash
   npm run sync-story-from-clickup -- --story 99.1
   ```

2. **Monitor Console Output**
   - Look for: `🔍 Fetching story 99.1 from ClickUp...`
   - Look for: `✅ Found story in ClickUp`
   - Look for: `📥 Syncing ClickUp status to local file...`
   - Look for: `Status change: In Progress → Review`
   - Look for: `✅ Local story file updated`

3. **Check for Errors**
   - No error messages should appear
   - Command should exit with code 0

**Expected Result:**
- ✅ Command executes without errors
- ✅ Console shows story found in ClickUp
- ✅ Console shows status change detected
- ✅ Console shows file updated successfully
- ✅ Command completes in < 5 seconds

**Pass/Fail:** [ ]

**Notes:**
_Record any issues or observations here_

---

### Test Case 10: Verify Local .md Status Updated to "Review"

**Objective:** Confirm local file reflects ClickUp status change.

**Steps:**

1. **Open Local Story File**
   ```bash
   code docs/stories/99.1.manual-test-story-for-clickup-sync.md
   ```

2. **Check Frontmatter Status**
   - Locate: `status: Review`
   - Should have changed from "In Progress"

3. **Check last_sync Timestamp**
   - Locate: `clickup.last_sync: {timestamp}`
   - Verify timestamp is recent (within last minute)

4. **Run Git Diff**
   ```bash
   git diff docs/stories/99.1.manual-test-story-for-clickup-sync.md
   ```

   Should show:
   ```diff
   -status: In Progress
   +status: Review

   -last_sync: {old_timestamp}
   +last_sync: {new_timestamp}
   ```

5. **Verify File Integrity**
   - Ensure no other content was modified
   - Verify markdown structure intact

**Expected Result:**
- ✅ `status` field shows "Review"
- ✅ `last_sync` timestamp updated to recent time
- ✅ No other file content modified
- ✅ File structure and formatting preserved
- ✅ Git diff shows only expected changes

**Pass/Fail:** [ ]

**Git Diff Output:**
```
{Paste relevant git diff here}
```

**Notes:**
_Record any issues or observations here_

---

## Test Summary

### Test Results Overview

| Test Case | Status | Pass/Fail | Notes |
|-----------|--------|-----------|-------|
| TC1: Create Epic | ⏳ | [ ] | |
| TC2: Create Story | ⏳ | [ ] | |
| TC3: Verify Subtask | ⏳ | [ ] | |
| TC4: Local Status Change | ⏳ | [ ] | |
| TC5: Verify ClickUp Update | ⏳ | [ ] | |
| TC6: Add Task Completion | ⏳ | [ ] | |
| TC7: Verify Changelog Comment | ⏳ | [ ] | |
| TC8: ClickUp Status Change | ⏳ | [ ] | |
| TC9: Run Manual Sync | ⏳ | [ ] | |
| TC10: Verify Local Update | ⏳ | [ ] | |

**Overall Result:** [ ] PASS / [ ] FAIL

**Tests Passed:** ___ / 10

**Critical Failures:**
_List any test cases that failed and are blocking_

---

## Cleanup Instructions

After completing all tests:

1. **Delete Test Epic and Story**
   ```bash
   # Archive in ClickUp (do not delete permanently - may need for debugging)
   # Epic 99: Manual Testing Epic → Archive
   # Story 99.1 → Archive
   ```

2. **Remove Local Test Files**
   ```bash
   git checkout -- docs/stories/99.1.*.md
   # Or delete manually if committed
   ```

3. **Clear Test Data**
   - Remove any test tags from ClickUp if created
   - Reset any modified configurations

---

## Troubleshooting

### Issue: "Epic 99 not found in ClickUp Backlog list"

**Cause:** Epic not created or tags missing.

**Solution:**
1. Verify Epic exists in Backlog list
2. Verify tags `epic` and `epic-99` are applied
3. Verify Epic status is "Planning" or "In Progress"
4. Re-run validation: `npm run validate-clickup-config`

---

### Issue: Story status not updating in ClickUp

**Cause:** Hook not triggered or API error.

**Solution:**
1. Check console for error messages
2. Verify `CLICKUP_API_TOKEN` is set
3. Check ClickUp API rate limits (100 req/min)
4. Retry manually: `npm run sync-story-to-clickup -- --story 99.1`

---

### Issue: Comment not appearing in ClickUp

**Cause:** API permission issue or delay.

**Solution:**
1. Wait 30 seconds and refresh ClickUp
2. Check API token has comment permissions
3. Verify console shows: "✅ Comment added to ClickUp"

---

### Issue: Custom field validation fails

**Cause:** ClickUp configuration incomplete.

**Solution:**
1. Run: `npm run validate-clickup-config`
2. Follow output instructions to fix missing fields
3. Refer to: `docs/clickup-setup-guide.md`

---

## Sign-Off

**Tester Name:** _________________________

**Date Completed:** _________________________

**Signature:** _________________________

**Overall Assessment:**
_Provide summary of testing experience, any bugs found, and recommendations_

---

**End of Manual Testing Guide**
