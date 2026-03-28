# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

Frontend quality here means keeping the iframe simple, predictable, and aligned with the runtime contract.

- preserve explicit inspect-before-action ordering
- keep DOM ids and shared payload names stable
- test behavior with the iframe harness when direct runtime flow changes
- remember the package ships compiled TypeScript from `dist/` and iframe assets from `iframe/`

---

## Forbidden Patterns

- Do not introduce framework-specific guidance or abstractions that the repo does not use
- Do not duplicate runtime orchestration in both the iframe and host entry
- Do not skip the inspect-refresh flow when preview/apply depends on current selection state
- Do not edit packaged output directly

Relevant files:

- `src/iframe/index.ts` already owns iframe action sequencing rules
- `src/iframe/panel-api.ts` already centralizes direct runtime calls
- `.edaignore` excludes `src/`, so runtime TypeScript ships from built output while iframe files stay in `iframe/`

---

## Required Patterns

- Use real form controls and stable DOM ids in `iframe/index.html`
- Keep state transitions explicit in `src/iframe/index.ts`
- Reuse the shared preview/apply contract vocabulary from `src/application/`
- Add or update iframe tests when UI sequencing or status behavior changes

Examples:

- `iframe/index.html` provides labeled controls and dedicated action buttons
- `src/iframe/index.ts` refreshes `inspectSelection` on startup, focus, and before preview/apply
- `tests/application/iframe-selection-summary-state.test.ts` verifies direct panel API behavior and request ordering

---

## Testing Requirements

- Prefer the focused iframe suite first: `tests/application/iframe-selection-summary-state.test.ts`
- Cover both direct runtime flow and visible UI state updates
- Use harnessed DOM elements and fake panel APIs instead of brittle browser-only assumptions
- Run broader tests only after the focused suite passes

Other useful adjacent coverage:

- `tests/infrastructure/lceda/open-smart-copper-pour-panel.test.ts` for host window behavior
- `tests/application/smart-copper-pour-controller.test.ts` for request validation that affects iframe interactions

---

## Code Review Checklist

- Does the UI stay plain and easy to scan?
- Do status messages still cover waiting, success, and failure paths?
- Are direct panel API calls and payload fields aligned with shared contracts?
- Are refresh-before-action and fingerprint rules preserved where needed?
- If labels or defaults changed, do tests and visible markup agree?
