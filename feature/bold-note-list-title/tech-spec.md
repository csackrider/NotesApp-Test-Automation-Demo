# Tech Spec — Bold Note List Title

**AIDLC phase:** Design (one **Unit** per Tech Spec; split only if independently implementable)  
**Grounding:** This document implements the approved Product Spec and stops at design. Human approval is still required before `/build`.

---

## Overview

| Field | Value |
|-------|-------|
| **Unit / scope** | Add explicit bold styling to note titles in the main list view while preserving the existing title-first, timestamp-second row hierarchy and current note workflows |
| **Feature** | `feature/bold-note-list-title/` · GitHub issue `#17` |
| **Product Spec** | `feature/bold-note-list-title/product-spec.md` |
| **Status** | In review |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-04-30 |
| **Last updated** | 2026-04-30 |

## Context

### Summary

This unit is a presentation-only change to the home-page note list. Each note row already renders the note title above optional `Created` or `Last edited` metadata inside `ListNotes`. The design goal is to make the title visually primary by applying explicit bold styling to the title text only, without changing note data, routes, timestamps, or action controls.

### Existing system & documentation

- **Repo layout / services:** The React SPA lives in `src/`, json-server persistence lives in `server/db.json`, and Playwright coverage with page objects lives in `tests/`.
- **Relevant ADRs:** None in repo.
- **Prior art in repo:**
  - `src/components/ListNotes.js` fetches `GET /notes` and renders the note title and optional timestamp in the first table cell of each row.
  - `src/App.css` contains the table styling used by the list view today.
  - `tests/pages/HomePage.ts` already models the title selector as `#notetitle_${id} > div`, so Build should preserve the current title wrapper structure unless there is a compelling reason to update the page object and its callers together.
  - Timestamp work from issues `#7` and `#12` already established a stacked title/timestamp pattern in the same list cell.

### Out of scope for this Unit

- Changing note persistence, payload shape, or JSON seed data
- Changing timestamp wording, formatting, placement, or behavior
- Changing the note detail, add note, or edit note routes
- Adding sorting, filtering, grouping, or layout changes to the note list
- Introducing new UI themes, typography systems, or reusable design tokens beyond the small styling hook needed for this row
- CI or deployment pipeline expansion beyond documenting what Build+Test must verify

## Architecture

### High-level design

The change stays entirely within the presentation layer of the existing SPA.

1. `ListNotes` remains the only component responsible for rendering note rows on the home page.
2. The current title wrapper inside `#notetitle_${id}` gets a dedicated styling hook so the title can be bolded without affecting the timestamp below it.
3. `App.css` (or a similarly scoped stylesheet already used by the app) adds the explicit font-weight rule for that title hook.
4. The timestamp `<time>` element and action links remain unchanged.
5. Because all note rows share the same renderer, the styling applies consistently to seeded notes, newly created notes after returning to the list, and edited notes after returning to the list.

Recommended responsibility split:

- **List row markup**
  - `src/components/ListNotes.js`
  - Responsibilities:
    - keep rendering the note title above timestamp metadata
    - attach a dedicated title styling hook
    - preserve existing row ids and action link ids
- **List row styling**
  - `src/App.css`
  - Responsibilities:
    - apply bold emphasis to the title hook only
    - avoid broad selectors that accidentally bold timestamps or unrelated table content

Suggested rendering contract:

```text
tr
├─ td#notetitle_{id}
│  ├─ title wrapper (explicit bold styling hook)
│  └─ optional <time id="notetimestamp_{id}">
├─ td -> View
├─ td -> Edit
└─ td -> Delete
```

Recommended implementation shape:

- Keep the existing direct child wrapper for the title so current automation selectors continue to work.
- Add a dedicated class such as `note-list-title` to that wrapper.
- Apply bold emphasis with an explicit CSS rule on that class rather than on the entire table cell.

### Integration points

| System | Contract | Notes |
|--------|----------|-------|
| React Router | `/` continues to render `ListNotes` | No route changes |
| json-server API | `GET /notes` remains the only data dependency for the list view | No request or response changes |
| Timestamp helper flow | Existing timestamp rendering behavior stays intact | Bold styling must not change or reformat timestamp output |
| Playwright page objects | `tests/pages/HomePage.ts` currently expects `#notetitle_${id} > div` | Preserve the direct child title wrapper to minimize test churn |
| GitHub Actions / CI | The repo currently contains AIDLC workflow automation but no dedicated app test workflow under `.github/workflows/` | Build+Test should rely on local verification unless CI is expanded separately |

## Data

- No schema, fixture, or persisted note-shape changes are required.
- The feature consumes the existing note fields exactly as they are already returned by json-server.
- Because this is a rendering-only change, seeded notes and runtime-created notes are covered automatically by the shared list component.

## APIs & contracts

- **External API changes:** None.
- **Network behavior:** No new requests and no modified payloads.
- **UI selector contract:**
  - Preserve `#notetitle_${id}` as the list cell id.
  - Preserve the title wrapper as a direct child of that cell so existing page-object selectors remain valid.
  - Add a dedicated styling hook to the title wrapper; recommended class: `.note-list-title`.
- **Styling contract:**
  - The title wrapper must receive explicit bold emphasis.
  - The timestamp element must not inherit that bold emphasis.
  - The title must remain above the timestamp when timestamp metadata is present.

## UI / client

- The user-visible change is limited to the main note list.
- The title should remain the first readable line in the note row and be visually stronger than the timestamp beneath it.
- Build should scope the styling to the title wrapper only; styling the whole `td` would unintentionally bold the timestamp as well.
- Recommended visual treatment:
  - explicit bold font weight on the title wrapper
  - no copy changes
  - no action-button changes
  - no table-layout changes unless needed to preserve existing spacing
