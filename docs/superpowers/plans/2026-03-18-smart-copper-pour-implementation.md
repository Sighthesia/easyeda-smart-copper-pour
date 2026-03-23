# Smart Copper Pour Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a usable LCEDA PRO extension that converts selected same-net pads into previewable smart copper geometry, then applies it as a final pour.

**Architecture:** Keep LCEDA API access isolated in infrastructure modules, while domain modules own topology and geometry decisions. Preview is written as temporary region geometry, and final output is written as a pour so the UI stays responsive and the board artifact remains semantically correct.

**Tech Stack:** TypeScript, LCEDA PRO extension API, `js-angusj-clipper` or `clipper-lib`, esbuild, iframe UI, ESLint, Prettier

---

## Prerequisites

- Node.js: `>=20.5.0`
- Package manager: `npm` using the existing `package-lock.json`
- Build script meanings:
  - `npm test`: run automated unit tests with `vitest`
  - `npm run compile`: compile TypeScript entrypoints into `dist/index.js`
  - `npm run build`: compile and package the extension into `build/dist/*.eext`
- Manual smoke test target: a simple PCB with 3-6 pads on one power net plus at least one nearby foreign-net obstacle.
- LCEDA validation method: install the packaged extension from `build/dist/`, open the PCB editor, select pads, and trigger the menu command.

## File Map

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `extension.json`
- Modify: `src/index.ts`
- Modify: `iframe/index.html`
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: `CHANGELOG.md`
- Create: `src/application/smart-copper-pour-contract.ts`
- Create: `src/application/smart-copper-pour-controller.ts`
- Create: `src/domain/pad-node.ts`
- Create: `src/domain/skeleton-types.ts`
- Create: `src/domain/topology-mode.ts`
- Create: `src/domain/tree-backbone-planner.ts`
- Create: `src/domain/star-backbone-planner.ts`
- Create: `src/domain/daisy-chain-planner.ts`
- Create: `src/domain/clearance-optimizer.ts`
- Create: `src/infrastructure/lceda/selection-resolver.ts`
- Create: `src/infrastructure/lceda/pour-writer.ts`
- Create: `src/infrastructure/lceda/net-obstacle-resolver.ts`
- Create: `src/infrastructure/lceda/message-bus-bridge.ts`
- Create: `src/infrastructure/geometry/polygon-offset-builder.ts`
- Create: `src/infrastructure/geometry/polygon-boolean.ts`
- Create: `tests/domain/tree-backbone-planner.test.ts`
- Create: `tests/domain/star-backbone-planner.test.ts`
- Create: `tests/domain/daisy-chain-planner.test.ts`
- Create: `tests/domain/clearance-optimizer.test.ts`
- Create: `tests/infrastructure/geometry/polygon-offset-builder.test.ts`
- Create: `tests/infrastructure/lceda/selection-resolver.test.ts`

### Task 0: Prepare development and test scripts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add the test dependency**

Install `vitest` as the repo test runner.

- [ ] **Step 2: Define stable scripts**

Add `"test": "vitest run"` to `package.json` so every later task can use one consistent command.

- [ ] **Step 3: Verify scripts exist**

