# Tech Spec — Note Card Last Edited Timestamp

**AIDLC phase:** Design (one **Unit** per Tech Spec; split only if independently implementable)  
**Grounding:** This document implements the approved Product Spec and stops at design. Human approval is still required before `/build`.

---

## Overview

| Field | Value |
|-------|-------|
| **Unit / scope** | Add created/last-edited timestamps to note list cards, persist note metadata for create/edit flows, and backfill seeded demo notes so every visible note has a readable timestamp |
| **Feature** | `feature/note-card-last-edited-timestamp/` · GitHub issue `#7` |
| **Product Spec** | `feature/note-card-last-edited-timestamp/product-spec.md` |
| **Status** | In review |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |

## Context

### Summary

This unit adds note timestamp metadata to the existing JSON-backed note model and exposes that metadata on the list view only. New notes must store a created timestamp when saved. Edited notes must preserve their original created timestamp and record a last-edited timestamp when saved. The list route must display `Created: <date/time>` for notes without edit history and `Last edited: <date/time>` for notes with edit history, including the seeded demo data used by local runs and Playwright.

### Existing system & documentation

- **Repo layout / services:** The React SPA lives in `src/`, json-server persistence lives in `server/db.json`, and Playwright coverage with page objects lives in `tests/`.
- **Relevant ADRs:** None in repo.
- **Prior art in repo:**
  - `src/components/ListNotes.js` fetches `GET /notes` and renders one table row per note.
  - `src/components/AddNote.js` creates notes with `POST /notes`.
  - `src/components/EditNote.js` loads a note with `GET /notes/:id` and currently saves with `PUT /notes/:id`.
  - `tests/resources/seedData.json` is copied into `server/db.json` after Playwright runs, so fixture shape and runtime seed shape must stay aligned.
  - Existing DOM ids follow a simple convention such as `notetitle_${id}`, `view_${id}`, and `edit_${id}`.

### Out of scope for this Unit

- Timestamp display on the Add Note, Edit Note, or View Note routes
- Relative time copy such as "2 minutes ago"
- Sorting, filtering, or grouping notes by timestamp
- Multi-event edit history or audit trails
- Server-side migrations beyond the repo-managed JSON fixture files
- CI workflow expansion beyond documenting current expectations for Build+Test

## Architecture

### High-level design

The implementation stays within the current single-page React app and json-server boundary. No new services or routes are required.

1. The note resource grows from a title/description-only shape into a note-with-metadata shape.
2. Create flow adds `createdAt` when a note is first saved.
3. Edit flow preserves `createdAt` and records `updatedAt` at save time.
4. List rendering determines which label to show based on metadata presence:
   - show `Last edited` when `updatedAt` is present
   - otherwise show `Created` using `createdAt`
5. Seeded repo fixtures are backfilled with `createdAt` values so the demo note and Playwright reseed path always satisfy the product requirement for pre-existing notes.
6. Timestamp formatting and label selection should live in a small shared helper so create/edit/list logic does not duplicate metadata rules.

Recommended responsibility split:

- **Route/data components**
  - `src/components/AddNote.js`
  - `src/components/EditNote.js`
  - `src/components/ListNotes.js`
- **Shared timestamp helper**
  - Proposed: `src/utils/formatNoteTimestamp.js`
  - Responsibilities:
    - choose between `Created` and `Last edited`
    - format a readable absolute date/time from an ISO string
    - provide a single contract for UI tests and future reuse
- **Repo-managed fixture backfill**
  - `server/db.json`
  - `tests/resources/seedData.json`

Suggested request/data flow:

```text
Add Note submit
-> POST /notes { title, description, createdAt }
-> navigate to list
-> ListNotes GET /notes
-> render Created label from createdAt

Edit Note load
-> GET /notes/:id
-> hydrate title + description (+ metadata kept in memory)
-> PATCH /notes/:id { title, description, updatedAt }
-> navigate to list
-> ListNotes GET /notes
-> render Last edited label from updatedAt
```

### Integration points

| System | Contract | Notes |
|--------|----------|-------|
| React Router | `/`, `/add`, `edit/:id`, and `view/:id` remain the active routes | No route changes |
| json-server API | `GET /notes`, `GET /notes/:id`, `POST /notes`, and note update requests remain the only persistence boundary | `PATCH /notes/:id` is preferred for edits so additive metadata is not lost |
| Seed fixtures | `server/db.json` and `tests/resources/seedData.json` must contain matching note shapes | Prevents Playwright reseed drift |
| Playwright page objects | Existing ids for title/action links remain stable | Add one stable selector for timestamp text per note row |
| GitHub Actions | The repo currently has an agent-launch workflow but no dedicated test workflow under `.github/workflows/` | Design should assume Build+Test is verified locally unless CI is added separately |

