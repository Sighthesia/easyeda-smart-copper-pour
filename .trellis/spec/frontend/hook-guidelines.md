# Hook Guidelines

> How hooks are used in this project.

---

## Overview

There are **no React/Vue hooks** in this repository.

- no `useXxx()` custom hooks
- no React state/effect lifecycle
- no Vue composition hooks

The closest replacement is small TypeScript helper modules under `src/iframe/`.

---

## Custom Hook Patterns

Because hooks do not exist here, reuse is handled with regular functions.

Current patterns:

- `createIframeApp()` groups stateful UI behavior behind a small API
- helpers like `syncModeVisibility()` and `updateSelectionSummary()` encapsulate repeated DOM work

If stateful UI logic grows, extract another plain function first instead of introducing a framework abstraction prematurely.

---

## Data Fetching

There is no client-side fetch layer such as React Query or SWR.

The iframe talks to shared runtime logic directly through a page-side facade:

- `createSmartCopperPourPanelApi()` creates a shared controller in the iframe runtime
- `inspectSelection` is called first to refresh state before `preview` or `apply`
- EasyEDA APIs are used directly from the iframe runtime rather than wrapped in a message bus

Examples:

- `src/iframe/index.ts` refreshes selection on startup and on window focus
- `src/iframe/index.ts` forces a fresh inspect before preview/apply
- `src/iframe/panel-api.ts` translates page actions into controller calls

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
- Do not assume direct runtime calls behave like framework data fetching hooks; they are manual and explicit
