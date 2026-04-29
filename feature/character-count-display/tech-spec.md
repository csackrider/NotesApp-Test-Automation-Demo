# Tech Spec — Character Count Display

**AIDLC phase:** Design (one **Unit** per Tech Spec; split only if independently implementable)  
**Grounding:** This document implements the approved **Product Spec** and must **link** to existing **ADRs** instead of re-deriving org-wide architecture.

---

## Overview

| Field | Value |
|-------|-------|
| **Unit / scope** | Add a live character count to the note text field on the add and edit note routes without changing persistence or routing behavior |
| **Feature** | `feature/character-count-display/` · GitHub issue `#3` |
| **Product Spec** | `feature/character-count-display/product-spec.md` |
| **Status** | Draft - awaiting technical approval |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |

## Context

### Summary

This unit adds a character count below the existing note text textarea on both note-entry routes: `AddNote` and `EditNote`. The count is derived from the textarea's controlled value so it reflects spaces, line breaks, pasted text, and edits exactly as entered. The feature remains frontend-only: no API, routing, or database schema changes are required.

### Existing system & documentation

- **Repo layout / services:** React SPA routes and components live in `src/`, json-server data lives in `server/db.json`, and Playwright tests with page objects live in `tests/`.
- **Relevant ADRs:** None in repo.
- **Prior art in repo:**
  - `src/components/AddNote.js` and `src/components/EditNote.js` already use local React state for `title` and `description`.
  - `src/components/EditNote.js` hydrates existing note text asynchronously with `axios.get(...)`.
  - `tests/pages/AddNotePage.ts` and `tests/pages/EditNotePage.ts` already model the note editor controls through stable ids such as `#notetext`.

### Out of scope for this Unit

- Character counts for the title field
- Character limits, warnings, or validation rules
- Any change to saved note payloads or JSON schema
- Read-only note view changes
- Analytics, feature flags, or deployment/environment changes

## Architecture

### High-level design

The implementation stays within the existing route-based form architecture.

1. `AddNote` remains the route container for create-note submission.
2. `EditNote` remains the route container for fetching and updating an existing note.
3. A shared presentational component should own the note-entry field rendering so the note text field, count placement, and accessibility wiring stay consistent across add and edit flows.
4. Character count is derived from the current `description` string rather than stored in component state or persisted to the backend.
5. The add route shows `0 characters` on initial render.
6. The edit route should avoid a misleading transient `0 characters` before note data loads; instead, the count becomes visible as soon as the existing note text has been loaded into form state.

Recommended component split:

- **Route containers**
  - `src/components/AddNote.js`
  - `src/components/EditNote.js`
- **Shared presentational child**
  - Proposed: `src/components/NoteEditorFields.js`
  - Responsibilities:
    - render title and note text controls
    - render character count beneath the note text textarea
    - wire label-to-control associations
    - expose a stable selector for the count element
- **Optional helper**
  - Proposed: `src/utils/formatCharacterCount.js`
  - Responsibility: return the exact display string, e.g. `0 characters`, `3 characters`

Example data flow:

```text
AddNote/EditNote state -> description value -> formatCharacterCount(description)
                                       -> shared field component renders count
```

Edit route load sequence:

```text
mount EditNote
-> fetch existing note
-> set title + description
-> mark editor data ready
-> render count for loaded description
-> continue live updates from onChange
```

### Integration points

| System | Contract | Notes |
|--------|----------|-------|
| React Router | `/add` and `edit/:id` continue to mount `AddNote` and `EditNote` | No route changes |
| json-server API | `POST /notes`, `GET /notes/:id`, `PUT /notes/:id` remain unchanged | Character count is not persisted |
| Playwright page objects | Existing ids `#notetitle`, `#notetext`, `#submit`, `#submitEdit` stay stable | Add one stable locator for the count element |
| GitHub Actions Playwright workflow | Existing `playwright.yml` and `playwright.config.ts` runtime remains valid | No CI config changes required for this feature alone |

## Data

- No schema or seed-data changes are required.
- The persisted note shape remains `{ id, title, description }`.
- Character count is a derived UI value only.
- Counting rule: use the current textarea value exactly as represented in React state, including spaces, pasted text, and line breaks.
- The implementation must not add a stored `characterCount` field because the current edit flow performs a full `PUT` with only `title` and `description`.

## APIs & contracts

- **External API changes:** None.
- **Network behavior:** Existing axios requests remain unchanged.
- **UI contract:**
  - `#notetext` remains the textarea selector used by tests and page objects.
  - A new dedicated count element should be rendered directly below the textarea.
  - Proposed stable selector: `id="notetext-character-count"`.
  - Display format must be exactly `N characters`.
  - On Add Note, the counter is visible immediately with `0 characters`.
  - On Edit Note, the counter becomes visible immediately after the existing note text is loaded into the form and reflects that loaded text before any user edits.