## Data

The persisted note shape becomes:

```json
{
  "id": "1",
  "title": "Test note",
  "description": "This is just a test note.",
  "createdAt": "2026-04-01T12:00:00.000Z",
  "updatedAt": "2026-04-29T14:00:00.000Z"
}
```

Data rules:

- `createdAt`
  - required for newly created notes
  - stored as an ISO 8601 string
  - backfilled into repo seed fixtures for pre-existing demo notes
- `updatedAt`
  - optional / absent for notes that have never been edited
  - stored as an ISO 8601 string when an edit is saved
- Display rule:
  - if `updatedAt` exists, render `Last edited` from `updatedAt`
  - otherwise render `Created` from `createdAt`

Backfill strategy:

- This repo uses committed JSON fixtures rather than a live migrated database.
- Build should backfill `createdAt` directly into `server/db.json` and `tests/resources/seedData.json` for the seeded note set.
- The scope requirement is specifically for seeded/demo notes; handling arbitrary external legacy JSON rows is not required for this unit.

Update semantics:

- The current edit flow uses a full `PUT`, which is risky once metadata fields exist because omitted fields can be dropped.
- Preferred design: switch note edits to `PATCH /notes/:id` so the form updates only mutable fields plus `updatedAt`.
- If Build keeps `PUT`, it must explicitly preserve `createdAt` and any future note metadata on every edit.

## APIs & contracts

- **External API changes:** None beyond extending the existing note payload shape consumed by the SPA.
- **Create contract:** `POST /notes` includes `title`, `description`, and `createdAt`. It should not send `updatedAt` for an unedited note.
- **Edit contract:** `PATCH /notes/:id` includes `title`, `description`, and a fresh `updatedAt` timestamp.
- **Read contract:** `GET /notes` and `GET /notes/:id` return note objects with `createdAt` and optional `updatedAt`.
- **Timestamp formatter contract:**
  - input: note metadata object or timestamp fields
  - output: label (`Created` or `Last edited`), machine-readable ISO string, and user-facing display text
  - output must always include both a date and time component in readable absolute form
- **UI selector contract:**
  - keep `notetitle_${id}`, `view_${id}`, `edit_${id}`, and `delete_${id}`
  - add a stable timestamp selector in the list row; recommended id: `notetimestamp_${id}`

## UI / client

- Only `ListNotes` should surface the timestamp text for this unit.
- The title cell should become a stacked presentation:
  - title remains primary text
  - timestamp becomes secondary/helper text directly beneath the title
- Use semantic timestamp markup where practical:
  - preferred element: `<time>`
  - `dateTime` attribute should hold the ISO string used for the display
- Copy rules:
  - `Created: <readable date/time>`
  - `Last edited: <readable date/time>`
- Preserve existing action links and row layout so the added metadata does not crowd out view/edit/delete controls.
- Avoid duplicating timestamp-selection logic inline in JSX; call a shared helper instead.

Recommended rendering pattern:

```text
Row
├─ Title cell
│  ├─ note title
│  └─ timestamp helper text (<time id="notetimestamp_{id}">...)
├─ View action
├─ Edit action
└─ Delete action
```

Accessibility notes from the frontend review pass:

- Timestamp text should be plain readable content, not icon-only metadata.
- `<time dateTime="...">` gives assistive technology a better machine-readable hook than a generic `<span>`.
- The timestamp should remain visually secondary and not become the dominant element in the cell.

## Security & privacy

- No authentication, authorization, or secret-handling changes are involved.
- The new fields record ordinary note metadata only; they do not introduce sensitive or personal data beyond timestamps already implied by note activity.
- The main safety risk is accidental metadata loss during updates if the edit flow continues to fully replace note records.

## Acceptance criteria (for Review)

Testable conditions that **Review** will check against implementation.

- [ ] Newly created notes persist a `createdAt` timestamp and display `Created: <date/time>` on the list row after returning to the home page.
- [ ] Editing an existing note preserves its original `createdAt`, records `updatedAt`, and changes the list row label to `Last edited: <date/time>`.
- [ ] Seeded/demo notes in both `server/db.json` and `tests/resources/seedData.json` have backfilled created timestamps so they render a visible label without blank states.
- [ ] The timestamp appears on the list row only and does not remove or obscure the note title or action controls.
- [ ] A stable timestamp selector exists per note row for automation.
- [ ] Timestamp formatting is produced through shared logic rather than duplicated string assembly in multiple components.
- [ ] The implementation avoids losing metadata on edit requests, either by using `PATCH` or by preserving all persisted fields in a full replacement payload.

