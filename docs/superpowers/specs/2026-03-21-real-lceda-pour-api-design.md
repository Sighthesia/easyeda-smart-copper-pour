# Real LCEDA Pour API Integration Design

## Goal

Replace the placeholder preview/apply object store with the real LCEDA PCB object APIs while preserving the current product behavior:

- preview uses `Region`
- apply uses final `Pour`
- controller semantics stay unchanged
- partial pour writes roll back safely, and preview-cleanup failures stay explicit

In plain terms, the current system already knows how to plan copper and when to preview or apply. This work only replaces the fake "paper mockup" writer with the real board-writing pen.

## Scope

### In Scope

- Replace the in-memory `LcedaPourObjectStore` in `src/index.ts`
- Replace the placeholder square polygon path in `src/index.ts` with the existing planner + geometry pipeline
- Create real preview `Region` objects through LCEDA APIs
- Create real final `Pour` objects through LCEDA APIs
- Convert domain `SkeletonPolygon` vertices into LCEDA polygon objects
- Delete preview/final objects by real primitive id
- Preserve preview token lifecycle and rollback behavior in `src/infrastructure/lceda/pour-writer.ts`
- Add tests for runtime object store behavior with mocked LCEDA APIs
- Update docs to remove the placeholder limitation

### Out of Scope

- Changing topology planning, obstacle optimization, or iframe UX
- Adding automatic fallback from `Pour` to `Region` on apply failure
- Reworking controller contracts or message bus contracts
- Adding interactive on-canvas editing or repour management

## Constraints And Facts

### Confirmed Runtime APIs

The current repository already ships `@jlceda/pro-api-types`, which confirms the API signatures we need:

- `eda.pcb_MathPolygon.createPolygon(polygon)` creates an `IPCB_Polygon`
- `eda.pcb_PrimitiveRegion.create(layer, complexPolygon, ruleType, regionName, lineWidth, primitiveLock)` creates a preview region
- `eda.pcb_PrimitivePour.create(net, layer, complexPolygon, pourFillMethod, preserveSilos, pourName, pourPriority, lineWidth, primitiveLock)` creates a final pour
- `eda.pcb_PrimitiveRegion.delete(...)` deletes regions
- `eda.pcb_PrimitivePour.delete(...)` deletes pours

All of these APIs are marked `BETA`, so the design must make failures explicit and keep rollback local.

### Current State

Inside the active worktree, the current code already separates responsibilities across application and infrastructure modules:

- `src/application/smart-copper-pour-controller.ts` owns orchestration
- `src/infrastructure/lceda/pour-writer.ts` owns preview/apply session safety
- `src/index.ts` currently injects a fake `LcedaPourObjectStore`
- `src/index.ts` also still fabricates a square `createPlaceholderPolygon(...)` instead of consuming the real topology + offset pipeline

So there are two remaining placeholders at the runtime boundary:

1. fake object persistence
2. fake geometry input to the writer

This design covers both, because writing a fake square through real APIs would still be the wrong business result.

## Approaches Considered

### Approach A: `Region` preview + new `Pour` apply

Create preview objects as `Region`, then create fresh final `Pour` objects during apply.

**Pros**

- Matches the existing product contract exactly
- Keeps preview and final semantics clear
- Leaves `pour-writer` unchanged except for tests
- Makes rollback easier because preview and final ids are tracked independently

**Cons**

- Apply rebuilds LCEDA polygons instead of reusing preview objects
- `Pour` remains subject to BETA API behavior

### Approach B: `Region` preview converted into `Pour`

Preview as `Region`, then use object conversion during apply.

**Pros**

- Fewer object creations in theory
- Preview and final geometry are guaranteed identical

**Cons**

- Couples apply success to preview object state
- Harder to reason about rollback boundaries
- Pushes more runtime behavior into mutable object transitions

### Approach C: Direct `Pour` for preview and apply

Use only `Pour` objects for both preview and apply.

**Pros**

- Closest to final board semantics
- Fewer concept types to manage

**Cons**

- Highest runtime risk because preview also depends on BETA pour creation
- Makes preview cleanup more fragile
- Violates the established preview-as-region behavior

### Recommendation

Choose **Approach A**.

This is the most business-safe option. It behaves like using a washable marker for preview and permanent ink for final output: the operator gets a stable preview flow, while the final artifact remains a real copper pour.

## Architecture

### Target Module Split

