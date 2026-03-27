# Smart Copper Pour Agent Guide

Smart Copper Pour is an LCEDA Pro PCB extension that previews and applies copper backbones with `Tree`, `Star`, and `Daisy Chain` topologies.

## Rule Sources

- Root agent file: `AGENTS.md` (this file)
- Cursor rules: none found in `.cursor/rules/` or `.cursorrules`
- Copilot rules: none found in `.github/copilot-instructions.md`
- Formatting: `.editorconfig`, `.prettierrc.js`
- Linting: `.eslintrc.js`
- Packaging ignore list: `.edaignore`
- Git hook behavior: `.husky/pre-commit`

## Core Commands

### Install

- `npm install` — install dependencies
- `npm ci` — clean install from lockfile

### Build

- `npm run compile` — compile TypeScript into `dist/`
- `npm run build` — compile and package the extension into `build/dist/*.eext`

### Test

- `npm test` — run all Vitest tests
- `npm test -- --run tests/application/extension-manifest.test.ts` — run a single test file
- `npm test -- --run tests/infrastructure/lceda/index-runtime.test.ts` — run one focused integration test file
- `npm test -- --run tests/domain/tree-backbone-planner.test.ts` — run one domain test file

### Lint / Format

- `npm run eslint:all` — run ESLint with `--fix` on `*.ts`
- `npm run prettier:all` — run Prettier on the repository
- `npm run fix` — run Prettier then ESLint
- `npx eslint path/to/file.ts` — lint one file without repository-wide fixes
- `npx prettier --check path/to/file.ts` — check one file formatting

## Git Hook Behavior

- Pre-commit hook runs `npm install` and then `npx lint-staged`
- `lint-staged` runs `eslint --cache --fix` on `*.ts`
- `lint-staged` runs `prettier --write` on `*.{js,ts,html,css,json,md}`
- Expect commits to fail if staged TypeScript violates ESLint rules
- Do not assume a clean `npm test` implies a clean commit hook

## Repository Layout

- `src/application/` — controller orchestration and message/data contracts
- `src/domain/` — topology planners, optimization, and domain types
- `src/infrastructure/lceda/` — LCEDA-specific adapters and runtime integrations
- `src/infrastructure/geometry/` — polygon/offset/boolean geometry helpers
- `iframe/` — iframe UI for the extension panel
- `tests/application/` — controller and manifest tests
- `tests/domain/` — planner and optimizer tests
- `tests/infrastructure/` — runtime, bridge, geometry, and LCEDA adapter tests
- `build/` — extension packager
- `docs/` — plans, specs, and user-facing notes
- `images/`, `locales/` — extension assets and translations

## Key Entry Points

