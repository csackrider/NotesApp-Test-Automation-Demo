## AIDLC Review Mirror — Issue #7

- **Issue:** `#7` — add "Last edited" timestamp display on each note card
- **Reviewed implementation:** merged PR `#10` (`feat: add note card created and last-edited timestamps`)
- **Review context:** at review time there is **no open PR** for branch `cursor/aidlc-issue-7-review-d450`, and the branch tip matches the merged implementation commit. This file is the durable mirror required by `/review`.
- **Verification run during review:**
  - `CI=1 npx react-scripts test --watch=false --runTestsByPath src/utils/formatNoteTimestamp.test.js src/components/NoteTimestamp.integration.test.js`
  - `npm run build`
  - `npx playwright test tests/NotesTests.spec.ts`

### AIDLC Review — Tech Spec

**Blocking findings:** none

**Advisory findings:** none

**Traceability against `tech-spec.md`:**

- **Create flow persists `createdAt` and returns to the list:** satisfied by `src/components/AddNote.js:11-19`, which posts `title`, `description`, and `createdAt`.
- **Edit flow preserves `createdAt` and records `updatedAt`:** satisfied by the move to `PATCH` in `src/components/EditNote.js:28-36`, which avoids full-record replacement and aligns with the metadata-preservation requirement in `feature/note-card-last-edited-timestamp/tech-spec.md:138-142`.
- **List row shows `Created` vs `Last edited` from shared logic:** satisfied by `src/utils/formatNoteTimestamp.js:11-41` and `src/components/ListNotes.js:35-49`.
- **Stable timestamp selector exists per row:** satisfied by `src/components/ListNotes.js:43-48` via `id="notetimestamp_${post.id}"`, and exercised by `tests/pages/HomePage.ts:46-52`.
- **Seeded/demo notes are backfilled:** satisfied by `server/db.json:1-10` and `tests/resources/seedData.json:1-10`.
- **Timestamp appears on the list row only and does not break note actions:** satisfied by list-only rendering in `src/components/ListNotes.js:31-65`; create/edit/view files do not add timestamp UI.

**Conclusion:** the implementation satisfies the stated acceptance criteria in `feature/note-card-last-edited-timestamp/tech-spec.md:197-207`.

### AIDLC Review — Testing

**Blocking findings:** none

**Advisory findings:**

1. **Advisory — no current GitHub test workflow enforces this coverage on future changes.** The repo's checked-in workflow surface only contains the issue-launch workflow in `.github/workflows/aidlc-agent-launch.yml:1-202`, while the merged PR metadata for `#10` reported no status checks. The feature has good local coverage, but this review gate is still manual unless a test workflow is restored.

**Evidence reviewed:**

- **Unit/helper coverage:** `src/utils/formatNoteTimestamp.test.js:6-49` validates absolute formatting, invalid input handling, `Created`, and `Last edited` label selection.
- **Integration coverage:** `src/components/NoteTimestamp.integration.test.js:43-146` checks seeded-row rendering, list rendering for edited notes, create POST payloads with `createdAt`, and edit PATCH payloads with `updatedAt`.
- **E2E coverage:** `tests/NotesTests.spec.ts:17-109` verifies created timestamps for new notes, last-edited timestamps after edits, and backfilled timestamps for seeded notes. The page object exposes a stable timestamp locator in `tests/pages/HomePage.ts:46-52`.
- **Shared-fixture safety:** `tests/NotesTests.spec.ts:7-10` serializes the suite and `tests/utils/Utils.ts:3-11` reseeds `server/db.json` from the fixture after the run, reducing JSON-server state bleed between timestamp tests.
- **Local verification during this review:** focused Jest tests passed, `npm run build` passed, and Playwright ran `8 passed (8.6s)`.

**Conclusion:** practical testing is sufficient for the feature behavior itself; the remaining gap is CI enforcement, not missing feature coverage.

