# Component Guidelines

> How components are built in this project.

---

## Overview

This project does not use framework components. The equivalent unit is a DOM section or UI control group inside the iframe.

- compose the UI with semantic HTML sections and form controls
- keep structure in `iframe/index.html`
- keep behavior in `iframe/app.js`
- share command and payload contracts from `src/application/`

---

## Component Structure

Current pattern:

- `iframe/index.html` defines stable DOM ids and layout groups
- `iframe/app.js` looks elements up once during bootstrap
- helper functions in `iframe/app.js` update the DOM based on state or responses

Examples:

- summary block in `iframe/index.html` uses `selection-net`, `selection-layer`, and `selection-pad-count`
- action buttons in `iframe/index.html` are wired in `bootstrapIframeApp()`
- `updateSelectionSummary()` in `iframe/app.js` applies derived state to the DOM

---

## Props Conventions

There are no framework props.

Equivalent inputs are:

- DOM form values read by `readFormRequest()` in `iframe/app.js`
- shared request and response payload types from `src/application/smart-copper-pour-contract.ts`
- bootstrap dependencies such as `documentObject` and `windowObject` passed to `bootstrapIframeApp()` for tests

When adding UI behavior, prefer a small options object or shared contract type over positional arguments.

---

## Styling Patterns

Styling is inline in `iframe/index.html`.

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
- `iframe/app.js` writes readable status text for waiting, success, and failure states

---

## Common Mistakes

- Do not split tiny iframe markup into fake “components” when plain HTML is clearer
- Do not duplicate request payload shapes in ad hoc JS objects without checking shared contracts
- Do not add framework concepts like props, JSX, or hooks to these docs unless the repository actually adopts them