- `src/index.ts`
  - Remain the composition root only
  - Replace the placeholder object store factory with a real runtime adapter factory
  - Replace the placeholder writer-input builder with a real copper-plan builder
  - Continue wiring selection inspector, preview gateway, and apply gateway

- `src/infrastructure/lceda/pour-writer.ts`
  - Keep current session token and rollback semantics
  - No direct `eda.*` calls

- `src/infrastructure/lceda/runtime-pour-object-store.ts`
  - New file
  - Encapsulate LCEDA polygon creation, preview region creation, final pour creation, and deletion
  - Return primitive ids as plain strings back to the writer

- `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
  - New file
  - Compose existing collaborators only, not invent new business rules
  - Call `createLcedaSelectedPrimitivesReader()` to read raw selection
  - Call `resolveSelectedPadNodes(...)` to normalize `PadNode[]`
  - Call one of `planTreeBackbone(...)`, `planStarBackbone(...)`, or `planDaisyChainBackbone(...)`
  - Call `buildSkeletonOffsetPolygons(...)` to produce final `SkeletonPolygon[]`
  - Return writer-ready `{ layerName, netName, polygons }`

- `tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
  - New file
  - Verify LCEDA API mapping and failure handling with mocked runtime globals

- `tests/infrastructure/lceda/pour-writer.test.ts`
  - Extend existing tests only if needed for integration assumptions

### Why A New Adapter File

Putting runtime object creation in its own file keeps the architecture honest:

- application stays API-agnostic
- writer stays stateful but pure in intent
- runtime adapter becomes the only place that understands LCEDA primitive classes

This is like keeping the cashier, kitchen, and delivery driver separate. Each role is simpler because it only does one job.

### Exact Ownership

- `controller`
  - validates request
  - keeps preview token lifecycle
  - owns width optimization decision

- `runtime-copper-plan-builder`
  - reads current selected pads
  - turns request topology into real polygons
  - does not track preview state

- `pour-writer`
  - tracks preview session refs
  - owns rollback order
  - does not know how polygons were computed

- `runtime-pour-object-store`
  - converts polygons into LCEDA objects
  - creates/deletes `Region` and `Pour`
  - does not know topology or UI semantics

## Data Flow

### Preview

1. Controller validates request and computes optimized width if needed.
2. Runtime copper-plan builder reads raw selection and resolves `PadNode[]`.
3. Runtime copper-plan builder plans segments from `topologyMode` and request fields.
4. Runtime copper-plan builder widens segments through `buildSkeletonOffsetPolygons(...)`.
5. Runtime gateway prepares `LcedaPourWriterPreviewInput` from real polygons.
6. Writer calls `objectStore.createPreviewRegion(...)` per polygon.
7. Runtime adapter:
   - converts `SkeletonPolygon.vertices` to LCEDA polygon source
   - calls `eda.pcb_MathPolygon.createPolygon(...)`
   - calls `eda.pcb_PrimitiveRegion.create(...)`
   - returns `region.getState_PrimitiveId()`
8. Writer stores returned refs in preview session state.

### Apply

1. Controller forwards the latest preview token.
2. Runtime copper-plan builder rebuilds the same polygon set from current selection and request.
3. Writer calls `objectStore.createPour(...)` per polygon.
4. Runtime adapter:
   - rebuilds LCEDA polygon objects from the same domain polygons
   - calls `eda.pcb_PrimitivePour.create(...)`
   - returns `pour.getState_PrimitiveId()`
5. Writer deletes preview refs only after all pours succeed.
6. If preview deletion fails, writer deletes newly created pours and surfaces the failure.

### Delete

The runtime adapter must know which primitive API to call for deletion.

To avoid string-prefix tricks, the infrastructure boundary should use an explicit object reference type:

```ts
type LcedaStoredObjectRef = {
	kind: 'region' | 'pour';
	primitiveId: string;
};
```

This keeps delete routing explicit and removes hidden assumptions about primitive id shape.

Deletion routing rule:

- `kind: 'region'` -> call `eda.pcb_PrimitiveRegion.delete([primitiveId])`
- `kind: 'pour'` -> call `eda.pcb_PrimitivePour.delete([primitiveId])`

The implementation should standardize on primitive-id array deletion even though LCEDA also accepts object instances. That keeps session state serializable and rollback logic simple.

## Interface Design

### Infrastructure Interface Change

The application layer still stays unchanged, but the infrastructure writer/object-store contract should use object refs instead of raw strings:

```ts
export interface LcedaStoredObjectRef {
	kind: 'region' | 'pour';
	primitiveId: string;
}

export interface LcedaPourObjectStore {
	createPreviewRegion(input: LcedaPourObjectInput): Promise<LcedaStoredObjectRef>;
	createPour(input: LcedaPourObjectInput): Promise<LcedaStoredObjectRef>;
	deleteObject(objectRef: LcedaStoredObjectRef): Promise<void>;
}
```

This change is intentionally local to `src/infrastructure/lceda/pour-writer.ts` and the new runtime adapter. The controller, message bus, and iframe contract do not change.

### New Internal Helpers

The runtime adapter should define focused helpers:

- `createPolygonSource(vertices)`
- `createLcedaPolygon(vertices)`
- `createPreviewRegionPrimitive(input)`
- `createPourPrimitive(input)`
- `toStoredObjectRef(kind, primitiveId)`

These helpers keep the file readable and make failure cases obvious.

## LCEDA Mapping Details

### API Verification Table

| API | Expected args | Expected return | Confirmed from | Runtime assumption left |
| --- | --- | --- | --- | --- |
| `eda.pcb_MathPolygon.createPolygon(...)` | line-command polygon source array | `IPCB_Polygon \| undefined` | local `@jlceda/pro-api-types`, docs, open-source examples | single closed-loop line encoding must be characterized by tests |
| `eda.pcb_PrimitiveRegion.create(...)` | `layer`, `polygon`, `[]`, `undefined`, `0`, `false` | `IPCB_PrimitiveRegion \| undefined` | local types and docs | `[]` as neutral preview rule set must be smoke-tested |
| `eda.pcb_PrimitivePour.create(...)` | `net`, `layer`, `polygon`, `undefined`, `undefined`, `undefined`, `undefined`, `0`, `false` | `IPCB_PrimitivePour \| undefined` | local types and docs | omitted pour options remain BETA-sensitive |
| `eda.pcb_PrimitiveRegion.delete(...)` | `[primitiveId]` | `Promise<boolean>` | local types | delete failure semantics must be treated as non-idempotent |
| `eda.pcb_PrimitivePour.delete(...)` | `[primitiveId]` | `Promise<boolean>` | local types | delete failure semantics must be treated as non-idempotent |

### Polygon Conversion

`SkeletonPolygon` currently exposes a flat vertex list. The adapter should map it into the `TPCB_PolygonSourceArray` shape expected by `createPolygon`.

The first implementation should use the same command-stream style seen in public EasyEDA examples:

```ts
[x0, y0, 'L', x1, y1, 'L', x2, y2, 'L', x0, y0]
```

That is: start point first, then straight-line `L` segments, and explicitly close the loop back to the first vertex.

Design rule:

- start with single-contour polygons only
- require at least 3 vertices
- surface a clear error if polygon creation returns `undefined`
- prove the closed-loop line encoding with a focused characterization test before using it in preview/apply
- pin the first characterization case to a triangle shell and a rectangle shell, and require both to be accepted by `createPolygon(...)`

If future geometry adds holes, that belongs in a separate design because it changes the domain polygon contract.

### Region Defaults

Preview regions should be created conservatively:

- `ruleType`: empty array or non-follow-rule neutral setting
- `regionName`: omitted
- `lineWidth`: `0`
- `primitiveLock`: `false`

The key business goal is visibility, not DRC rule ownership.

### Pour Defaults

Final pours should use stable conservative defaults:

- `pourFillMethod`: LCEDA default if omitted
- `preserveSilos`: LCEDA default if omitted
- `pourName`: omitted for now
- `pourPriority`: omitted for now
- `lineWidth`: `0`
- `primitiveLock`: `false`

YAGNI applies here. We should not invent product knobs that the current UI does not expose.

If runtime testing shows omitted optional parameters lead to unstable behavior, the adapter may promote selected defaults to explicit values in a follow-up change. That decision is deliberately deferred until runtime evidence exists.

## Error Handling

### Failure Points

The adapter must detect and throw clear errors for:

- invalid polygon vertex count
- `createPolygon(...)` returning `undefined`
- `create(...)` returning `undefined` for region or pour
- primitive created without a usable primitive id
- delete failures from LCEDA APIs
- geometry planning or offset building producing zero polygons

### Error Philosophy

Errors should stay explicit instead of silently degrading.

Do **not** auto-fallback from `Pour` to `Region` during apply. From a product perspective, that would be like promising a printed PCB and quietly shipping a paper prototype.