### AIDLC Review — DevOps

**Blocking findings:** none

**Advisory findings:**

1. **Advisory — review/deploy hygiene depends on manual steps because there is no active test workflow in the current repo tree.** The tech spec already called this out as an out-of-scope advisory (`feature/note-card-last-edited-timestamp/tech-spec.md:242-247`, `:258-263`). Current automation in `.github/workflows/aidlc-agent-launch.yml:1-202` launches agents and edits issues, but it does not build or test the app before or after merge.
2. **Advisory — there was no open PR available for this review pass, so the preferred per-dimension PR comments could not be attached.** The implementation was reviewed against merged PR `#10` instead of an active review thread.

**Operational assessment:**

- **Rollout/rollback:** low-risk app-only change, consistent with the spec's rollback plan in `feature/note-card-last-edited-timestamp/tech-spec.md:248-252`.
- **Data change shape:** additive JSON metadata only; no migration runner, container, or environment changes were introduced.
- **Observability:** acceptable for this demo app because the spec explicitly does not require telemetry changes (`feature/note-card-last-edited-timestamp/tech-spec.md:242-246`).

**Conclusion:** no deployment-blocking DevOps issues in the feature itself; the main gap is lack of automated CI/test enforcement in the repo's present workflow surface.

### AIDLC Review — Frontend/UX

**Blocking findings:** none

**Advisory findings:**

1. **Advisory — the timestamp is stacked under the title but is not explicitly styled as secondary helper text.** `src/components/ListNotes.js:40-49` renders the title and `<time>` on separate lines, which satisfies the placement requirement, but `src/App.css:140-157` does not add any timestamp-specific typography or spacing. That leaves the browser default text treatment to determine hierarchy, which is weaker than the tech spec's guidance that the timestamp remain visually secondary (`feature/note-card-last-edited-timestamp/tech-spec.md:160-171`, `:185-189`).

**What is already good:**

- Uses semantic `<time>` markup with `dateTime` in `src/components/ListNotes.js:43-48`.
- Keeps existing action selectors and controls intact in `src/components/ListNotes.js:51-59`.
- Preserves readable plain-text labels instead of icon-only metadata.

**Browser/computer-use validation status:** pending manual confirmation because no browser MCP was available in this review environment.

**Manual browser test script:**

1. Start the app and JSON server.
2. Open `http://localhost:3000/`.
3. Confirm the seeded row for note `1` shows the title plus a visible `Created: <date/time>` label beneath it.
4. Create a new note and confirm the returned list row shows `Created: <date/time>`.
5. Edit that note and confirm the list row changes to `Last edited: <date/time>`.
6. Verify the View/Edit/Delete controls remain visible and clickable after the timestamp is rendered.
7. Confirm the timestamp text reads as supportive metadata rather than competing with the note title.

**Conclusion:** the UI behavior is functionally correct and accessible; the only UX-level suggestion is to make the timestamp hierarchy explicit with light secondary styling.

### AIDLC Review — Security

**Blocking findings:** none

**Advisory findings:** none

**Assessment:**

- No secrets, credentials, or new environment variables were added in the touched files from PR `#10`.
- The feature does not change authentication or authorization boundaries; it only adds note metadata fields and list rendering.
- The primary safety concern from the tech spec was accidental metadata loss on edit, and the implementation addresses that by using `PATCH` in `src/components/EditNote.js:31-35` rather than a full `PUT`.
- No dependency or container changes were introduced for the feature itself.

**Conclusion:** no obvious security issues were found in this change set.

### Review synthesis

- **Blocking findings:** 0
- **Advisory findings:** 3
  - Missing active CI/test workflow enforcement
  - No open PR available for threaded review comments
  - Timestamp visual hierarchy could be made more explicitly secondary

Human sign-off is still required per AIDLC. Per the `/review` skill, the next phase is `/build` triage of any accepted findings, but this review stops here.
