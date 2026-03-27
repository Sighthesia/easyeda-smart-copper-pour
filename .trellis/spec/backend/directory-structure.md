# Directory Structure

> How backend code is organized in this project.

---

## Overview

This repository uses a layered extension architecture instead of a server architecture.

- `src/application/` holds orchestration, contracts, and dispatch logic
- `src/domain/` holds pure planning logic, enums, and value types
- `src/infrastructure/lceda/` holds EasyEDA-specific runtime adapters
- `src/infrastructure/geometry/` holds reusable geometry helpers used by runtime code
- `tests/` mirrors those layers

There are **no** route folders, HTTP request handlers, repositories, or background jobs.

---

## Directory Layout

```
src/
├── application/
│   ├── smart-copper-pour-contract.ts
│   ├── smart-copper-pour-controller.ts
│   └── smart-copper-pour-message-dispatcher.ts
├── domain/
│   ├── tree-backbone-planner.ts
│   ├── star-backbone-planner.ts
│   ├── daisy-chain-planner.ts
│   └── *.ts domain types
└── infrastructure/
    ├── geometry/
    │   └── polygon-offset-builder.ts
    └── lceda/
        ├── message-bus-bridge.ts
        ├── runtime-copper-plan-builder.ts
        ├── selection-inspector.ts
        └── pour-writer.ts

iframe/
├── index.html
└── app.js

tests/
├── application/
├── domain/
└── infrastructure/
```

---

## Module Organization

- Put request validation, command dispatch, and cross-collaborator sequencing in `src/application/`
- Put deterministic planners and data-only helpers in `src/domain/`
- Put EasyEDA `eda.*` calls and runtime primitive translation in `src/infrastructure/lceda/`
- Put geometry math that does not need EasyEDA runtime objects in `src/infrastructure/geometry/`
- Put tests next to the same layer under `tests/`, not inside `src/`

Examples:

- `src/application/smart-copper-pour-controller.ts` coordinates selection inspection, preview, apply, and preview token reuse
- `src/domain/star-backbone-planner.ts` stays pure and throws only for invalid planner inputs
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` converts selection + request into writer-ready polygons

---

## Naming Conventions

- Use kebab-case file names such as `message-bus-bridge.ts` and `runtime-copper-plan-builder.ts`
- Use descriptive domain names: `PadNode`, `TopologyMode`, `PourWriter`, `SelectionInspector`
- Prefer `createXxx()` for factories that bind dependencies at construction time
- Keep EasyEDA-specific names under `lceda/` so runtime coupling stays obvious

Avoid inventing server-style names like `controller.ts`, `service.ts`, or `repository.ts` for new files unless the existing module already uses that wording for a real application concern.

---

## Examples

- `src/application/smart-copper-pour-controller.ts` - application orchestration boundary
- `src/application/smart-copper-pour-contract.ts` - DTOs, message envelopes, and type guards
- `src/infrastructure/lceda/message-bus-bridge.ts` - runtime adapter between iframe messages and controller methods
