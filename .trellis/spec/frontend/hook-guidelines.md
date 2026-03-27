# Hook Guidelines

> How hooks are used in this project.

---

## Overview

There are **no React/Vue hooks** in this repository.

- no `useXxx()` custom hooks
- no React state/effect lifecycle
- no Vue composition hooks

The closest replacement is small plain-JS helper functions inside `iframe/app.js`.

---

## Custom Hook Patterns

Because hooks do not exist here, reuse is handled with regular functions.

Current patterns:

- `createInitialState()` returns the initial iframe state shape
- `createIframeApp()` groups stateful UI behavior behind a small API
- helpers like `syncModeVisibility()` and `updateSelectionSummary()` encapsulate repeated DOM work

If stateful UI logic grows, extract another plain function first instead of introducing a framework abstraction prematurely.

---

## Data Fetching

There is no client-side fetch layer such as React Query or SWR.

The iframe talks to the extension runtime through the EasyEDA message bus:

- requests publish to `smart-copper-pour/request`
- responses arrive on `smart-copper-pour/response`
- `inspectSelection` is often sent first to refresh state before `preview` or `apply`

Examples:

- `iframe/app.js` publishes inspect requests on startup and on window focus
- `iframe/app.js` forces a fresh inspect before preview/apply
- `src/infrastructure/lceda/message-bus-bridge.ts` translates request messages into controller calls

---

## Naming Conventions

Since hooks are absent, normal function naming applies.

- prefer verbs for actions: `markDaisyManualEditsDirty`, `readFormRequest`
- prefer `createXxx` for stateful factories: `createIframeApp`
- prefer `bootstrapXxx` for one-time startup wiring: `bootstrapIframeApp`

---

## Common Mistakes

- Do not add guidance about `useEffect`, `useState`, or lifecycle cleanup patterns; they are not used here
- Do not move plain JS state helpers into fake hook files just to match generic frontend templates
- Do not assume message-bus request sequencing behaves like framework data fetching hooks; it is manual and explicit
