# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

Frontend quality here means keeping the iframe simple, predictable, and aligned with the runtime contract.

- preserve explicit message ordering
- keep DOM ids and shared command names stable
- test behavior with the iframe harness when sequencing changes
- remember the package ships compiled TypeScript from `dist/` and iframe assets from `iframe/`

---

## Forbidden Patterns

- Do not introduce framework-specific guidance or abstractions that the repo does not use
- Do not duplicate request topics or command names with slightly different strings
- Do not skip the inspect-refresh flow when preview/apply depends on current selection state
- Do not edit packaged output directly

Relevant files:

- `iframe/app.js` already owns request sequencing rules
- `src/application/smart-copper-pour-contract.ts` already defines request/response topics
- `.edaignore` excludes `src/`, so runtime TypeScript ships from built output while iframe files stay in `iframe/`

---

## Required Patterns

- Use real form controls and stable DOM ids in `iframe/index.html`
- Keep state transitions explicit in `iframe/app.js`
- Reuse the shared message contract vocabulary from `src/application/`
- Add or update iframe tests when UI sequencing or status behavior changes

Examples:

- `iframe/index.html` provides labeled controls and dedicated action buttons
- `iframe/app.js` publishes `inspectSelection` on startup, focus, and before preview/apply
- `tests/application/iframe-selection-summary-state.test.ts` verifies stale-response handling and request ordering

---

## Testing Requirements

- Prefer the focused iframe suite first: `tests/application/iframe-selection-summary-state.test.ts`
- Cover both message flow and visible UI state updates
- Use harnessed DOM elements and fake message buses instead of brittle browser-only assumptions
- Run broader tests only after the focused suite passes

Other useful adjacent coverage:

- `tests/infrastructure/lceda/message-bus-bridge.test.ts` for bridge behavior
- `tests/application/smart-copper-pour-controller.test.ts` for request validation that affects iframe interactions

---

## Code Review Checklist

- Does the UI stay plain and easy to scan?
- Do status messages still cover waiting, success, and failure paths?
- Are message topics, commands, and payload fields aligned with shared contracts?
- Are sequence/fingerprint rules preserved for stale-response safety?
- If labels or defaults changed, do tests and visible markup agree?