## UI / client

- Keep note entry state local to the route components; no context or global store is needed.
- Derive the count from `description.length`; do not maintain a separate `characterCount` state.
- Preserve the current submit button behavior and navigation flow.
- Improve form semantics while touching the markup:
  - bind labels with `htmlFor`
  - use `aria-describedby` on the textarea to associate the helper text/count
- Treat the count as helper text, not validation text.
- Avoid `aria-live` by default so screen readers are not forced to announce the count on every keystroke.
- Preserve the existing field ids to minimize test churn.

Recommended UI behavior by route:

| Route | Initial state | After user input |
|------|---------------|------------------|
| Add Note | Show `0 characters` below an empty textarea | Update count on each textarea change |
| Edit Note | Hide count until existing note text is loaded, then show the loaded count immediately | Update count on each textarea change |

## Security & privacy

- No auth, permission, or secret-handling changes are involved.
- No new user data is collected or persisted.
- Risk is limited to frontend regressions in note entry behavior.

## Acceptance criteria (for Review)

Testable conditions that **Review** will check against implementation.

- [ ] Add Note shows a character count directly below the note text textarea on first render.
- [ ] Add Note displays `0 characters` before any note text is entered.
- [ ] Edit Note shows the current count as soon as existing note text has loaded into the form, without persisting or submitting an extra field.
- [ ] The count reflects the textarea value exactly as entered, including spaces, pasted text, and line breaks.
- [ ] The displayed copy is always formatted as `N characters`.
- [ ] Existing add/edit submit behavior and note persistence remain unchanged.
- [ ] A stable selector exists for the count element and is used by tests/page objects.
- [ ] Accessibility of the touched form markup is improved through proper label association and helper-text wiring.

## Testing approach

| Layer | What we prove | Notes |
|-------|----------------|-------|
| Unit | Exact count formatting logic returns the expected `N characters` string for empty text, plain text, spaces, and line breaks | Best implemented via a small helper function if extracted |
| Integration | Add/edit form rendering shows the counter in the correct location and updates from controlled textarea state; edit flow waits for async data load before asserting initial count | Use focused React component tests with mocked data loading where practical |
| E2E / manual | Add flow and edit flow both surface the counter and update it live in the browser; no submit/navigation regressions | Extend Playwright page objects with a count locator and explicit count assertions |

Suggested Build+Test coverage:

- Add a small focused unit test if a formatter helper is introduced.
- Add targeted component/integration coverage for:
  - Add Note initial empty state
  - Add Note live updates on textarea changes
  - Edit Note loaded-state initial count
  - Edit Note live updates after the async fetch
- Extend Playwright with two focused scenarios:
  - count behavior on Add Note
  - count behavior on Edit Note

Testing reliability notes:

- Avoid fixed sleeps for count assertions; prefer condition-based assertions.
- New Playwright tests should create their own note data and avoid assumptions about global list order because local Playwright runs are parallelized against a shared JSON DB.
- Edit-page assertions must wait for loaded textarea content or count text before asserting the initial edit-state value.

## Rollout & operations

### Rollout plan

- No phased rollout or feature flag is required.
- Ship as a normal frontend change with updated automated tests.

### Monitoring & observability

- No production-specific monitoring changes are required for this UI-only feature.
- Confidence comes from component/integration coverage, Playwright coverage, and manual validation of the add/edit flows.

### Rollback

- Revert the shared field/count UI changes and accompanying tests.
- Because there is no schema or API change, rollback is frontend-only and low risk.

## Risks & open technical questions

| Risk / question | Mitigation or owner |
|-----------------|---------------------|
| Edit route can render before existing note text loads, causing a misleading transient `0 characters` if implemented naively | Design decision in this spec: hide the count until edit data hydration completes, then show the loaded count immediately |
| Add and edit forms are near-duplicates, which can cause selector or copy drift | Use a shared presentational component for the note-entry fields |
| Playwright local runs mutate a shared `server/db.json` while running in parallel | Keep new E2E cases isolated and assert only on note data each test creates |
| Current form labels are not programmatically associated with controls | Improve label wiring as part of this feature since the touched markup already contains the relevant fields |
| Should the count selector follow existing id conventions or introduce a `data-testid`? | Proposed in this spec: use `id="notetext-character-count"` to match current page-object conventions |

## Change history

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-29 | Cursor Cloud Agent | Initial draft from approved Product Spec and design review passes |
