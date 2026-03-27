# Quality Guidelines

> Code quality standards for backend development.

---

## Overview

Backend-quality work in this repository means keeping layer boundaries sharp, types explicit, and tests close to the changed behavior.

Core expectation:

- keep orchestration in `src/application/`
- keep pure logic in `src/domain/`
- isolate EasyEDA calls in `src/infrastructure/lceda/`
- verify behavior with focused Vitest coverage under matching `tests/` folders

---

## Forbidden Patterns

- Do not put `eda.*` runtime calls into `src/domain/`
- Do not add loose `any` payloads where contracts already define DTOs and type guards
- Do not silently coerce invalid request shapes or unsupported topology modes
- Do not edit `dist/` manually; shipping output is generated
- Do not invent server concerns such as HTTP handlers, repositories, or migrations in these docs or modules

Relevant examples:

- `src/application/smart-copper-pour-contract.ts` already defines request and response envelopes
- `src/domain/star-backbone-planner.ts` stays pure and deterministic
- `.edaignore` excludes `src/`, which means packaged output comes from `dist/`

---

## Required Patterns

- Use narrow unions and domain types for runtime contracts
- Use `import type` where imports are type-only
- Validate at boundaries before deeper orchestration proceeds
- Throw explicit errors when runtime prerequisites are missing
- Add or update tests for each behavior change

Examples:

- `src/application/smart-copper-pour-contract.ts` uses unions, typed envelopes, and runtime type guards
- `src/application/smart-copper-pour-controller.ts` validates requests before preview/apply
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` rejects invalid daisy-chain trunk inputs explicitly

---

## Testing Requirements

- Start with the narrowest affected test file
- Mirror the source layer in the test location
- Assert exact behavior, not only broad success
- Run broader checks only after focused suites pass

Examples:

- `tests/application/smart-copper-pour-controller.test.ts` covers validation and token orchestration
- `tests/infrastructure/lceda/message-bus-bridge.test.ts` covers response envelopes and bridge disposal
- `tests/domain/tree-backbone-planner.test.ts` and peers cover pure planner behavior

---

## Code Review Checklist

- Is the file placed in the correct layer?
- Are EasyEDA runtime calls isolated away from domain logic?
- Are request and response types explicit and narrow?
- Do thrown errors remain clear and user-relevant?
- Does test coverage match the changed layer?
- If packaging behavior changed, is `extension.json` / `.edaignore` still correct?