Run: `npm test -- --help && npm run compile -- --help`
Expected: `npm test` resolves to Vitest and `npm run compile` remains available.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "test: add smart copper test runner"
```

### Task 1: Establish extension contract

**Files:**
- Modify: `extension.json`
- Modify: `src/index.ts`
- Create: `src/application/smart-copper-pour-contract.ts`
- Create: `src/application/smart-copper-pour-controller.ts`

- [ ] **Step 1: Define the command and message contracts**

Create DTOs for selection summary, preview request, apply request, and error payloads in `src/application/smart-copper-pour-contract.ts`.

- [ ] **Step 2: Add the PCB menu entry**

Add a `Smart Copper Pour` menu item in `extension.json` that points to a new exported function in `src/index.ts`.

- [ ] **Step 3: Create the controller skeleton**

Create `src/application/smart-copper-pour-controller.ts` with `inspectSelection`, `preview`, `apply`, and `clearPreview` command methods plus injected dependency contracts.

- [ ] **Step 4: Add the entry handler**

Export a handler from `src/index.ts` that opens the iframe, initializes controller dependencies, and registers message handlers.

- [ ] **Step 5: Verify compilation**

Run: `npm run compile`
Expected: build succeeds and emits `dist/index.js`

- [ ] **Step 6: Commit**

```bash
git add extension.json src/index.ts src/application/smart-copper-pour-contract.ts src/application/smart-copper-pour-controller.ts
git commit -m "feat: add smart copper pour entry contract"
```

### Task 2: Normalize selected pads

**Files:**
- Create: `src/domain/pad-node.ts`
- Create: `src/infrastructure/lceda/selection-resolver.ts`
- Create: `tests/infrastructure/lceda/selection-resolver.test.ts`
- Modify: `src/application/smart-copper-pour-controller.ts`

- [ ] **Step 1: Write the failing selection tests**

Create `tests/infrastructure/lceda/selection-resolver.test.ts` with cases for empty selection, one-pad selection, mixed-net rejection, mixed-layer rejection, and valid same-net pad normalization.

- [ ] **Step 2: Run the selection tests to confirm failure**

Run: `npm test -- --run tests/infrastructure/lceda/selection-resolver.test.ts`
Expected: FAIL because resolver implementation does not exist yet.

- [ ] **Step 3: Define normalized pad shape**

Create `PadNode` with id, net, layer, center, and effective radius.

- [ ] **Step 4: Implement selection resolution**

Read selected primitives, filter pads, validate net and layer, and convert them into `PadNode[]`.

- [ ] **Step 5: Surface actionable validation errors**

Return user-oriented messages for empty selection, insufficient pads, mixed nets, and mixed layers.

- [ ] **Step 6: Run selection resolver tests**

Run: `npm test -- --run tests/infrastructure/lceda/selection-resolver.test.ts`
Expected: selection resolver tests pass.

- [ ] **Step 7: Verify in editor and build**

Run: `npm run compile`
Expected: build succeeds with resolver referenced by controller.

- [ ] **Step 8: Commit**

```bash
git add src/domain/pad-node.ts src/infrastructure/lceda/selection-resolver.ts src/application/smart-copper-pour-controller.ts tests/infrastructure/lceda/selection-resolver.test.ts
git commit -m "feat: normalize selected power pads"
```

### Task 3: Implement tree and star topology planners

**Files:**
- Create: `src/domain/skeleton-types.ts`
- Create: `src/domain/topology-mode.ts`
- Create: `src/domain/tree-backbone-planner.ts`
- Create: `src/domain/star-backbone-planner.ts`
- Create: `tests/domain/tree-backbone-planner.test.ts`
- Create: `tests/domain/star-backbone-planner.test.ts`

- [ ] **Step 1: Write failing tree planner test**

```ts
import { describe, expect, it } from 'vitest';

describe('tree backbone planner', () => {
	it('connects pads with n-1 segments', () => {
		// Arrange pads in a triangle
		// Expect MST segment count to equal pad count - 1
	});
});
```

- [ ] **Step 2: Write failing star planner test**

```ts
import { describe, expect, it } from 'vitest';

describe('star backbone planner', () => {
	it('connects every pad to the hub', () => {
		// Expect every pad to have one segment to the hub
	});
});
```

- [ ] **Step 3: Implement skeleton contracts**

Define point, segment, polyline, polygon, and obstacle contracts in `src/domain/skeleton-types.ts` and topology mode enum in `src/domain/topology-mode.ts`.

- [ ] **Step 4: Implement MST planner**

Create deterministic MST output with stable tie-breaking so preview results do not jump between runs.

- [ ] **Step 5: Implement star planner**

Use centroid hub by default, with a future hook for source-pad hub selection.

- [ ] **Step 6: Run planner tests**

Run: `npm test -- --run tests/domain/tree-backbone-planner.test.ts tests/domain/star-backbone-planner.test.ts`
Expected: planner tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/domain/skeleton-types.ts src/domain/topology-mode.ts src/domain/tree-backbone-planner.ts src/domain/star-backbone-planner.ts tests/domain/tree-backbone-planner.test.ts tests/domain/star-backbone-planner.test.ts package.json package-lock.json
git commit -m "feat: add smart copper topology planners"
```

### Task 4: Convert skeleton into polygon geometry

**Files:**
- Modify: `package.json`
- Create: `src/infrastructure/geometry/polygon-offset-builder.ts`
- Create: `src/infrastructure/geometry/polygon-boolean.ts`
- Create: `tests/infrastructure/geometry/polygon-offset-builder.test.ts`

- [ ] **Step 1: Add geometry dependency**

Install `js-angusj-clipper` first. If `npm run build` fails because wasm assets cannot be bundled or LCEDA throws a runtime WebAssembly loading error during smoke test, replace it within this task with `clipper-lib` and update the task notes.

- [ ] **Step 2: Write the failing polygon builder test**

