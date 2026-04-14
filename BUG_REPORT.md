# Bug Report

This file documents issues found while writing/running tests for the Task API.

---

## 1) Pagination skips the first page of results

**Expected**
- `GET /tasks?page=1&limit=10` should return the first 10 tasks (index 0–9).
- `GET /tasks?page=2&limit=10` should return the next 10 tasks (index 10–19).

**Actual**
- Page 1 starts at index 10 and skips the first 10 tasks.

**How discovered**
- While adding a deterministic pagination test that verifies the returned titles/IDs for `page=1`.

**Fix sketch**
- In `task-api/src/services/taskService.js`, compute offset as `(page - 1) * limit`.
- Consider guarding against invalid values (e.g. page < 1, limit < 1) by normalizing to defaults.

---

## 2) Status filtering matches substrings instead of exact status values

**Expected**
- `GET /tasks?status=todo` should return only tasks whose `status` equals `todo`.
- The filter should not match partial strings.

**Actual**
- Filtering uses substring matching, so a query like `status=do` could match both `todo` and `done`.

**How discovered**
- Code review of `getByStatus()` and a targeted test where `status=do` returns unexpected tasks.

**Fix sketch**
- Change filtering to strict equality in `getByStatus()`.
- Optionally validate the `status` query against the allowed enum values.

---

## 3) Completing a task resets priority

**Expected**
- Marking a task complete should update `status` and `completedAt`.
- Priority should remain unchanged unless explicitly requested.

**Actual**
- `completeTask()` overwrites `priority` to `medium`.

**How discovered**
- Code review of `completeTask()` and a service-level test that completes a `high` priority task.

**Fix sketch**
- Remove the `priority` assignment from `completeTask()` so it preserves the existing priority.

