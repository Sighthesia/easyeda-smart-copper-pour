# Component Guidelines

> How components are built in this project.

---

## Overview

This project does not use framework components. The equivalent unit is a DOM section or UI control group inside the iframe.

- compose the UI with semantic HTML sections and form controls
- keep structure in `iframe/index.html`
- keep behavior in `src/iframe/index.ts`
- share command and payload contracts from `src/application/`

---

## Component Structure

Current pattern:

- `iframe/index.html` defines stable DOM ids and layout groups
- `src/iframe/index.ts` looks elements up once during bootstrap
- helper functions in `src/iframe/index.ts` update the DOM based on state or direct runtime results

Examples:

- summary block in `iframe/index.html` uses `selection-net`, `selection-layer`, and `selection-pad-count`
- action buttons in `iframe/index.html` are wired in `bootstrapIframeApp()`
- `updateSelectionSummary()` in `src/iframe/index.ts` applies derived state to the DOM

---

## Props Conventions

There are no framework props.

Equivalent inputs are:

- DOM form values read by `readSmartCopperPourRequest()` in `src/iframe/form-state.ts`
- shared request and response payload types from `src/application/smart-copper-pour-contract.ts`
- bootstrap dependencies such as `documentObject` and `windowObject` passed to `bootstrapIframeApp()` for tests

When adding UI behavior, prefer a small options object or shared contract type over positional arguments.

---

## Styling Patterns

Styling is plain CSS in `iframe/index.css`.

- use simple class names such as `.main`, `.actions`, `.status`, and `.summary`
- use `[data-daisy-only]` and `hidden` for mode-specific visibility
- keep status tone styling driven by `data-tone`

There is no CSS module system, Tailwind setup, or design-token layer in this repository.

---

## Accessibility

Accessibility is basic but visible in the current markup.

- pair inputs with `<label for="...">`
- keep buttons as real `<button type="button">` elements
- expose status text in a visible panel instead of only side effects

Examples:

- `iframe/index.html` labels every form field explicitly
- `iframe/index.html` uses buttons rather than clickable generic elements
- `src/iframe/index.ts` writes readable status text for waiting, success, and failure states

---

## Common Mistakes

- Do not split tiny iframe markup into fake “components” when plain HTML is clearer
- Do not duplicate request payload shapes in ad hoc JS objects without checking shared contracts
- Do not add framework concepts like props, JSX, or hooks to these docs unless the repository actually adopts them
