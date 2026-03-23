# Real LCEDA Pour API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder smart-copper runtime with real LCEDA `Region` / `Pour` persistence and real polygon generation, while preserving preview/apply semantics and rollback behavior.

**Architecture:** Keep the application controller unchanged. Move all LCEDA-specific behavior into focused infrastructure modules: one module builds real copper polygons from the current selection and request, one module maps polygons to LCEDA primitives, and the existing writer continues to own preview-session and rollback rules.

**Tech Stack:** TypeScript, Vitest, LCEDA Pro API (`@jlceda/pro-api-types`), existing topology planners, existing polygon offset builder, esbuild

---

## File Map

- Modify: `src/index.ts`
  - Keep as composition root only.
  - Stop building placeholder square polygons.
  - Stop injecting the placeholder object store.
- Modify: `src/infrastructure/lceda/pour-writer.ts`
  - Switch from raw string ids to explicit stored-object refs.
  - Preserve preview token and rollback semantics.
- Create: `src/infrastructure/lceda/runtime-pour-object-store.ts`
  - Convert `SkeletonPolygon` shells into LCEDA polygon command arrays.
  - Call `eda.pcb_MathPolygon.createPolygon(...)`.
  - Create/delete `Region` and `Pour` primitives.
- Create: `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
  - Own current-selection reading in production.
  - Accept an optional reader override in tests only.
  - Reuse the existing pad normalization path.
  - Run topology planners.
  - Widen skeletons into real polygons.
- Create: `tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
  - Characterize polygon encoding and LCEDA primitive routing.
- Create: `tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`
  - Verify real selection -> plan -> polygon flow replaces the square placeholder.
- Create: `tests/infrastructure/lceda/index-runtime.test.ts`
  - Verify `src/index.ts` wires preview/apply to the runtime plan builder and writer correctly.
- Modify: `tests/infrastructure/lceda/pour-writer.test.ts`
  - Update for stored-object refs and add rollback-sensitive assertions.
- Modify: `README.md`
  - Remove placeholder-runtime limitation.
- Modify: `README.en.md`
  - Remove placeholder-runtime limitation.
- Modify: `CHANGELOG.md`
  - Note real LCEDA preview/apply integration.

## Preflight

- Before Task 1, inspect the current diffs in `src/index.ts`, `README.md`, `README.en.md`, and `CHANGELOG.md` and preserve unrelated user changes.
- Do not overwrite or revert existing edits in those files; merge the runtime/API changes into the current file state.
- Defer doc edits until Task 5 so runtime code lands first and documentation can describe the final behavior accurately.

## Task 1: Convert writer session state to explicit object refs

**Files:**
- Modify: `src/infrastructure/lceda/pour-writer.ts`
- Modify: `tests/infrastructure/lceda/pour-writer.test.ts`

- [ ] **Step 1: Write the failing writer ref-shape tests**

Update the writer tests so the object store returns and deletes structured refs instead of raw strings.

```ts
const createObjectStore = (): LcedaPourObjectStore => ({
	createPreviewRegion: vi.fn(async ({ polygonIndex }) => ({ kind: 'region', primitiveId: `preview-${polygonIndex}` })),
	createPour: vi.fn(async ({ polygonIndex }) => ({ kind: 'pour', primitiveId: `pour-${polygonIndex}` })),
	deleteObject: vi.fn(async () => undefined),
});

expect(objectStore.deleteObject).toHaveBeenCalledWith({ kind: 'region', primitiveId: 'preview-0' });
```

- [ ] **Step 2: Run writer tests to verify they fail**

Run: `npm test -- --run tests/infrastructure/lceda/pour-writer.test.ts`
Expected: FAIL because `pour-writer.ts` still expects raw string ids.

- [ ] **Step 3: Write the minimal writer ref implementation**

Change the infrastructure contract and preview session storage.

```ts
export interface LcedaStoredObjectRef {
	kind: 'region' | 'pour';
	primitiveId: string;
}

interface PreviewSession {
	token: string;
	objectRefs: LcedaStoredObjectRef[];
}
```

- [ ] **Step 4: Run writer tests to verify they pass**

Run: `npm test -- --run tests/infrastructure/lceda/pour-writer.test.ts`
Expected: PASS, including preview rollback and pour rollback assertions.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/lceda/pour-writer.ts tests/infrastructure/lceda/pour-writer.test.ts
git commit -m "refactor: track LCEDA object refs in pour writer"
```

## Task 2: Add the real LCEDA object store adapter

**Files:**
- Create: `src/infrastructure/lceda/runtime-pour-object-store.ts`
- Create: `tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
- Modify: `src/infrastructure/lceda/pour-writer.ts`

- [ ] **Step 1: Write the failing runtime object-store tests**

Create tests that mock `globalThis.eda` and verify polygon encoding, create routing, and delete routing.

