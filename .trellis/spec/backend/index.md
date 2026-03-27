# Backend Development Guidelines

> Repository-grounded guidance for the TypeScript extension runtime and application layers.

---

## Overview

This project has backend-like code, but it is **not** a web service.

- The main runtime lives in `src/application/`, `src/domain/`, and `src/infrastructure/`
- EasyEDA adapters replace the usual server framework / controller / repository stack
- There are **no** HTTP API routes, database models, ORM layers, or migrations in this repository
- Errors usually surface as thrown `Error`s, typed validation failures, or message-bus failure envelopes

---

## Guidelines Index

| Guide                                           | Description                                      | Status   |
| ----------------------------------------------- | ------------------------------------------------ | -------- |
| [Directory Structure](./directory-structure.md) | Module boundaries and file placement             | Complete |
| [Database Guidelines](./database-guidelines.md) | What is absent and what to do instead            | Complete |
| [Error Handling](./error-handling.md)           | Validation, runtime failures, response envelopes | Complete |
| [Quality Guidelines](./quality-guidelines.md)   | Testing, review focus, forbidden patterns        | Complete |
| [Logging Guidelines](./logging-guidelines.md)   | Current diagnostics and non-logging reality      | Complete |

---

## When These Apply

Use these docs for changes in:

- `src/application/` orchestration and contracts
- `src/domain/` planning and types
- `src/infrastructure/lceda/` EasyEDA runtime adapters
- `src/infrastructure/geometry/` backend-style geometry helpers
- `tests/application/`, `tests/domain/`, and `tests/infrastructure/`

Representative files:

- `src/application/smart-copper-pour-controller.ts`
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
- `src/infrastructure/lceda/message-bus-bridge.ts`