- `extension.json` — extension metadata, menu registration, package entry path
- `src/index.ts` — exported extension functions such as `openSmartCopperPour()` and `about()`
- `src/application/smart-copper-pour-controller.ts` — main controller for inspect / preview / apply / clear
- `src/application/smart-copper-pour-contract.ts` — request/response DTOs and constants
- `src/infrastructure/lceda/message-bus-bridge.ts` — iframe-to-controller bridge
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` — selection -> planner -> polygon path
- `src/infrastructure/lceda/runtime-pour-object-store.ts` — LCEDA `Region` / `Pour` create/delete adapter
- `src/infrastructure/lceda/pour-writer.ts` — preview/apply object lifecycle and rollback
- `iframe/index.html` — user-visible panel and request publishing

## Packaging Notes

- `build/packaged.ts` packages files not excluded by `.edaignore`
- `src/` is excluded from the final `.eext`; compiled code in `dist/` is what ships
- `extension.json` is included in the package and its `name` controls the packaged filename

## Code Style Rules

### Formatting

- Use tabs and tab width `4` for `ts`, `js`, `json`, `html`, and `css`
- Use LF line endings and always end files with a newline
- Use single quotes and trailing commas
- Keep long lines within the existing Prettier behavior (`printWidth: 150`)

### Imports

- Follow Prettier import sorting:
    - third-party imports first
    - relative imports second
- Separate import groups
- Sort import specifiers
- Prefer `import type` for type-only imports
- Do not introduce `require()` in TypeScript unless a file already depends on that pattern and there is no safe typed alternative

### Types

- Preserve strict typing; avoid `any`
- Add explicit return types on exported functions and public helpers
- Prefer narrow string unions and domain-specific types over broad primitives
- Keep runtime adapter interfaces explicit at module boundaries
- Prefer typed DTOs in `src/application/` over ad hoc payload objects

### Naming

- Use descriptive domain names, not generic helper names
- Follow existing domain vocabulary: `PadNode`, `TopologyMode`, `PreviewGateway`, `PourWriter`, `ObstacleResolver`
- Use `createXxx()` factory naming for constructors returning bound collaborators
- Keep menu/register function names aligned with `extension.json` values
- Avoid one-letter names except for very local math callbacks

### Functions and Modules

- Prefer small focused modules with one responsibility
- Keep application orchestration in `src/application/`
- Keep pure planning/geometry logic in `src/domain/` or `src/infrastructure/geometry/`
- Keep LCEDA API usage isolated in `src/infrastructure/lceda/`
- Prefer early returns over nested conditionals

### Error Handling

- Fail explicitly on invalid runtime states; do not silently degrade behavior
- Throw clear `Error` messages for invalid LCEDA responses or unusable primitive ids
- Preserve rollback semantics in writer/object-store code
- Validate user input at application/controller boundaries
- Do not auto-fallback from final `Pour` creation to temporary `Region` creation unless a requirement explicitly says so

### Comments and Docs

- Keep comments in English
- Explain why, not what
- Public exported APIs should keep TSDoc-style comments if the surrounding file already uses them

## Testing Guidelines

- Add or update tests for every behavior change
- Prefer the narrowest test file first, then adjacent suites, then full test run
- Domain logic belongs in `tests/domain/`
- LCEDA/runtime adapter tests belong in `tests/infrastructure/lceda/`
- UI contract and controller behavior belong in `tests/application/` or bridge tests
- For manifest/menu regressions, use `tests/application/extension-manifest.test.ts`

## Agent Working Rules

- Check `extension.json` whenever changing menu items, plugin naming, or exported command names
- Check `.edaignore` before assuming a file will ship in the packaged extension
- Do not edit `dist/` manually; regenerate it with `npm run compile`
- Do not edit `build/dist/*.eext` manually; regenerate it with `npm run build`
- Prefer surgical changes over broad refactors
- If a task touches runtime integration, validate both tests and packaging/build behavior

## Common Single-File Test Commands

- `npm test -- --run tests/application/smart-copper-pour-controller.test.ts`
- `npm test -- --run tests/application/extension-manifest.test.ts`
- `npm test -- --run tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
- `npm test -- --run tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`
- `npm test -- --run tests/infrastructure/lceda/pour-writer.test.ts`
- `npm test -- --run tests/infrastructure/lceda/message-bus-bridge.test.ts`
- `npm test -- --run tests/domain/tree-backbone-planner.test.ts`
- `npm test -- --run tests/domain/star-backbone-planner.test.ts`
- `npm test -- --run tests/domain/daisy-chain-planner.test.ts`

## Known Workflow Gotchas

- The package name and extension manifest name must stay aligned
- `extension.json` version should stay aligned with `package.json` version
- Menu visibility is currently PCB-only; avoid reintroducing misleading `home` or `sch` groups unless requested
- Build success does not guarantee commit-hook success; pre-commit also runs lint-staged fixes
- LCEDA `Region` / `Pour` APIs are BETA-sensitive, so runtime code should remain conservative and explicit
  <!-- TRELLIS:START -->

# Trellis Instructions

These instructions are for AI assistants working in this project.

Use the `/trellis:start` command when starting a new session to:

- Initialize your developer identity
- Understand current project context
- Read relevant guidelines

Use `@/.trellis/` to learn:

- Development workflow (`workflow.md`)
- Project structure guidelines (`spec/`)
- Developer workspace (`workspace/`)

Keep this managed block so 'trellis update' can refresh the instructions.

<!-- TRELLIS:END -->
