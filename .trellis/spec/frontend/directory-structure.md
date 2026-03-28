# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The frontend UI is intentionally small and split between a static iframe shell and compiled TypeScript.

- `iframe/index.html` contains the UI markup shell
- `iframe/index.css` contains iframe-specific styling
- `src/iframe/index.ts` contains DOM wiring, direct controller calls, and local state
- `src/iframe/panel-api.ts` provides the page-side runtime facade
- frontend-facing contracts are shared from `src/application/smart-copper-pour-contract.ts`
- frontend-related tests live under `tests/`, mainly `tests/application/`

There are no framework component folders, no page router, and no hook directories.

---

## Directory Layout

```
iframe/
├── index.css
└── index.html

src/iframe/
├── form-state.ts
├── index.ts
├── panel-api.ts
└── runtime-eda.ts

src/application/
	└── smart-copper-pour-contract.ts

tests/application/
└── iframe-selection-summary-state.test.ts
```

---

## Module Organization

- Keep DOM structure and visual defaults in `iframe/index.html`
- Keep iframe styling in `iframe/index.css`
- Keep state transitions and direct runtime calls in `src/iframe/index.ts`
- Keep shared request/response shapes in `src/application/` contracts, not duplicated in UI helpers
- Keep frontend tests under `tests/`, mainly `tests/application/`, using DOM harnesses and fake panel APIs

Examples:

- `iframe/index.html` defines the form, footer, and summary UI
- `src/iframe/index.ts` owns the selection refresh flow before preview/apply
- `src/iframe/panel-api.ts` bridges the page to the shared controller
- `src/application/smart-copper-pour-contract.ts` defines preview/apply payload shapes

---

## Naming Conventions

- Keep iframe shell files simple and literal: `index.html`, `index.css`
- Use descriptive function names in TypeScript such as `createIframeApp`, `bootstrapIframeApp`, and `resolveSuccessStatus`
- Use DOM id names that match their purpose, such as `preview-button` and `selection-pad-count`
- Keep shared payload names aligned with the application contract types

Avoid adding framework-style folders such as `components/`, `pages/`, or `hooks/` unless the repository actually adopts that structure.

---

## Examples

- `iframe/index.html` - complete iframe markup shell
- `src/iframe/index.ts` - UI logic, direct runtime calls, and state transitions
- `tests/application/iframe-selection-summary-state.test.ts` - realistic harness for UI behavior
