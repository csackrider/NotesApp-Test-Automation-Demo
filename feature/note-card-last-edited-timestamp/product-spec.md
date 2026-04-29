# Product Spec — Add “Last edited” timestamp display on each note card

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders — **product language only** (no implementation or stack). Unresolved product questions should be **asked in chat** first; this file records **decisions** after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Add “Last edited” timestamp display on each note card |
| **Status** | Draft / Awaiting approval |
| **Author** | GPT-5.4 |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |
| **Related Tech Spec** | `feature/note-card-last-edited-timestamp/tech-spec.md` (to be created during `/design`) |

## Problem & audience

### Problem statement

Users can currently see each note's title and access actions to view, edit, or delete, but they cannot tell when a note was first created or last changed. That makes it harder to scan the list, confirm that an edit was saved, and understand which notes are freshest at a glance.

### Who it’s for

- People using the demo notes app to create, review, and update notes.
- Maintainers and reviewers using the app as a test automation target who need visible evidence that note edits changed something meaningful in the UI.

### Current experience (baseline)

- The note list shows only the note title plus action links.
- After editing a note, the list gives no timestamp-based confirmation that the note changed.
- Notes created before this feature have no visible created or edited time in the card/list experience.

## Outcomes & business impact

### Desired outcomes

- Users can immediately tell whether a note has been edited since it was created.
- The note list provides lightweight recency context without requiring users to open each note.
- The demo application exposes a clearer, user-visible behavior that can be validated through automated testing.

### Success criteria (for Validate)

These tie directly to the **scorecard** in `/ship`. Each should be **testable** or **evidence-based** without reading code.

| # | Criterion | How we’ll verify |
|---|-----------|------------------|
| 1 | A newly created note shows a visible timestamp label on its note card/list entry. | Create a note and confirm the list shows `Created: <date/time>` for that note. |
| 2 | After a note is edited and saved, its note card/list entry shows `Last edited: <date/time>` instead of only the created label. | Edit an existing note and confirm the list updates to a `Last edited` label for that note. |
| 3 | Existing notes without prior edit history still render a readable fallback timestamp label instead of a blank or broken state. | Load seeded notes and confirm each note shows either `Created` or `Last edited`. |
| 4 | Timestamp text is understandable at a glance and does not remove or obscure existing title/actions on the note card/list entry. | Review the list UI before and after the feature and confirm note title and action links remain usable. |

### Business impact

This improves clarity and product realism for the demo app, and it gives the automation suite a more meaningful user-facing behavior to validate. No direct revenue impact is expected beyond improved demo quality and confidence.

## User experience & scenarios

### Key scenarios

Describe **critical paths** from the user’s perspective (not API calls).

1. **Create a note and return to the list** — After saving a new note, the user sees the note in the list with a `Created` timestamp so they know when it was added.
2. **Edit an existing note** — After saving changes, the user returns to the list and sees `Last edited` on that note, confirming the note was updated.
3. **Review older notes** — When browsing the list, the user can compare visible timestamps to understand which notes are newer or recently touched without opening each one.

### Experience principles

- Timestamp wording should be explicit: users should not have to guess whether a date reflects creation or editing.
- The display should feel lightweight and readable in the list, not visually dominant over the note title.
- The experience should remain understandable for both newly created notes and older seeded notes.

## Scope

### In scope

- Show a timestamp label on each note card/list entry.
- Display `Last edited: <date/time>` for notes that have been changed after creation.
- Display `Created: <date/time>` for notes that have never been edited.
- Support the current seeded/demo notes experience so the list does not show missing timestamp information.

### Out of scope

- Changing note sorting or filtering behavior based on timestamps.
- Adding timestamp history, audit logs, or multiple edit events.
- Adding timestamp display to screens beyond the note card/list entry unless separately approved.
- Defining engineering implementation details, data model changes, or test approach in this phase.

### Dependencies on other teams or features

- No external team dependency is known for this demo app feature.
- `/design` will need an approved Product Spec before any implementation detail is defined.

## Constraints (non-technical where possible)

- The feature should preserve the existing simplicity of the note list and avoid turning timestamp text into the dominant UI element.
- The wording must remain clear for notes that were never edited.
- The feature must work for both new notes and pre-existing seeded notes used in demos and automated checks.

## Decisions (optional)

No product decisions have been resolved in chat yet beyond the issue statement. Confirmations from review should be recorded here before approval.

## Related documents

- Tech Spec: `feature/note-card-last-edited-timestamp/tech-spec.md` (not yet created; belongs to `/design`)
- Issues: GitHub issue #7
- ADRs (for awareness only — do not restate architecture here): None currently linked