```ts
import { describe, expect, it } from 'vitest';

describe('polygon offset builder', () => {
	it('creates a non-empty outline from one segment', () => {
		// Expect output polygon point count > 0
	});
});
```

- [ ] **Step 3: Implement segment stroking and union**

Turn skeleton segments into widened paths, union overlapping branches, and normalize the result into one or more polygons.

- [ ] **Step 4: Support rounded corner default**

Expose join style so the UI can toggle rounded or sharp corners later.

- [ ] **Step 5: Run geometry test**

Run: `npm test -- --run tests/infrastructure/geometry/polygon-offset-builder.test.ts`
Expected: test passes and generated polygons are non-empty.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/infrastructure/geometry/polygon-offset-builder.ts src/infrastructure/geometry/polygon-boolean.ts tests/infrastructure/geometry/polygon-offset-builder.test.ts
git commit -m "feat: build copper polygons from skeletons"
```

### Task 5: Add preview and apply writer

**Files:**
- Modify: `src/index.ts`
- Create: `src/infrastructure/lceda/pour-writer.ts`
- Modify: `src/application/smart-copper-pour-controller.ts`

- [ ] **Step 1: Implement preview region writer**

Create and track temporary region objects from polygon outlines.

- [ ] **Step 2: Implement final pour writer**

Create final pour geometry with target net and layer, and delete stale preview on success.

- [ ] **Step 3: Add failure rollback behavior**

If apply fails, keep or restore preview state.

- [ ] **Step 4: Add a temporary non-UI trigger path**

Expose a developer-only command entry in `src/index.ts` that calls the controller preview and apply flow with current defaults, so writer behavior can be checked before the iframe is finished.

- [ ] **Step 5: Manual verification in LCEDA**

Run: `npm run compile`
Expected: controller and writer compile cleanly, and a temporary developer-only trigger path can call preview and apply without the iframe.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/infrastructure/lceda/pour-writer.ts src/application/smart-copper-pour-controller.ts
git commit -m "feat: add smart copper preview and apply"
```

### Task 6: Build iframe UI and bus bridge

**Files:**
- Modify: `iframe/index.html`
- Create: `src/infrastructure/lceda/message-bus-bridge.ts`
- Modify: `src/index.ts`
- Modify: `src/application/smart-copper-pour-controller.ts`

- [ ] **Step 1: Add iframe form controls**

Expose topology mode, width, keepout margin, corner style, auto/manual width expansion, preview, apply, and clear actions in `iframe/index.html`.

- [ ] **Step 2: Implement message bridge**

Translate iframe requests into controller commands and send result payloads back to the UI.

- [ ] **Step 3: Remove or gate the temporary trigger path**

Delete the developer-only command from `src/index.ts`, or guard it behind a clearly non-shipping debug flag before packaging.

- [ ] **Step 4: Display validation and success states**

Show inferred net, selected pad count, and error messages inside the iframe.

- [ ] **Step 5: Manual verification in LCEDA**

Run: `npm run build`
Expected: iframe opens, parameters change preview, apply succeeds.

- [ ] **Step 6: Commit**

```bash
git add iframe/index.html src/infrastructure/lceda/message-bus-bridge.ts src/index.ts src/application/smart-copper-pour-controller.ts
git commit -m "feat: add smart copper pour control panel"
```

### Task 7: Add clearance-aware expansion

**Files:**
- Modify: `src/application/smart-copper-pour-contract.ts`
- Create: `src/domain/clearance-optimizer.ts`
- Create: `src/infrastructure/lceda/net-obstacle-resolver.ts`
- Create: `tests/domain/clearance-optimizer.test.ts`
- Modify: `src/application/smart-copper-pour-controller.ts`

- [ ] **Step 1: Write failing optimizer test**

```ts
import { describe, expect, it } from 'vitest';

describe('clearance optimizer', () => {
	it('stops growth before obstacle collision', () => {
		// Expect chosen width to be smaller than colliding width
	});
});
```

- [ ] **Step 2: Extend request contract for optimization controls**

Add `autoExpand`, `maxWidth`, `widthStep`, and obstacle margin fields in `src/application/smart-copper-pour-contract.ts` and thread them through the controller.

- [ ] **Step 3: Implement obstacle resolver**

Query same-layer foreign-net primitives and convert them into conservative obstacle envelopes.

- [ ] **Step 4: Implement iterative width growth**

Grow width in steps, keep the last safe polygon, and optionally binary-search the final interval.

- [ ] **Step 5: Integrate optimizer into preview flow**

