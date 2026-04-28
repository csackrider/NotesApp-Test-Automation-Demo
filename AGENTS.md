# AGENTS.md — NotesApp Test Automation Demo

## What this repo is
A Node/React notes application with a JSON server backend and Playwright test automation suite.
Uses a Page Object Model pattern for tests.

## Stack
- Frontend: React (Create React App), TypeScript
- Backend: JSON Server (port 3004)
- Tests: Playwright, TypeScript, Page Object Model
- CI: GitHub Actions

## Issue tracker
GitHub Issues — this repo.
Feature folder convention: `feature/<kebab-slug>/`

## Key commands
- Install: `npm ci`
- Start app: `npm run start`
- Run tests: `npm run test`
- Start JSON server: `npm run server` (runs on port 3004)

## Skills location
`.claude/skills/` (symlinked to AI-DLC submodule)

## Notes for agents
- Always run tests before opening a PR
- The Playwright config is at `playwright.config.ts`
- Tests live in `tests/` and use Page Object Models in `src/`
- The JSON server must be running for tests to pass