Also do **not** claim full board-state rollback if preview cleanup itself fails after final pours were created and rollback delete also fails. In that narrow case, the system guarantees best-effort reversal plus an explicit surfaced error, not perfect transactional behavior.

## Rollback Matrix

| Failure point | Immediate action | Secondary rollback | Final surfaced result |
| --- | --- | --- | --- |
| preview polygon creation fails before any region create | abort preview | none | preview fails, board unchanged |
| preview region creation fails after some preview regions created | stop preview | delete already-created preview regions | preview fails, board unchanged |
| apply polygon creation fails before any pour create | abort apply | none | apply fails, preview remains |
| apply pour creation fails after some pours created | stop apply | delete newly created pours | apply fails, preview remains |
| preview cleanup fails after all pours created | stop apply completion | delete newly created pours | apply fails, original preview may remain partially present |
| delete during rollback fails | preserve first original error and best-effort cleanup | none beyond attempted rollback | explicit failure requiring user awareness |

## Testing Strategy

### TDD Sequence

1. Add failing tests for the new runtime adapter.
2. Watch them fail for the expected reason.
3. Implement minimal adapter logic.
4. Re-run focused tests.
5. Re-run the broader writer tests.
6. Build the extension package.

### Required Test Cases

- runtime copper-plan builder replaces the placeholder square and emits polygons from selected pads + topology request
- preview region creation returns `{ kind: 'region', primitiveId }`
- final pour creation returns `{ kind: 'pour', primitiveId }`
- polygon encoder emits closed-loop line-command arrays for simple shells
- triangle source `[0, 0, 'L', 10, 0, 'L', 5, 10, 'L', 0, 0]` is accepted by `createPolygon(...)`
- rectangle source `[0, 0, 'L', 10, 0, 'L', 10, 5, 'L', 0, 5, 'L', 0, 0]` is accepted by `createPolygon(...)`
- adapter throws when polygon creation returns `undefined`
- adapter throws when region creation returns `undefined`
- adapter throws when pour creation returns `undefined`
- delete routes region refs to `eda.pcb_PrimitiveRegion.delete(...)`
- delete routes pour refs to `eda.pcb_PrimitivePour.delete(...)`
- writer rolls back created pours when preview cleanup fails
- rollback delete failures are terminal in V1, surfaced immediately, and are not retried automatically

## Delete Failure Policy

V1 treats delete failures as terminal, not retryable.

- no automatic retries
- preserve and surface the first delete error
- perform best-effort cleanup for the remaining refs in the same rollback batch
- leave any residual board artifact visible to the user rather than hiding the failure

This policy is intentionally strict. Retrying a BETA API without evidence would be like yanking a stuck drawer harder without knowing whether the rail is bent.

### Verification

- `npm test -- --run tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
- `npm test -- --run tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`
- `npm test -- --run tests/infrastructure/lceda/pour-writer.test.ts`
- `npm run build`

## Risks

### BETA API Stability

`Region` and `Pour` APIs are BETA. The design limits this risk by isolating all direct calls in one adapter file.

### Polygon Shape Assumption

If LCEDA expects a more specific polygon source structure than the current single-loop assumption, the adapter may need a small shape-normalization tweak. This risk is contained because the conversion is centralized.

### Delete Semantics

The writer assumes delete is idempotent enough for rollback flows. If LCEDA delete APIs behave differently, only the adapter contract needs adjustment.

## Implementation Impact

### Files To Modify

- `src/index.ts`
- `src/infrastructure/lceda/pour-writer.ts`
- `README.md`
- `README.en.md`
- `CHANGELOG.md`

### Files To Create

- `src/infrastructure/lceda/runtime-pour-object-store.ts`
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts`
- `tests/infrastructure/lceda/runtime-pour-object-store.test.ts`
- `tests/infrastructure/lceda/runtime-copper-plan-builder.test.ts`

### Files Likely Unchanged

- `src/application/smart-copper-pour-controller.ts`
- `src/infrastructure/lceda/message-bus-bridge.ts`
- domain planners and geometry builders

### Files Likely To Adjust Slightly

- `src/infrastructure/lceda/pour-writer.ts`
  - switch preview session storage from raw string ids to explicit object refs

## Acceptance Criteria

- Preview path creates real LCEDA `Region` objects
- Apply path creates real LCEDA `Pour` objects
- Preview cleanup still works through preview token matching
- Failed apply rolls back newly created `Pour` objects
- No controller or iframe contract change is required
- Tests cover adapter mapping and rollback-sensitive behavior
- Docs no longer claim the runtime writer is placeholder-backed
