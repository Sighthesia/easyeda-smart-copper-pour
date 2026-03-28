# Type Safety

> Type safety patterns in this project.

---

## Overview

Type safety is centered in TypeScript runtime contracts and narrow domain types.

- TypeScript is strict in `src/`
- `import type` is used for type-only dependencies
- request and response DTOs are centralized in contract modules
- runtime validation uses type guards and explicit checks, not a schema library like Zod

The iframe itself is plain JS, so its safety comes from shared contract shapes and tests.

---

## Type Organization

- Put shared request/response types in `src/application/smart-copper-pour-contract.ts`
- Put domain entities and enums in `src/domain/`
- Put adapter-specific interfaces next to the adapter implementation
- Keep one-off local helper types close to the function or module that needs them

Examples:

- `src/application/smart-copper-pour-contract.ts` defines message envelopes and payload maps
- `src/domain/star-backbone-planner.ts` defines planner-specific option and plan interfaces
- `src/infrastructure/lceda/message-bus-bridge.ts` defines the bridge-facing message bus interface

---

## Validation

Validation is hand-written.

- use type guards for message envelopes and payload narrowing
- use explicit numeric checks for form-derived values and trunk points
- reject invalid states with clear errors instead of coercing inputs

Examples:

- `src/application/smart-copper-pour-contract.ts` implements `isSmartCopperPourRequestMessage()` and related helpers
- `src/application/smart-copper-pour-controller.ts` validates request values before preview/apply
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` validates manual trunk points before planning

---

## Common Patterns

- prefer narrow unions such as `'round' | 'miter' | 'bevel'`
- prefer discriminated request unions for topology-specific payloads
- prefer `ReadonlyArray<T>` at domain and application boundaries
- keep contract-level type guards close to the DTO definitions they validate

Examples:

- `SmartCopperPourPreviewRequest` is a union of tree/star and daisy-chain request shapes
- `SmartCopperPourSuccessMessage<TCommand>` and `SmartCopperPourFailureMessage<TCommand>` keep transport envelopes explicit
- planner modules in `src/domain/` use domain-specific types like `PadNode` and `SkeletonSegment`

---

## Forbidden Patterns

- Avoid `any` in TypeScript modules
- Avoid broad string payloads where a union already exists
- Avoid unchecked type assertions for iframe messages coming from unknown runtime inputs
- Avoid duplicating contract types in `src/iframe/`; prefer alignment with `src/application/` definitions and tests
