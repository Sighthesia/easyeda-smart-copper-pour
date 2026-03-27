# Logging Guidelines

> How logging is done in this project.

---

## Overview

This project does **not** have a structured logging system.

- No logger abstraction
- No `debug/info/warn/error` convention enforced in code
- No log aggregation or trace IDs
- Diagnostics mainly appear as explicit thrown messages, test assertions, and iframe status text

Document that reality instead of inventing log levels or JSON log schemas.

---

## Log Levels

There is no repository-wide log level policy today.

Current diagnostic channels are:

- thrown `Error` messages from runtime adapters
- failure envelopes on the message bus
- iframe status updates in `iframe/app.js`

---

## Structured Logging

Structured logging is currently missing.

Examples of the current approach:

- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` throws exact runtime messages instead of logging and continuing
- `src/infrastructure/lceda/message-bus-bridge.ts` publishes dispatcher responses directly; it does not log bus traffic
- `iframe/app.js` sets visible status text such as failure and success messages for the user

If you need temporary debugging, keep it local and remove it before finishing unless the repository adopts a real logging approach.

---

## What to Log

There is no standing “must log” list.

Prefer these instead:

- make thrown error messages specific enough to diagnose invalid EasyEDA runtime state
- keep dispatcher error payloads stable and readable
- cover important failure branches with tests

---

## What NOT to Log

- Do not add ad hoc console spam to core runtime paths
- Do not invent a partial logging framework in one module
- Do not rely on logs as the primary UX for iframe failures
- Do not claim a structured logging system exists; it does not
