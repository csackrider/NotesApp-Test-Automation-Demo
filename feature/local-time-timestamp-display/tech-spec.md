# Tech Spec — Local Time Timestamp Display

**AIDLC phase:** Design (one **Unit** per Tech Spec; split only if independently implementable)  
**Grounding:** This document translates the approved-in-thread Product Spec into a Tech Spec and stops at design. Human approval is still required before `/build`.

---

## Overview

| Field | Value |
|-------|-------|
| **Unit / scope** | Change note-list timestamp rendering from forced UTC output to viewer-local time while preserving existing created/last-edited metadata, selectors, and note flows |
| **Feature** | `feature/local-time-timestamp-display/` · GitHub issue `#12` |
| **Product Spec** | `feature/local-time-timestamp-display/product-spec.md` |
| **Status** | In review |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |

## Context

### Summary

The repository already implements note timestamps from issue `#7`: new notes persist `createdAt`, edited notes persist `updatedAt`, and the list route renders either `Created` or `Last edited` through a shared formatter. This unit does not add new timestamp capabilities. It narrows the change to the presentation contract so the same stored ISO timestamps are rendered in the viewer's local timezone instead of a hard-coded UTC format.

### Existing system & documentation

- **Repo layout / services:** The React SPA lives in `src/`, json-server persistence lives in `server/db.json`, and Playwright coverage lives in `tests/`.
- **Relevant ADRs:** None in repo.
- **Prior art in repo:**
  - `src/utils/formatNoteTimestamp.js` centralizes timestamp formatting and currently hard-codes `timeZone: 'UTC'` plus `timeZoneName: 'short'`.
  - `src/components/ListNotes.js` renders timestamp metadata in a `<time>` element with `id="notetimestamp_<id>"` and `dateTime` set to the persisted ISO string.
  - `src/components/AddNote.js` writes `createdAt` on note creation.
  - `src/components/EditNote.js` writes `updatedAt` with `PATCH /notes/:id` and leaves persisted metadata storage behavior intact.
  - `src/utils/formatNoteTimestamp.test.js`, `src/components/NoteTimestamp.integration.test.js`, and `tests/NotesTests.spec.ts` already exercise timestamp behavior but currently assert UTC-oriented output.
  - `.github/workflows/aidlc-agent-launch.yml` exists for AIDLC orchestration, but the app repo does not currently have a dedicated automated test workflow for the timestamp feature.

### Out of scope for this Unit

- Changing how timestamps are stored in json-server data
- Adding timezone preferences, settings, or account-level locale controls
- Introducing relative time copy such as "2 minutes ago"
- Expanding timestamp display beyond the existing list-row experience
- Changing create/edit routing, note actions, or note sorting behavior
- CI expansion beyond documenting the current verification gap

## Architecture

### High-level design

The implementation stays inside the current client-side formatting boundary. No new routes, APIs, services, or persisted fields are required.

Current display flow:

```text
Persisted ISO timestamp
-> getNoteTimestampDetails(note)
-> formatNoteTimestamp(isoString)
-> ListNotes <time id="notetimestamp_{id}">
```

Design change for this unit:

1. Keep `createdAt` / `updatedAt` storage as canonical ISO 8601 timestamps.
2. Keep `getNoteTimestampDetails(note)` as the label-selection boundary:
   - `Last edited` when `updatedAt` exists
   - otherwise `Created` from `createdAt`
3. Change `formatNoteTimestamp(isoString)` so it formats in the runtime's local timezone instead of forcing UTC.
4. Remove the UTC-specific display token from the user-facing text. Recommended implementation: do **not** pass `timeZone: 'UTC'` or `timeZoneName: 'short'` to the formatter.
5. Preserve the `<time dateTime={isoString}>` machine-readable value so automation and assistive technology still use the original persisted instant.

Recommended responsibility split:

- **Persistence and metadata ownership**
  - `src/components/AddNote.js`
  - `src/components/EditNote.js`
  - No change to write semantics for this unit
- **Timestamp selection and formatting**
  - `src/utils/formatNoteTimestamp.js`
  - Responsibilities:
    - choose `Created` vs `Last edited`
    - convert the stored ISO instant into a readable local-time string
    - expose one stable formatting contract for list rendering and tests
- **Timestamp rendering**
  - `src/components/ListNotes.js`
  - Responsibilities:
    - keep existing selector and `<time>` semantics
    - render the helper's text without regressing title/actions layout

### Integration points