```ts
test('creates a preview region from a closed polygon shell', async () => {
	const objectStore = createRuntimeLcedaPourObjectStore();
	await expect(objectStore.createPreviewRegion(input)).resolves.toEqual({
		kind: 'region',
		primitiveId: 'region-1',
	});
	expect(eda.pcb_MathPolygon.createPolygon).toHaveBeenCalledWith([0, 0, 'L', 10, 0, 'L', 10, 6, 'L', 0, 6, 'L', 0, 0]);
});

test('routes deleteObject to pcb_PrimitivePour.delete for pour refs', async () => {
	await objectStore.deleteObject({ kind: 'pour', primitiveId: 'pour-1' });
	expect(eda.pcb_PrimitivePour.delete).toHaveBeenCalledWith(['pour-1']);
});

test('rejects polygon shells when createPolygon returns undefined', async () => {
	eda.pcb_MathPolygon.createPolygon.mockReturnValueOnce(undefined);
	await expect(objectStore.createPreviewRegion(input)).rejects.toThrow('polygon');
});

test('throws when region creation returns undefined', async () => {
	eda.pcb_PrimitiveRegion.create.mockResolvedValueOnce(undefined);
	await expect(objectStore.createPreviewRegion(input)).rejects.toThrow('region');
});

test('throws when pour creation returns undefined', async () => {
	eda.pcb_PrimitivePour.create.mockResolvedValueOnce(undefined);
	await expect(objectStore.createPour(input)).rejects.toThrow('pour');
});
```

- [ ] **Step 2: Run adapter tests to verify they fail**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
Expected: FAIL because `runtime-pour-object-store.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal LCEDA adapter**

Create helpers for polygon encoding, primitive creation, and delete routing.

```ts
const toPolygonSource = (polygon: SkeletonPolygon): TPCB_PolygonSourceArray => [
	polygon.vertices[0].x,
	polygon.vertices[0].y,
	...polygon.vertices.slice(1).flatMap((vertex) => ['L', vertex.x, vertex.y] as const),
	'L',
	polygon.vertices[0].x,
	polygon.vertices[0].y,
];

const toStoredObjectRef = (kind: 'region' | 'pour', primitiveId: string): LcedaStoredObjectRef => ({ kind, primitiveId });
```

- [ ] **Step 4: Run adapter tests to verify they pass**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
Expected: PASS, including triangle/rectangle encoding, invalid polygon, `create(...)=undefined`, and delete-routing cases.

- [ ] **Step 5: Re-run writer tests**

Run: `npm test -- --run tests/infrastructure/lceda/pour-writer.test.ts tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
Expected: PASS with the new object-ref contract.

- [ ] **Step 6: Commit**

```bash
git add src/infrastructure/lceda/pour-writer.ts src/infrastructure/lceda/runtime-pour-object-store.ts tests/infrastructure/lceda/pour-writer.test.ts tests/infrastructure/lceda/runtime-pour-object-store.test.ts
git commit -m "feat: add real LCEDA pour object store"
```

## Task 3: Replace the placeholder square with a real copper-plan builder

**Files:**
- Create: `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
- Create: `tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`

- [ ] **Step 1: Write the failing copper-plan builder tests**

Create tests that provide fake selected pads and assert the builder emits real polygons for `tree`, `star`, and `daisyChain` requests.

```ts
test('builds tree preview polygons from selected pads', async () => {
	const builder = createRuntimeCopperPlanBuilder({
		readSelectedPrimitives: async () => [padA, padB, padC],
	});

	const result = await builder.buildWriterInput({
		topologyMode: 'tree',
		width: 20,
		keepoutMargin: 0,
	});

	expect(result.netName).toBe('VCC');
	expect(result.layerName).toBe('TopLayer');
	expect(result.polygons.length).toBeGreaterThan(0);
});
```

The production signature should remain `createRuntimeCopperPlanBuilder()` and default to `createLcedaSelectedPrimitivesReader()`. The injected reader exists only to keep the test small and deterministic.

- [ ] **Step 2: Run copper-plan builder tests to verify they fail**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`
Expected: FAIL because `runtime-copper-plan-builder.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal real geometry builder**

Compose existing modules instead of inventing new planner logic.

```ts
const padNodes = resolveSelectedPadNodes(await reader.readSelectedPrimitives());
const segments = request.topologyMode === 'tree'
	? planTreeBackbone(padNodes, { trunkBias: request.trunkBias }).segments
	: request.topologyMode === 'star'
		? planStarBackbone(padNodes).segments
		: planDaisyChainBackbone(padNodes, {
			trunkStart: request.trunkStart,
			trunkEnd: request.trunkEnd,
		}).segments;

const polygons = buildSkeletonOffsetPolygons({
	segments,
	width: request.width,
	cornerStyle: request.cornerStyle,
});

return {
	layerName: padNodes[0].layer,
	netName: padNodes[0].net,
	polygons,
};
```

Keep `src/infrastructure/lceda/selection-resolver.ts` unchanged unless a failing test proves the existing pad normalization contract is insufficient.

Do **not** move `autoExpand`, obstacle resolution, or width optimization into this builder. Those behaviors already belong to `src/application/smart-copper-pour-controller.ts`; the builder consumes the final request width it receives.

- [ ] **Step 4: Run copper-plan builder tests to verify they pass**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`
Expected: PASS with non-empty polygons and correct layer/net propagation.

