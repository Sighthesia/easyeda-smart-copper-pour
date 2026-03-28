# State Management

> How state is managed in this project.

---

## Overview

State is hand-written and local.

- iframe UI state lives in the `createIframeApp()` closure
- application runtime state lives in class fields such as `latestPreviewToken`
- the iframe keeps small persisted form preferences in local storage
- there is no Redux, Zustand, MobX, Pinia, or server-state cache

---

## State Categories

Current state categories:

- **iframe local state**: current selection summary and fingerprint in `src/iframe/index.ts`
- **form state**: current control values read from DOM inputs and optionally persisted through `src/iframe/form-state.ts`
- **runtime session state**: preview token cache in `src/application/smart-copper-pour-controller.ts`
- **shared contract state**: preview/apply payloads in `src/application/smart-copper-pour-contract.ts`

There is no URL state and no persistent client store.

---

## When to Use Global State

There is effectively no frontend global store today.

Promote state only when it must survive across multiple event handlers inside the iframe session, and keep it inside the `createIframeApp()` closure first.

Examples:

- `selectionFingerprint` lets the iframe skip unnecessary summary repaint work
- `selectionSummary` keeps the visible summary aligned with the latest runtime inspect result
- local storage keeps the last-used form values across panel reopen

---

## Server State

There is no traditional server state cache.

The nearest equivalent is EasyEDA runtime state read directly by the iframe through the shared controller and LCEDA adapters.

- `inspectSelection` refreshes the current normalized selection summary
- preview/apply refresh the selection summary before executing runtime work
- repeated polling only repaints when the selection fingerprint changes

Examples:

- `src/iframe/index.ts` refreshes the selection summary on startup, focus, and interval polling
- `tests/application/iframe-selection-summary-state.test.ts` verifies direct panel API behavior and refresh-before-action flow
- `src/iframe/panel-api.ts` reuses the shared controller without introducing a transport layer

---

## Common Mistakes

- Do not add a state library for small iframe-only state without a real need
- Do not let local storage become a second source of truth for runtime selection state
- Do not duplicate selection state in multiple unrelated objects when `createIframeApp()` already owns it
