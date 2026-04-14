# Submission Note

## What I’d test next (with more time)

- **Input validation for query params**
  - `GET /tasks?status=...`: ensure invalid statuses return a clear error (or confirm the product decision to return an empty list).
  - `GET /tasks?page=...&limit=...`: cover `page=0`, negative numbers, non-numeric values, and very large limits.

- **More route-level edge cases**
  - `PUT /tasks/:id`: invalid `priority`, invalid `status`, invalid `dueDate`, and explicitly verifying what “partial updates” are allowed.
  - `POST /tasks`: verify trimming behavior for `title` and ensure the stored value is consistent.

- **Consistency of response shape**
  - Ensure every endpoint returns a consistent task shape (including optional fields like `assignee`) across create/update/complete/assign.

- **Overdue/stats boundary cases**
  - Tasks with `dueDate` exactly equal to “now”, timezone handling, and ensuring `done` tasks are never counted as overdue.

- **Stability & maintainability**
  - Add contract-style tests for status codes and error payloads so future changes don’t unintentionally break clients.

## What surprised me

- **No persistent storage** (in-memory store only). It makes local setup easy, but it also means all data is lost on restart and it’s hard to reason about behavior under real load. I also noticed there’s **no live database integration** at all, which would be required before shipping.

- **A few implementation details didn’t match typical API expectations**
  - Pagination originally skipped the first page of results due to the offset calculation.
  - Status filtering used substring matching instead of an exact match.

- **Project structure**
  - The codebase is relatively small and route-driven. In the architecture I usually follow (controllers / routes / utilities / models / middlewares), I’d keep routes thin and move most request-handling logic into controllers, with routes only wiring endpoints to controller functions.

## Questions I’d ask before shipping to production

- **API behavior decisions**
  - Should invalid query params (status/page/limit) return `400`, or default silently?
  - Should assigning an already-assigned task overwrite, reject, or keep an audit trail?

- **Data persistence & reliability**
  - What is the intended persistence layer (Postgres/Mongo/etc.)? The current in-memory approach won’t work for production.
  - Do we need audit logging (who updated/assigned/completed a task and when)?

- **Security & operational concerns**
  - Will we have authentication/authorization? Who is allowed to update/delete/assign tasks?
  - Do we need rate limiting and request logging for production visibility?

- **Date and timezone handling**
  - Are due dates always expected in UTC? Any business rules around overdue calculation?