- [ ] **Step 5: Run adjacent geometry tests**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts tests/infrastructure/geometry/polygon-offset-builder.test.ts tests/infrastructure/lceda/selection-resolver.test.ts`
Expected: PASS, confirming the builder reuses existing geometry and selection contracts safely.

- [ ] **Step 6: Commit**

```bash
git add src/infrastructure/lceda/runtime-copper-plan-builder.ts tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts
git commit -m "feat: build real smart copper polygons at runtime"
```

## Task 4: Wire the runtime dependencies into the composition root

**Files:**
- Modify: `src/index.ts`
- Create: `tests/infrastructure/lceda/index-runtime.test.ts`

- [ ] **Step 1: Write the failing runtime dependency wiring tests**

Export the current runtime assembly helper from `src/index.ts` and assert it delegates preview/apply through the real plan builder and object store.

```ts
vi.mock('../../../src/infrastructure/lceda/runtime-copper-plan-builder', () => ({
	createRuntimeCopperPlanBuilder: () => planBuilder,
}));

vi.mock('../../../src/infrastructure/lceda/pour-writer', () => ({
	createLcedaPourWriter: () => writer,
}));

test('preview gateway builds real polygons before writing preview regions', async () => {
	const dependencies = createRuntimeSmartCopperPourControllerDependencies();

	await dependencies.previewGateway.preview(previewRequest);
	expect(planBuilder.buildWriterInput).toHaveBeenCalledWith(previewRequest);
	expect(writer.writePreview).toHaveBeenCalled();
});

test('runtime assembly no longer references placeholder helpers', () => {
	expect(String(createRuntimeSmartCopperPourControllerDependencies)).not.toContain('createPlaceholderPolygon');
	expect(String(createRuntimeSmartCopperPourControllerDependencies)).not.toContain('createPlaceholderLcedaPourObjectStore');
});
```

- [ ] **Step 2: Run runtime dependency tests to verify they fail**

Run: `npm test -- --run tests/infrastructure/lceda/index-runtime.test.ts`
Expected: FAIL because the extracted runtime factory does not exist yet.

- [ ] **Step 3: Implement the minimal runtime assembly and rewire `src/index.ts`**

Keep `src/index.ts` as composition root and make it use the new runtime builder and object store.

```ts
export const createRuntimeSmartCopperPourControllerDependencies = (): SmartCopperPourControllerDependencies => {
	const inspector = createSmartCopperPourSelectionInspector(createLcedaSelectedPrimitivesReader());
	const planBuilder = createRuntimeCopperPlanBuilder();
	const writer = createLcedaPourWriter(createRuntimeLcedaPourObjectStore());

	return createSmartCopperPourControllerDependencies({
		selectionInspector: inspector,
		previewGateway: {
			preview: async (request) => writer.writePreview(await planBuilder.buildWriterInput(request)),
			clearPreview: async () => writer.clearPreview(),
		},
		applyGateway: {
			apply: async (request) => writer.applyFinal({
				...(await planBuilder.buildWriterInput(request)),
				previewToken: request.previewToken ?? null,
			}),
		},
	});
};
```

Delete `createPlaceholderPolygon(...)`, `createPlaceholderLcedaPourObjectStore(...)`, and any helper that exists only to support the fake runtime path.

- [ ] **Step 4: Run runtime dependency tests to verify they pass**

Run: `npm test -- --run tests/infrastructure/lceda/index-runtime.test.ts`
Expected: PASS and no placeholder-square helper remains in the runtime path.

- [ ] **Step 5: Run focused integration tests and compile**

Run: `npm test -- --run tests/infrastructure/lceda/index-runtime.test.ts tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts tests/infrastructure/lceda/runtime-pour-object-store.test.ts tests/infrastructure/lceda/pour-writer.test.ts tests/application/smart-copper-pour-controller.test.ts && npm run compile`
Expected: PASS, then compile succeeds with the composition root calling the real runtime path while controller auto-expand and obstacle behavior remain unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/index.ts tests/infrastructure/lceda/index-runtime.test.ts
git commit -m "feat: wire real LCEDA smart copper runtime"
```

## Task 5: Update documentation and run final verification

**Files:**
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Write the failing documentation expectation**

Identify and remove any text that still says the `Region` / `Pour` runtime path is placeholder-backed.

- [ ] **Step 2: Update the docs minimally**

Revise the runtime status and note the new LCEDA API dependency and BETA caveat.

- [ ] **Step 3: Run focused verification**

Run: `npm test -- --run tests/infrastructure/lceda/runtime-pour-object-store.test.ts tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts tests/infrastructure/lceda/index-runtime.test.ts tests/infrastructure/lceda/pour-writer.test.ts`
Expected: PASS.

- [ ] **Step 4: Run full project verification**

Run: `npm test && npm run build`
Expected: all tests pass and the extension package builds successfully.

- [ ] **Step 5: Commit**

```bash
git add README.md README.en.md CHANGELOG.md
git commit -m "docs: describe real LCEDA pour integration"
```