## Testing approach

| Layer | What we prove | Notes |
|-------|----------------|-------|
| Unit | Timestamp helper selects the correct label and formats non-empty absolute date/time text from `createdAt` / `updatedAt` inputs | Freeze time or test with fixed ISO inputs to keep assertions deterministic |
| Integration | Add flow sends `createdAt`, edit flow preserves metadata and sends a fresh `updatedAt`, and list rendering shows title plus timestamp together without breaking actions | Best done with focused component tests and mocked axios responses |
| E2E / manual | Creating a note shows `Created`, editing a note shows `Last edited`, and seeded notes already display `Created` on load | Extend Playwright page objects/selectors with timestamp assertions |

Suggested Build+Test coverage:

- Add a small helper test for timestamp label selection and formatting.
- Add focused UI/integration coverage for:
  - seeded note row showing `Created`
  - newly created note showing `Created`
  - edited note switching to `Last edited`
- Extend Playwright page objects to expose the timestamp locator by note id.
- Add one create-flow E2E assertion and one edit-flow E2E assertion tied to that locator.

Testing reliability guidance from the testing review pass:

- Avoid asserting exact wall-clock instants in browser E2E unless the clock is controlled.
- Prefer fixed ISO fixtures or mocked `Date` values in unit/integration tests.
- In Playwright, assert label transitions and presence of readable timestamp text rather than fragile second-level exact matches.
- Continue isolating test-created data because Playwright runs are fully parallel outside CI and mutate a shared JSON file.

## Rollout & operations

### Rollout plan

- No feature flag is required.
- Roll out as a normal app change together with fixture updates and test updates.
- Apply fixture backfill before running end-to-end tests so the seeded note expectations match the shipped data shape.

### Monitoring & observability

- No production telemetry or deploy-time monitoring changes are required for this demo app unit.
- Confidence comes from targeted automated coverage plus manual verification of list rendering after create and edit flows.
- Because there is no existing CI test workflow in `.github/workflows/`, Build+Test should explicitly run the local Playwright suite before review sign-off.

### Rollback

- Revert the list-row timestamp UI, the metadata write logic, and the fixture updates together.
- Rollback is low risk because JSON Server can tolerate extra fields in existing rows if the UI stops consuming them.
- If the edit path changes to `PATCH`, rolling back should restore the previous update behavior in the same commit.

## Risks & open technical questions

| Risk / question | Mitigation or owner |
|-----------------|---------------------|
| Current edit saves use `PUT`, which can drop additive metadata fields | Preferred design in this spec is to move edits to `PATCH /notes/:id` |
| Seed data is duplicated in `server/db.json` and `tests/resources/seedData.json` | Treat the files as a pair and update both in the same change set |
| Time-based assertions can become flaky or locale-sensitive | Centralize formatting logic and use deterministic fixed inputs in non-E2E tests |
| The product spec requires a synthetic/backfilled timestamp for pre-existing notes, but there is no runtime migration system | Satisfy the requirement by backfilling the repo-managed seed fixtures directly |
| Exact user-facing date/time format is not specified in product language | Build should choose one shared readable absolute formatter and keep tests aligned to that helper contract rather than duplicating formatting assumptions |
| The repo does not currently run automated tests in GitHub Actions | Treat this as an advisory gap outside this feature's scope unless Product requests CI expansion |

## Appendix — review pass findings merged into this spec

| Pass | Finding | Incorporated design response |
|------|---------|------------------------------|
| Architecture / boundaries | Keep the change inside the existing SPA + json-server boundary and avoid introducing state duplication | The spec keeps timestamps as note metadata plus a small shared formatter helper |
| Frontend | Timestamp UI should be secondary, semantically readable, and testable | The spec recommends stacked title/timestamp rendering with a `<time>` element and a stable selector |
| Backend / API | Additive metadata makes full-resource replacement fragile | The spec prefers `PATCH` for edits and makes metadata preservation an acceptance criterion |
| Testing strategy | Clock-sensitive features need deterministic assertions | The spec requires fixed inputs/mocked time for unit/integration tests and softer E2E assertions |
| CI / deploy | There is no feature-specific Docker/deploy surface and no existing test workflow to extend in this repo | The spec keeps rollout simple and calls out local Playwright verification as the required Build+Test path |

## Change history

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-29 | Cursor Cloud Agent | Initial design draft from issue #7, approved product scope, and design review passes |