Allow UI to toggle manual width versus auto expansion.

- [ ] **Step 6: Run optimizer test**

Run: `npm test -- --run tests/domain/clearance-optimizer.test.ts`
Expected: test passes with deterministic chosen width.

- [ ] **Step 7: Commit**

```bash
git add src/application/smart-copper-pour-contract.ts src/domain/clearance-optimizer.ts src/infrastructure/lceda/net-obstacle-resolver.ts src/application/smart-copper-pour-controller.ts tests/domain/clearance-optimizer.test.ts
git commit -m "feat: optimize smart copper width against obstacles"
```

### Task 8: Add trunk bias to tree mode (V1)

**Files:**
- Modify: `src/application/smart-copper-pour-contract.ts`
- Modify: `iframe/index.html`
- Modify: `src/application/smart-copper-pour-controller.ts`
- Modify: `src/domain/tree-backbone-planner.ts`

- [ ] **Step 1: Extend the request contract**

Add a `trunkBias` field that can prefer neutral, horizontal, or vertical backbone tendencies.

- [ ] **Step 2: Expose the control in UI**

Add a compact UI control in `iframe/index.html` for `Neutral`, `Horizontal`, and `Vertical`.

- [ ] **Step 3: Apply the bias in the planner**

Adjust MST edge scoring so the selected orientation is favored while preserving deterministic output.

- [ ] **Step 4: Verify biased preview behavior**

Run: `npm test -- --run tests/domain/tree-backbone-planner.test.ts && npm run build`
Expected: tree planner tests still pass and LCEDA package builds with the new control wired through.

- [ ] **Step 5: Commit**

```bash
git add src/application/smart-copper-pour-contract.ts iframe/index.html src/application/smart-copper-pour-controller.ts src/domain/tree-backbone-planner.ts
git commit -m "feat: add trunk bias for smart copper tree mode"
```

### Task 9: Add daisy-chain and trunk-constrained mode (M4 / post-V1)

**Files:**
- Create: `src/domain/daisy-chain-planner.ts`
- Create: `tests/domain/daisy-chain-planner.test.ts`
- Modify: `src/application/smart-copper-pour-contract.ts`
- Modify: `iframe/index.html`
- Modify: `src/application/smart-copper-pour-controller.ts`

This task is intentionally scoped as post-V1. Complete it after tree, star, preview/apply, and width expansion are stable.

- [ ] **Step 1: Write failing daisy-chain planner test**

```ts
import { describe, expect, it } from 'vitest';

describe('daisy chain planner', () => {
	it('orders pads along the trunk projection', () => {
		// Expect branch attachment order to follow trunk distance
	});
});
```

- [ ] **Step 2: Extend request contract**

Add trunk start, end edge, and mode-specific options.

- [ ] **Step 3: Implement planner**

Build a trunk, project pads, sort attachments, and emit trunk plus branch segments.

- [ ] **Step 4: Expose mode in UI and controller**

Show daisy-chain inputs only when this mode is selected.

- [ ] **Step 5: Run planner test and build**

Run: `npm test -- --run tests/domain/daisy-chain-planner.test.ts && npm run build`
Expected: daisy-chain planner test passes and extension package builds.

- [ ] **Step 6: Commit**

```bash
git add src/domain/daisy-chain-planner.ts tests/domain/daisy-chain-planner.test.ts src/application/smart-copper-pour-contract.ts iframe/index.html src/application/smart-copper-pour-controller.ts
git commit -m "feat: add daisy-chain smart copper mode"
```

### Task 10: Final verification and documentation touch-up

**Files:**
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Document user-facing workflow**

Add a short usage section explaining selection, preview, apply, and supported modes.

- [ ] **Step 2: Run full validation**

Run: `npm test && npm run build`
Expected: tests pass and extension package is generated.

- [ ] **Step 3: Smoke test in LCEDA**

Verify tree mode, star mode, width expansion, corner style, and trunk bias on a simple PCB project.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json extension.json src/index.ts iframe/index.html src/application src/domain src/infrastructure tests README.md README.en.md CHANGELOG.md
git commit -m "docs: describe smart copper pour workflow"
```

## Notes for Execution

- Keep each file under control of one responsibility; split once a file starts becoming a dumping ground.
- Prefer pure domain functions so planners and geometry builders remain testable outside LCEDA.
- Treat `PCB_PrimitivePour.create()` as unstable and preserve `Region` fallback behavior.
- If the selected geometry library cannot bundle cleanly, stop and swap to the fallback before continuing.
