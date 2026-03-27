# Frontend Development Guidelines

> Repository-grounded guidance for the iframe UI shipped with the EasyEDA extension.

---

## Overview

The frontend in this repository is a small hand-written iframe UI.

- UI files live in `iframe/`
- The markup is plain HTML in `iframe/index.html`
- The behavior is hand-written state and message-bus sequencing in `iframe/app.js`
- Frontend-facing TypeScript contracts live in `src/application/`
- Frontend-related tests live under `tests/`, mainly `tests/application/`
- There are **no** React/Vue/Svelte components, hooks, or client-side state libraries

The docs in this folder should describe that actual setup, not a framework that is not present.

---

## Guidelines Index

| Guide                                             | Description                                      | Status   |
| ------------------------------------------------- | ------------------------------------------------ | -------- |
| [Directory Structure](./directory-structure.md)   | UI file placement and boundaries                 | Complete |
| [Component Guidelines](./component-guidelines.md) | Plain HTML / DOM composition patterns            | Complete |
| [Hook Guidelines](./hook-guidelines.md)           | Missing concept and what replaces it             | Complete |
| [State Management](./state-management.md)         | Hand-written iframe state and message sequencing | Complete |
| [Quality Guidelines](./quality-guidelines.md)     | Testing, review focus, forbidden patterns        | Complete |
| [Type Safety](./type-safety.md)                   | TypeScript and JS contract boundaries            | Complete |

---

## When These Apply

Use these docs for changes in:

- `iframe/index.html`
- `iframe/app.js`
- frontend-facing message contracts in `src/application/`
- frontend-related tests under `tests/`, especially `tests/application/`

Representative files:

- `iframe/index.html`
- `iframe/app.js`
- `tests/application/iframe-selection-summary-state.test.ts`
