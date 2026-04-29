# Product Spec — Character Count Display

**AIDLC phase:** Plan  
**Audience:** Product, engineering leads, stakeholders — **product language only** (no implementation or stack). Unresolved product questions should be **asked in chat** first; this file records **decisions** after they are made.

---

## Overview

| Field | Value |
|-------|-------|
| **Feature** | Character count display for note text entry |
| **Status** | Awaiting approval |
| **Author** | Cursor Cloud Agent |
| **Created** | 2026-04-29 |
| **Last updated** | 2026-04-29 |
| **Related Tech Spec** | `feature/character-count-display/tech-spec.md` (to be created in `/design`) |

## Problem & audience

### Problem statement

People writing or updating notes currently have no immediate feedback on how much text they have entered in the note body field. This makes it harder to judge note length while writing and removes a simple piece of interface feedback that users often expect in a text-entry experience.

### Who it's for

- People creating a new note
- People editing an existing note

### Current experience (baseline)

When a user types into the note text field, the page shows only the text they enter. There is no count displayed beneath the editor, and there is no live feedback that reflects the current character total as the content changes.

## Outcomes & business impact

### Desired outcomes

- Give users immediate feedback about the current length of the note text they are entering
- Make the note-writing experience feel more informative and responsive without changing the existing flow for adding or editing notes
- Add clear acceptance evidence for this behavior so the product can be validated reliably

### Success criteria (for Validate)

These tie directly to the **scorecard** in `/ship`. Each should be **testable** or **evidence-based** without reading code.

| # | Criterion | How we'll verify |
|---|-----------|------------------|
| 1 | A character count is shown below the note text editor on note-entry screens, including immediately for existing note text when an edit form finishes loading | Manual product check on add/edit note entry confirms the count is visibly present below the editor and reflects the current text shown in the form |
| 2 | The count updates immediately as the user types, deletes, pastes, or otherwise changes note text, including spaces and line breaks | Manual interaction check shows the number changes in step with the visible note text exactly as entered |
| 3 | The count uses simple wording in the format "`N` characters" | Product check confirms the displayed copy matches the agreed format |
| 4 | Automated end-to-end coverage verifies the count is displayed and updates live | Validate evidence includes a passing Playwright scenario for this behavior |

### Business impact

This is a small usability improvement rather than a revenue feature. Its value is improved writing feedback for users and stronger confidence in the quality of the note editor through automated validation.

## User experience & scenarios

### Key scenarios

Describe **critical paths** from the user's perspective (not API calls).

1. **Create a note with live length feedback** — A user opens the note creation flow, types into the note text field, and sees a character count below the editor update in real time to reflect the current note text length.
2. **Edit a note with live length feedback** — A user opens an existing note for editing, immediately sees a character count that reflects the current note text once the form loads, and sees that count update in real time as the text changes.

### Experience principles

- The count should be easy to notice without distracting from writing
- The wording should be plain and unambiguous
- The feedback should feel immediate to the user as they type
- The feature should not interfere with the existing add/edit note workflow
- The displayed count should reflect the note text exactly as entered, including spaces, pasted text, and line breaks
- When editing an existing note, the count should appear immediately once the current note text is loaded into the form

## Scope

### In scope

- Showing a character count beneath the note text editor during note entry
- Updating the displayed count as note text changes
- Using the "`N` characters" format described in the issue
- Capturing this behavior in end-to-end validation
- Counting the note text exactly as entered, including spaces, pasted text, and line breaks
- Showing the current count immediately when an existing note is opened for editing

### Out of scope

- Adding a character count for the note title field
- Introducing character limits, warnings, or validation rules based on note length
- Changing the saved content of notes
- Adding a character count to read-only note viewing screens

### Dependencies on other teams or features

- No external team dependency is required for this feature
- The feature should align with the existing issue tracker item: GitHub issue #3

## Constraints (non-technical where possible)

- The count must be presented below the note text editor, consistent with the issue request
- The display format must remain simple and readable as "`N` characters"
- The feature should preserve the current note entry experience rather than redefine it
- The character total must reflect the note text exactly as entered by the user, including spaces, line breaks, and pasted text

## Decisions (optional)

Short log of **resolved** product questions from conversation (not a substitute for asking in chat).

| Date | Decision |
|------|----------|
| 2026-04-29 | The character count uses the format "`N` characters". |
| 2026-04-29 | The count includes spaces, line breaks, and pasted text exactly as entered in the note text field. |
| 2026-04-29 | On the edit screen, the existing note text should show its character count immediately once the form loads. |
| 2026-04-29 | End-to-end validation must cover this behavior. |

## Related documents

- Tech Spec: `feature/character-count-display/tech-spec.md` (not yet created; `/design` owns this)
- Issues: `#3` — Add character count display to note editor
- ADRs (for awareness only — do not restate architecture here): None
