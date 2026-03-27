# Directory Structure

> How frontend code is organized in this project.

---

## Overview

The frontend UI is intentionally small and mostly lives outside `src/`.

- `iframe/index.html` contains the UI markup and inline CSS
- `iframe/app.js` contains DOM wiring, message publishing, response handling, and local state
- frontend-facing message contracts are shared from `src/application/smart-copper-pour-contract.ts`
- frontend-related tests live under `tests/`, mainly `tests/application/`

There are no framework component folders, no page router, and no hook directories.

---

## Directory Layout

```
iframe/
├── index.html
└── app.js

src/application/
└── smart-copper-pour-contract.ts

tests/application/
└── iframe-selection-summary-state.test.ts
```

---

## Module Organization

- Keep DOM structure and visual defaults in `iframe/index.html`
- Keep message-bus sequencing and state transitions in `iframe/app.js`
- Keep shared request/response shapes in `src/application/` contracts, not duplicated in JS strings everywhere
- Keep frontend tests under `tests/`, mainly `tests/application/`, using DOM harnesses and message bus fakes

Examples:

- `iframe/index.html` defines the form, footer, and summary UI
- `iframe/app.js` owns the selection refresh flow before preview/apply
- `src/application/smart-copper-pour-contract.ts` defines request topics, envelopes, and payload shapes

---

## Naming Conventions

- Keep iframe files simple and literal: `index.html`, `app.js`
- Use descriptive function names in JS such as `createIframeApp`, `bootstrapIframeApp`, and `resolveSuccessStatus`
- Use DOM id names that match their purpose, such as `preview-button` and `selection-pad-count`
- Keep shared topic / command names aligned with the application contract constants

Avoid adding framework-style folders such as `components/`, `pages/`, or `hooks/` unless the repository actually adopts that structure.

---

## Examples

- `iframe/index.html` - complete iframe markup and styling
- `iframe/app.js` - UI logic, message sequencing, and state transitions
- `tests/application/iframe-selection-summary-state.test.ts` - realistic harness for UI behavior