- Recommended markup treatment:
  - keep the current wrapper element or an equivalent direct child to preserve stable selectors
  - add a class-based styling hook instead of relying on brittle descendant or inline styles

Accessibility notes from the frontend review pass:

- The title remains plain readable text, so the feature does not require new ARIA attributes.
- Keeping title and timestamp as separate text nodes preserves the established information hierarchy for screen-reader users.
- The emphasis should come from scoped typography only, not from converting the whole cell into a heading or interactive control.

## Security & privacy

- No authentication, authorization, storage, or secret-handling changes are involved.
- No new user data is collected or persisted.
- The primary engineering risk is accidental scope creep into timestamp styling or note-row structure while making the presentation change.

## Acceptance criteria (for Review)

Testable conditions that **Review** will check against implementation.

- [ ] Each note row on the main list renders its title with explicit bold styling.
- [ ] The title remains above the `Created` or `Last edited` timestamp text for notes that show metadata.
- [ ] The timestamp text remains visually secondary and is not bolded by the title styling rule.
- [ ] The change is limited to the main list view and does not alter add, edit, or view note screens.
- [ ] Existing row ids and action-link ids remain stable.
- [ ] The existing title selector contract used by `tests/pages/HomePage.ts` continues to work, or any necessary selector update is performed intentionally across page objects and tests in the same change set.
- [ ] Bold title styling applies consistently to seeded notes and notes that appear in the list after create/edit flows.

## Testing approach

| Layer | What we prove | Notes |
|-------|----------------|-------|
| Unit | No standalone unit test is required unless Build extracts a style helper or reusable presentation utility | Avoid low-value tests that only restate a CSS declaration |
| Integration | `ListNotes` renders the title wrapper with the dedicated styling hook while preserving timestamp and action markup | Best covered with a focused React component test using mocked note data |
| E2E / manual | Seeded notes and notes returned to the list after create/edit flows display a bold title without disturbing timestamp hierarchy or actions | Browser verification may assert computed font weight in Chromium or use manual review if style assertions prove brittle |

Suggested Build+Test coverage:

- Add or update a focused component/integration test for `ListNotes` that confirms:
  - the title wrapper receives the dedicated class or styling hook
  - timestamp markup still renders separately beneath the title when present
  - existing action controls remain visible
- Extend Playwright only if a browser-level style assertion provides meaningful regression protection; otherwise rely on component coverage plus manual visual verification.
- Run the existing Playwright suite after the styling change to confirm the shared list row structure still supports current flows.

Testing guidance from the testing review pass:

- Prefer testing the stable styling hook and row structure over brittle snapshot tests.
- If E2E checks computed style, assert relative hierarchy (`title` stronger than timestamp) or an agreed bold weight threshold rather than depending on browser-default typography quirks.
- Do not add redundant tests on unrelated routes, since the feature is intentionally scoped to one shared list renderer.

## Rollout & operations

### Rollout plan

- No feature flag is required.
- Ship as a normal frontend styling change together with any targeted test updates.
- Because the list renderer is shared, no staged rollout or data migration is needed.

### Monitoring & observability

- No production telemetry or deploy-time monitoring changes are required for this demo app unit.
- Confidence comes from focused UI verification and regression coverage on the list view.
- There is no dedicated CI workflow in `.github/workflows/` for app tests today, so Build+Test should explicitly run the local verification commands before review sign-off.

### Rollback

- Revert the list-row markup/style change and any related tests together.
- Rollback is low risk because no API, routing, or persisted data contract changes are involved.

## Risks & open technical questions

| Risk / question | Mitigation or owner |
|-----------------|---------------------|
| Styling the entire note cell would also bold the timestamp, weakening the intended hierarchy | Scope the CSS rule to the title wrapper only |
| Existing Playwright page objects already depend on the current title wrapper structure | Preserve `#notetitle_${id} > div` or update the page object and all callers intentionally in one change set |
| Browser-level font-weight assertions can be brittle if the spec does not define the test contract clearly | Prefer asserting a dedicated class in component coverage and use manual or relative computed-style verification in E2E |
| The issue asks for a narrow visual change, but touching layout or typography broadly could create unintended UI churn | Keep the implementation limited to `ListNotes` and its relevant CSS rule |
| The repo does not currently have a dedicated app CI workflow under `.github/workflows/` | Treat this as an advisory gap outside the scope of issue `#17` unless Product explicitly broadens the unit |

## Appendix — review pass findings merged into this spec

| Pass | Finding | Incorporated design response |
|------|---------|------------------------------|
| Architecture / boundaries | This is a presentation-layer-only change and should not introduce data or routing churn | The spec limits work to `ListNotes` plus scoped CSS |
| Frontend | The safest implementation preserves existing selectors and bolds only the title text, not the whole cell | The spec keeps the direct child title wrapper and adds a dedicated class-based hook |
| Backend / API | No API or persistence change is necessary for the requested behavior | The spec keeps network and data contracts unchanged |
| Testing strategy | Styling regressions are best covered by focused structure/hook assertions, with browser style checks used selectively | The spec recommends targeted component coverage and optional E2E style verification |
| CI / deploy | There is no feature-specific CI, Docker, or deploy surface to change for this unit | The spec keeps rollout simple and calls out local verification expectations only |

## Change history

| Date | Author | Changes |
|------|--------|---------|
| 2026-04-30 | Cursor Cloud Agent | Initial design draft from issue #17, the approved Product Spec, repo context, and required design review passes |
