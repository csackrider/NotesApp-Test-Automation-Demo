# Product Spec — Display note timestamps in local time instead of UTC

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders — **product language only** (no implementation or stack). Unresolved product questions should be **asked in chat** first; this file records **decisions** after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Display note timestamps in local time instead of UTC |
| **Status** | Awaiting approval |
| **Author** | GPT-5.4 |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |
| **Related Tech Spec** | `feature/local-time-timestamp-display/tech-spec.md` (to be created during `/design`) |

## Problem & audience

### Problem statement

The app already shows `Created` and `Last edited` timestamps on note list entries, but those times are currently displayed in UTC for every viewer. That creates unnecessary friction for people reading the app in their own local timezone because they must mentally translate the displayed time before they can understand when a note was actually created or updated from their perspective.

### Who it's for

- People using the demo notes app to browse, create, and edit notes.
- Reviewers and testers using the app as a realistic product and automation target from local environments that may not be in UTC.

### Current experience (baseline)

- The note list already shows a timestamp for notes with `Created` or `Last edited` metadata.
- The visible timestamp text is formatted in UTC and includes a UTC timezone label.
- Users outside UTC see a clock time that does not match their local expectation unless they convert it manually.

## Outcomes & business impact

### Desired outcomes

- Timestamps feel immediately understandable to the viewer without timezone conversion.
- The existing timestamp feature remains trustworthy and easier to interpret across local development and demo environments.
- The product behaves more like a real end-user application by presenting time in the viewer's local context.

### Success criteria (for Validate)

These tie directly to the **scorecard** in `/ship`. Each should be **testable** or **evidence-based** without reading code.

| # | Criterion | How we'll verify |
|---|-----------|------------------|
| 1 | Notes that currently show `Created` or `Last edited` timestamps continue to show those labels after this change. | Load seeded notes, create a new note, and edit a note; confirm timestamp labels remain visible in the note list. |
| 2 | Visible note timestamps are presented in the viewer's local time instead of a forced UTC display. | In a browser or test environment with a known local timezone, compare a known stored timestamp with the visible note text and confirm the displayed clock time reflects the local timezone. |
| 3 | The timestamp presentation no longer asks the user to interpret a UTC-specific display when reading the note list. | Review the note list and confirm the visible timestamp text is presented as local-time output rather than with a forced UTC rendering. |
| 4 | This refinement does not expand timestamp scope beyond the existing note-list experience. | Confirm the only user-visible change is the timestamp presentation on the list rows; `Created` versus `Last edited` meaning and existing actions remain intact. |

### Business impact

This is a quality and clarity improvement for an existing feature rather than a new capability. It reduces avoidable user confusion, makes demos feel more realistic, and keeps the note list metadata aligned with what a viewer expects to see on their own machine.

## User experience & scenarios

### Key scenarios

Describe **critical paths** from the user's perspective (not API calls).

1. **Review a note list in local time** — A user opens the note list and sees note timestamps that match the time context they expect in their own environment, without mentally converting from UTC.
2. **Confirm a recent edit more intuitively** — After editing a note, the user returns to the list and reads the `Last edited` time as a local timestamp that makes immediate sense.
3. **Use the demo app in different local environments** — A reviewer or tester runs the app in a local timezone and sees timestamps presented in that local context rather than in a single forced global timezone.

### Experience principles

- Timestamp text should remain secondary metadata beneath the note title, not the dominant part of the row.
- The meaning of `Created` versus `Last edited` should stay explicit and unchanged.
- The visible time should feel natural for the viewer's environment.

## Scope

### In scope

- Change the visible note timestamp presentation from UTC to local time.
- Preserve the existing `Created` and `Last edited` labels and note-list placement.
- Preserve timestamp visibility for newly created notes, edited notes, and seeded/demo notes that already participate in the existing timestamp feature.

### Out of scope

- Changing how timestamp data is stored or expanding timestamp history.
- Adding user-selectable timezone preferences.
- Introducing relative time strings such as "2 minutes ago."
- Expanding timestamp display to additional screens or workflows.
- Redefining note sorting, filtering, or grouping behavior.

### Dependencies on other teams or features

- This is a follow-up refinement to the timestamp-display feature tracked in GitHub issue `#7`.
- No external team dependency is known for this demo app feature.
- `/design` should define any implementation details only after this Product Spec is approved.

## Constraints (non-technical where possible)

- The change should keep the existing timestamp feature recognizable and should not alter the meaning of the labels.
- The display must feel correct to a local viewer by default rather than privileging UTC as the user-facing format.
- The updated presentation should remain easy to read in demos, reviews, and automated validation evidence.

## Decisions (optional)

No additional product decisions have been recorded yet beyond the issue's stated request to show note timestamps in local time instead of UTC.

## Related documents

- Tech Spec: `feature/local-time-timestamp-display/tech-spec.md` (not yet created; `/design` owns this)
- Issues: `#12` — Update the timestamp display to display in local time and not UTC; `#7` — Add "Last edited" timestamp display on each note card
- ADRs (for awareness only — do not restate architecture here): None