| System | Contract | Notes |
|--------|----------|-------|
| json-server note resource | Stored `createdAt` and `updatedAt` remain ISO strings representing absolute instants | No schema or seed-shape changes required |
| Shared formatter | `formatNoteTimestamp` must stop forcing UTC and must produce local-time output from the same ISO input | Keep invalid-date handling intact |
| Label selector | `getNoteTimestampDetails` keeps current precedence rules between `updatedAt` and `createdAt` | No label copy change |
| List row DOM | `#notetimestamp_<id>` and `<time dateTime="...">` remain stable | Minimizes Playwright churn |
| Playwright | Timestamp scenarios need a known non-UTC browser timezone to prove the behavior change deterministically | Prefer suite-scoped `timezoneId` for timestamp-focused cases |
| Local/CI test execution | `package.json` currently maps `npm test` to Playwright only | React/Jest timestamp tests are not currently covered by the default app test command |
| GitHub Actions | Only the AIDLC launcher workflow exists in this repo | No deployment or container surface is affected by this unit |

## Data

- No new data fields are introduced.
- `createdAt` and `updatedAt` remain stored as ISO 8601 UTC timestamps, which continue to act as the canonical persisted representation.
- The display layer converts those instants into local wall-clock text for the viewer.
- The `<time>` element's `dateTime` attribute should continue to carry the raw ISO string rather than the localized text.
- No seed-data migration is required because the existing timestamp metadata already exists in both `server/db.json` and `tests/resources/seedData.json`.

## APIs & contracts

- **External API changes:** None.
- **Create contract:** unchanged; new notes still persist `createdAt` as an ISO string.
- **Edit contract:** unchanged; edited notes still persist `updatedAt` as an ISO string through the current patch flow.
- **Read contract:** unchanged; note rows still provide `createdAt` and optional `updatedAt`.
- **Formatter contract:**
  - input: ISO string
  - output: readable absolute timestamp string in the runtime's local timezone
  - invalid input: `null`
  - recommendation: keep the format anchored to the current `en-US` date/time style for continuity, but remove explicit timezone forcing and explicit UTC suffixes
- **Timestamp details contract:**
  - input: note object containing `createdAt` and/or `updatedAt`
  - output: `{ label, isoString, displayText, text }`
  - `label` remains `Created` or `Last edited`
  - `text` remains `${label}: ${displayText}`
- **Testing contract:** exact rendered strings may be asserted only when the runtime timezone is pinned to a known non-UTC zone; otherwise tests should assert label preservation and absence of UTC-specific copy.

## UI / client

- User-visible scope stays limited to the note list.
- `Created` and `Last edited` labels remain unchanged.
- The timestamp continues to render as secondary helper text beneath the note title in the existing row cell.
- The `<time>` element remains the preferred semantic wrapper.
- The displayed text should no longer show the forced `UTC` suffix or any equivalent hard-coded UTC indicator.
- This unit should not introduce a timezone toggle, locale picker, tooltip, or relative-time presentation.
- Browser-local formatting is intentionally derived from the viewer's environment so the same stored note can appear at different local clock times for different viewers while still representing the same instant.

Frontend review guidance merged into this design:

- Keep the timestamp visually secondary so the row still scans primarily by note title.
- Preserve stable ids used by current page objects.
- Avoid browser-variant local timezone abbreviations in the visible text contract if they make assertions brittle; a local absolute date/time string without a timezone token is sufficient for the product requirement.

## Security & privacy

- No authentication, authorization, or secret-handling changes are involved.
- No new sensitive data is collected or exposed.
- The security profile is unchanged because this unit only reformats already-stored timestamps on the client.

## Acceptance criteria (for Review)

Testable conditions that **Review** will check against implementation.

- [ ] Seeded notes that already display `Created` continue to render a visible timestamp in the list row after the change.
- [ ] Newly created notes still render `Created: ...` on the list row after returning to the home page.
- [ ] Edited notes still render `Last edited: ...` on the list row after returning to the home page.
- [ ] In a controlled non-UTC runtime timezone, the visible timestamp text reflects that local timezone instead of the previous forced UTC rendering.
- [ ] The user-facing timestamp text no longer includes the hard-coded `UTC` suffix.
- [ ] `#notetimestamp_<id>` and the `<time dateTime="...">` contract remain intact.
- [ ] The only intended user-visible change is timestamp presentation; note storage, routes, labels, and actions remain otherwise unchanged.
- [ ] Timestamp formatting logic remains centralized rather than duplicated inline in list rendering or tests.

## Testing approach

