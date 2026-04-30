# Product Spec — Make each note list title bold

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders — **product language only** (no implementation or stack). Unresolved product questions should be **asked in chat** first; this file records **decisions** after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Make each note list title bold |
| **Status** | Approved |
| **Author** | GPT-5.4 |
| **Created** | 2026-04-30 |
| **Last updated** | 2026-04-30 |
| **Related Tech Spec** | `feature/bold-note-list-title/tech-spec.md` (to be created during `/design`) |

## Problem & audience

### Problem statement

The note list currently shows each note title as plain body text above the note's `Created` or `Last edited` metadata. Because the title and timestamp are visually similar, the title does not stand out as the primary piece of information in the row. This makes the list slightly harder to scan, especially when users want to identify note names quickly.

### Who it's for

- People browsing the note list to find a note by title.
- Reviewers and testers using the demo app as a realistic UI and automation target.

### Current experience (baseline)

- Each note row shows the title first and timestamp metadata directly underneath when available.
- The title is readable, but it does not have stronger visual emphasis than nearby metadata.
- Users can still identify notes, but the row hierarchy is weaker than it could be.

## Outcomes & business impact

### Desired outcomes

- Make note titles easier to scan in the list.
- Improve the visual hierarchy between the note title and secondary metadata.
- Preserve the existing simple note-list experience while making the primary content more obvious.

### Success criteria (for Validate)

These tie directly to the **scorecard** in `/ship`. Each should be **testable** or **evidence-based** without reading code.

| # | Criterion | How we'll verify |
|---|-----------|------------------|
| 1 | Each note row shows its title with visibly stronger emphasis than the timestamp text beneath it. | Review the note list and confirm the note title appears bold while the timestamp remains secondary. |
| 2 | The title remains clearly readable and still appears above the `Created` or `Last edited` line for notes that show timestamp metadata. | Load notes with visible metadata and confirm the row hierarchy remains title first, timestamp second. |
| 3 | The bold title treatment applies consistently across note rows in the main note list. | Review seeded notes and newly created notes in the list and confirm the title treatment is consistent. |
| 4 | This visual change does not alter the current note-list workflow or expand scope into other note screens. | Confirm the user-visible change is limited to note title emphasis in the main list. |

### Business impact

This is a small usability and polish improvement. It makes the demo app feel more intentional, improves scanability for users, and provides another visible UI behavior that can be validated during review and testing.

## User experience & scenarios

### Key scenarios

Describe **critical paths** from the user's perspective (not API calls).

1. **Scan the note list quickly** — A user opens the home page and can identify note names more quickly because each title stands out from the timestamp text underneath it.
2. **Review a recently changed note** — A user sees a bold title above `Created` or `Last edited` metadata, making it easier to separate the note name from the date information.
3. **Browse multiple notes in a demo or test run** — A reviewer or tester can more easily confirm which note row they are looking at because the title has clearer visual emphasis.

### Experience principles

- The title should feel like the primary label of the note row.
- Timestamp metadata should remain visible but visually secondary.
- The change should feel lightweight and consistent with the app's existing simple UI.

## Scope

### In scope

- Make the title visually bold in each row of the main note list.
- Preserve the title-above-metadata hierarchy for notes that show `Created` or `Last edited`.
- Apply the same title emphasis to existing seeded notes and newly created notes when shown in the main list.

### Out of scope

- Changing the wording or behavior of `Created` and `Last edited` metadata.
- Changing note detail, add-note, or edit-note screens.
- Introducing new sorting, filtering, grouping, or layout changes for the note list.
- Defining engineering implementation details, markup choices, or styling mechanisms in this phase.

### Dependencies on other teams or features

- This feature builds on the existing note-list experience and should remain compatible with the timestamp-display work already tracked in GitHub issues `#7` and `#12`.
- No external team dependency is known for this demo app feature.
- `/design` should define implementation details only after this Product Spec is approved.

## Constraints (non-technical where possible)

- The title emphasis should improve readability without making the row feel heavy or cluttered.
- The change should preserve the existing relationship between the note title and timestamp metadata.
- The request is limited to the main note list experience described in GitHub issue `#17`.

## Decisions (optional)

| Date | Decision |
|------|----------|
| 2026-04-30 | The request is scoped to the main note list title that appears above the `Created` or `Last edited` metadata, based on the issue description. |
| 2026-04-30 | The Product Spec was approved in chat and is ready for a separate `/design` phase handoff. |

## Related documents

- Tech Spec: `feature/bold-note-list-title/tech-spec.md` (not yet created; `/design` owns this)
- Issues: `#17` — make the note title for each note bold; `#7` — Add "Last edited" timestamp display on each note card; `#12` — Update the timestamp display to display in local time and not UTC
- ADRs (for awareness only — do not restate architecture here): None
