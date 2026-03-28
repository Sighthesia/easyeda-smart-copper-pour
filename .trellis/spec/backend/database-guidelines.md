# Database Guidelines

> Database patterns and conventions for this project.

---

## Overview

This repository has **no database layer**.

- No database
- No ORM or query builder
- No migrations or schema files
- No repository pattern for persistence

State is transient and runtime-scoped:

- controller state such as `latestPreviewToken` lives in memory during a session
- iframe state lives in `src/iframe/index.ts`
- durable storage, if any, is outside this repository and handled by EasyEDA itself

---

## Query Patterns

There are no queries to document. The closest equivalents are runtime reads from EasyEDA APIs.

- `src/infrastructure/lceda/selection-inspector.ts` reads selected primitives from `eda.pcb_SelectControl`
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` reads selection data, then derives polygons in memory
- `src/application/smart-copper-pour-controller.ts` passes normalized request data between collaborators without persistence

When adding new behavior, prefer explicit runtime readers or adapter interfaces over inventing a fake repository layer.

---

## Migrations

There are no migrations in this project.

If a future feature genuinely needs persistence, document that separately instead of retrofitting these guidelines with imaginary migration steps.

---

## Naming Conventions

Database naming conventions do not apply here.

Name runtime data after domain meaning instead:

- `selectionFingerprint` in `src/application/smart-copper-pour-contract.ts`
- `RuntimeCopperWriterInput` in `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
- `PadNode` and `SkeletonSegment` in `src/domain/`

---

## Common Mistakes

- Do not invent database abstractions for in-memory runtime state
- Do not describe EasyEDA primitive reads as “queries” in new docs or code comments
- Do not add placeholder docs about tables, columns, or migrations unless the repository actually gains those concepts
