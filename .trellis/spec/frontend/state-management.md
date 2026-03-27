# State Management

> How state is managed in this project.

---

## Overview

State is hand-written and local.

- iframe UI state lives in a plain object created by `createInitialState()`
- application runtime state lives in class fields such as `latestPreviewToken`
- message contracts carry the shared state snapshots between iframe and runtime
- there is no Redux, Zustand, MobX, Pinia, or server-state cache

---

## State Categories

Current state categories:

- **iframe local state**: inspect sequence numbers, pending action command, dirty flags, selection summary in `iframe/app.js`
- **form state**: current control values read directly from DOM inputs in `iframe/app.js`
- **runtime session state**: preview token cache in `src/application/smart-copper-pour-controller.ts`
- **shared transport state**: request/response envelopes in `src/application/smart-copper-pour-contract.ts`

There is no URL state and no persistent client store.

---

## When to Use Global State

There is effectively no frontend global store today.

Promote state only when it must survive across multiple event handlers inside the iframe session, and keep it inside the `createIframeApp()` closure first.

Examples:

- `latestInspectSequence` avoids stale responses
- `pendingActionCommand` / `pendingActionSequence` coordinate inspect-before-preview/apply
- `daisyManualEditsDirty` tracks whether manual trunk values belong to the current selection

---

## Server State

There is no traditional server state cache.

The nearest equivalent is EasyEDA runtime state fetched over the message bus.

- `inspectSelection` refreshes the current normalized selection summary
- success and failure responses are applied immediately to UI state
- repeated responses are deduplicated by sequence and selection fingerprint

Examples:

- `iframe/app.js` ignores stale `inspectSelection` responses
- `tests/application/iframe-selection-summary-state.test.ts` verifies deduplication and refresh-before-action behavior
- `src/infrastructure/lceda/message-bus-bridge.ts` forwards runtime responses without a caching layer

---

## Common Mistakes

- Do not add a state library for small iframe-only state without a real need
- Do not treat stale inspect responses as authoritative; sequence checks matter
- Do not duplicate selection state in multiple unrelated objects when `createIframeApp()` already owns it