| Layer | What we prove | Notes |
|-------|----------------|-------|
| Unit | `formatNoteTimestamp` converts a fixed ISO instant into the expected local wall-clock text in a pinned non-UTC timezone and still returns `null` for invalid input | Use a controlled timezone such as `America/New_York` or `America/Los_Angeles`; avoid relying on the agent machine's ambient timezone |
| Integration | `getNoteTimestampDetails` preserves `Created` vs `Last edited` behavior, `ListNotes` keeps the `<time>` semantics, and rendered text no longer includes `UTC` | Existing React tests in `src/` should update their expectations under the same pinned timezone strategy |
| E2E / manual | Seeded note, create flow, and edit flow all show local-time output on the list page with stable selectors | Prefer Playwright browser-context timezone pinning for deterministic exact-value assertions |

Suggested Build+Test coverage:

- Update `src/utils/formatNoteTimestamp.test.js` so the primary happy-path assertions run in a known non-UTC timezone.
- Update `src/components/NoteTimestamp.integration.test.js` to preserve existing label/dateTime checks while changing the rendered text expectations away from UTC-specific strings.
- Update `tests/NotesTests.spec.ts` only as far as needed to keep timestamp assertions deterministic; for exact time assertions, scope a `timezoneId` to the timestamp-focused tests instead of changing all browser tests globally.
- Because `package.json` currently defines `npm test` as Playwright only, Build+Test should explicitly decide whether to:
  - add a separate React/Jest invocation for the formatter and integration tests, or
  - treat those tests as adjunct local checks and rely on Playwright/manual evidence for the default path.

Testing reliability guidance from the testing review pass:

- Do not depend on the developer machine's actual timezone for pass/fail behavior.
- Use fixed fixture timestamps that are away from DST transition boundaries when asserting exact formatted times.
- Prefer deterministic timezone control over broad regex assertions wherever practical so the local-time behavior is actually proven.
- If a test environment is intentionally left in UTC, it should not be the only evidence for this feature because the behavior change can become invisible.

## Rollout & operations

### Rollout plan

- No feature flag is required.
- Ship as a normal frontend formatting change.
- No database migration, fixture migration, or deployment-order choreography is required.

### Monitoring & observability

- No new logs, metrics, or tracing are required for this demo app unit.
- Confidence should come from deterministic timestamp-focused tests plus a quick manual browser check in a non-UTC timezone.
- The repo currently lacks a feature-specific CI workflow for these tests, so review evidence should explicitly mention what was run.

### Rollback

- Revert the formatter change and the related test expectation updates together.
- Rollback is low risk because stored data and API contracts do not change.

## Risks & open technical questions

| Risk / question | Mitigation or owner |
|-----------------|---------------------|
| Timezone-sensitive assertions can become flaky if they inherit the host timezone implicitly | Pin the timezone in timestamp-focused tests instead of relying on ambient runtime settings |
| If local timezone abbreviations are included in the output, browsers and environments may render them differently | Preferred design is to remove explicit timezone-name output from the visible contract |
| Review evidence can be misleading when run in a UTC environment because the clock time may look unchanged | Require at least one controlled non-UTC verification path |
| The repo's default `npm test` command runs Playwright, while existing unit/integration timestamp tests live under `src/` | Build should either add a separate React test invocation or document the gap and validate through Playwright/manual evidence |
| The consumer repo does not currently include `docs/AIDLC.md`, even though the skill references it as ground truth | This spec is grounded in the repo's existing AIDLC artifacts, current feature docs, and issue-driven scope; restoring that doc remains a process/documentation follow-up outside this unit |

## Appendix — review pass findings merged into this spec

| Pass | Finding | Incorporated design response |
|------|---------|------------------------------|
| Architecture / boundaries | The existing formatter helper is already the correct seam; avoid widening the change into storage or routing | The spec keeps the change inside `formatNoteTimestamp` plus dependent tests |
| Frontend | Preserve labels, semantics, and stable ids while changing only the human-readable time string | The spec keeps `<time>` and `#notetimestamp_<id>` and limits UI change to visible formatting |
| Backend / API | Stored timestamps should remain canonical ISO instants; presentation should change at the client edge only | The spec makes no API or schema changes |
| Testing strategy | Local-time features are only trustworthy when test timezone is controlled | The spec requires non-UTC timezone pinning for exact-value assertions |
| CI / Docker / deploy | The repo has no app-level Docker surface and no dedicated timestamp CI workflow; operational risk is low but automated coverage gaps are real | The spec records the gap and keeps rollout/rollback simple |

## Change history

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-29 | Cursor Cloud Agent | Initial design draft for issue #12 based on the approved-in-thread Product Spec, current timestamp implementation, and required design review passes |
