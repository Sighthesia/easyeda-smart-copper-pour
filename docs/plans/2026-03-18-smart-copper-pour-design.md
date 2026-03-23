# Smart Copper Pour Design

## Goal

Build an LCEDA PRO extension that turns selected power pads into editable copper shapes and routing backbones. The product roadmap contains three operator-facing modes:

1. Star or tree-style one-click copper generation from selected pads.
2. Trunk-constrained tree or daisy-chain routing from a start point to an end edge.
3. Width expansion that grows copper coverage until nearby layout constraints are reached.

## Business Framing

The extension should behave like a "smart stencil cutter": the user picks a few pads, chooses a topology, previews the copper footprint, and applies it in one step. The value is not a full autorouter; the value is fast, repeatable power copper construction for common layout patterns.

## Feasibility Assessment

### Confirmed API Capabilities

- Selected primitives can be read through `PCB_SelectControl.getAllSelectedPrimitives()`.
- Pad coordinates, net, layer, and geometry can be read from `IPCB_PrimitivePad` getters.
- Existing same-net primitives can be enumerated with `PCB_Net.getAllPrimitivesByNet()`.
- Geometry objects can be created with `PCB_PrimitiveLine.create()`, `PCB_PrimitivePolyline.create()`, and `PCB_PrimitiveArc.create()`.
- Polygon-like copper objects can be created with `PCB_PrimitivePour.create()` and `PCB_PrimitiveRegion.create()`.
- Polygon data can be assembled with `PCB_MathPolygon.createPolygon()`.
- Settings and preview UI can be hosted in `SYS_IFrame.openIFrame()` and coordinated through `SYS_MessageBus`.

### Confirmed Gaps

- There is no built-in star, tree, or daisy autorouter.
- There is no public repour solver we can trigger after supplying only intent.
- Clearance-aware path search is not provided as a ready-made service.
- Net context must be inferred from selection rather than read as a single active-net value.

### Practical Conclusion

V1 is feasible if the extension owns the topology algorithm and polygon generation pipeline. In plain terms: the API gives us the pen and the paper, but not the drafting assistant. We must compute the backbone ourselves, then write the resulting copper geometry into the board.

## Product Scope

### V1 In Scope

- Select multiple pads on the same layer and same net.
- Generate a tree backbone with MST as default.
- Offer explicit star mode as an alternative.
- Preview result as `Region`.
- Apply result as `Pour`.
- Allow width, corner style, trunk bias, and keepout margin parameters.
- Support width expansion against nearby obstacles using iterative growth.

### V1 Out of Scope

- Differential routing.
- Multi-layer via stitching automation.
- Full maze routing around arbitrary obstacles.
- Thermal spoke generation customization.
- Interactive drag handles on-canvas.

### Post-V1 Scope

- Trunk-constrained tree or daisy-chain routing from a start point to an end edge.

## User Flows

### Flow A: Selected Pads to Smart Pour

1. User selects pads.
2. User opens `Smart Copper Pour` from PCB menu.
3. Extension validates that pads share one net and one layer.
4. UI shows pad count, inferred net, current defaults.
5. User chooses `Tree` or `Star`, width, and margin.
6. Extension computes centerline skeleton.
7. Extension offsets skeleton to polygon and writes a preview `Region`.
8. User clicks `Apply`.
9. Extension removes preview region and creates final `Pour`.

### Flow B: Trunk-Constrained Tree / Daisy Chain

1. User selects pads and provides a trunk start plus an end edge through UI parameters.
2. Extension builds a trunk polyline.
3. Pads are projected to the trunk.
4. Branches are attached in trunk order.
5. Preview and apply steps match Flow A.

### Flow C: Width Expansion

1. User previews a valid skeleton.
2. User clicks `Expand Width` or enables `Auto Expand`.
3. Extension grows offset distance in steps.
4. Each step checks overlap against obstacles and board constraints.
5. Largest safe polygon is kept.

## Architecture

### Design Principle

Split the system into four layers: input normalization, topology planning, geometry synthesis, and board writing. This keeps domain math independent from LCEDA API objects.

### Proposed Modules

#### Entry and Commands

- `src/index.ts`
  - Register PCB menu command.
  - Open iframe.
  - Bootstrap message bus handlers.

#### Application Layer

- `src/application/smart-copper-pour-controller.ts`
  - Orchestrate request lifecycle.
  - Expose commands: inspect selection, preview, apply, clear preview.

- `src/application/smart-copper-pour-contract.ts`
  - Define request and response DTOs.

#### Domain Layer

- `src/domain/pad-node.ts`
  - Define normalized pad input.

- `src/domain/topology-mode.ts`
  - Enumerate `tree`, `star`, `daisyChain`.

- `src/domain/tree-backbone-planner.ts`
  - Produce MST-based skeleton.

- `src/domain/star-backbone-planner.ts`
  - Produce radial skeleton from computed or user-picked hub.

- `src/domain/daisy-chain-planner.ts`
  - Produce trunk plus ordered branch attachments.

- `src/domain/clearance-optimizer.ts`
  - Iterate width growth and collision checks.

- `src/domain/skeleton-types.ts`
  - Define point, segment, polyline, polygon, obstacle contracts.

#### Infrastructure Layer

- `src/infrastructure/lceda/selection-resolver.ts`
  - Convert selected LCEDA pads into domain `PadNode` values.

- `src/infrastructure/lceda/net-obstacle-resolver.ts`
  - Query nearby same-layer primitives and convert them into obstacle envelopes.

- `src/infrastructure/lceda/pour-writer.ts`
  - Create and delete preview region and final pour.

- `src/infrastructure/lceda/message-bus-bridge.ts`
  - Handle iframe communication.

- `src/infrastructure/geometry/polygon-offset-builder.ts`
  - Turn skeleton centerlines into copper polygons with Clipper.

- `src/infrastructure/geometry/polygon-boolean.ts`
  - Union branches and subtract exclusions.

#### UI Layer

- `iframe/index.html`
  - Lightweight control panel.

- `iframe/app.js` or bundled iframe script later if needed.
  - Form state, request dispatch, preview/apply actions.

## Core Data Model

```ts
type Point = { x: number; y: number };

type PadNode = {
	id: string;
	net: string;
	layer: string;
	center: Point;
	effectiveRadius: number;
};

type SkeletonSegment = {
	start: Point;
	end: Point;
	role: 'trunk' | 'branch';
};

type CopperPlan = {
	mode: 'tree' | 'star' | 'daisyChain';
	segments: SkeletonSegment[];
	outline: Point[];
	previewOnly: boolean;
};
```

The key idea is simple: first compute the road map, then inflate the roads into a copper riverbank.

## Topology Algorithms

### Tree Mode

- Build a complete graph from selected pads using Euclidean distance.
- Run minimum spanning tree.
- Optionally bias the cost function toward horizontal or vertical trunk preference later.
- Merge collinear or near-collinear edges to simplify the skeleton.

Why this default works: MST minimizes total branch length, so it behaves like using the least amount of "wire road" before widening into copper.

### Star Mode

- Determine hub point from either centroid or user-selected source pad.
- Connect each pad center to the hub.
- Optionally snap the hub to an existing pad center when source semantics matter.

Business tradeoff: star mode is electrically intuitive for power fan-out, but may consume more area than MST.

### Daisy-Chain / Trunk-Constrained Mode

- Accept a start point and an end edge definition.
- Construct a trunk line or polyline.
- Sort pads by projected distance along the trunk.
- Attach each pad with the shortest branch to the trunk.
- Preserve ordering to mimic current flow sequencing.

This is like a subway main line with short neighborhood walkways.

## Geometry Synthesis

### Library Choice

- Preferred: `js-angusj-clipper`.
- Fallback: `clipper-lib` if wasm packaging or LCEDA runtime loading becomes problematic.

### Pipeline

1. Convert skeleton segments to stroked polylines.
2. Offset each segment by half width plus margin rules.
3. Union all widened segments.
4. Add pad attachment bulges if needed to avoid necking at pad entry.
5. Subtract forbidden zones and failed expansion candidates.
6. Normalize polygon winding and remove tiny slivers.

### Corner Policy

- Default rounded joins for power copper.
- Miter joins only when user explicitly requests sharp corners.

Rounded corners reduce acute geometry artifacts and usually look closer to intentional copper pours.

## Width Expansion Strategy

### Inputs

- Initial width.
- Max width cap.
- Step increment.
- Obstacle margin.

### Iterative Loop

1. Build polygon at width `w`.
2. Expand obstacle envelopes by clearance margin.
3. Test for intersection.
4. If collision-free, store candidate and increment width.
5. If collided, stop or binary-search the last safe interval.

### Obstacle Sources

- Same-layer foreign-net tracks.
- Same-layer foreign-net pads.
- Existing pours or regions not on target net.
- Board edge or user-provided keepout polygon when exposed by API.

V1 should use conservative collision checks. Better to stop early than to create an unsafe copper spill.

## Preview and Apply Model

### Preview

- Write temporary `Region` objects.
- Tag created preview objects with extension-owned metadata if possible, otherwise keep an in-memory registry during the session.
- Clear stale preview before drawing a new one.

### Apply

- Delete preview region.
- Create final `Pour` with target net and layer.
- If pour creation fails, restore preview so the user does not lose visual context.

## Error Handling

### Validation Errors

- No pads selected.
- Mixed nets.
- Mixed layers.
- Fewer than two pads.
- Invalid trunk definition.

### Runtime Errors

- Geometry library unavailable.
- Polygon creation returns empty result.
- Pour creation API rejects outline.
- Message bus handshake fails.

### UX Rule

Every error should tell the user what to change, not only what failed. Example: "Selected pads span 2 nets; keep only one power net selected."

## Performance Expectations

- Typical pad count for V1 should be under 50.
- MST and offset operations are acceptable at that scale.
- Preview should feel near-instant for small selections and remain under one second for common power groups.

If performance degrades, simplify branches before offsetting and limit expansion iterations.

## File Layout Proposal

```text
src/
  index.ts
  application/
    smart-copper-pour-controller.ts
    smart-copper-pour-contract.ts
  domain/
    clearance-optimizer.ts
    daisy-chain-planner.ts
    pad-node.ts
    skeleton-types.ts
    star-backbone-planner.ts
    topology-mode.ts
    tree-backbone-planner.ts
  infrastructure/
    geometry/
      polygon-boolean.ts
      polygon-offset-builder.ts
    lceda/
      message-bus-bridge.ts
      net-obstacle-resolver.ts
      pour-writer.ts
      selection-resolver.ts
tests/
  domain/
  infrastructure/
docs/
  plans/
  superpowers/plans/
```

## Incremental Roadmap

### M1: Selection to Preview

- Menu command.
- Pad validation.
- MST backbone.
- Region preview.

### M2: Apply and UI Parameters

- Iframe controls.
- Apply to final pour.
- Star mode.

### M3: Width Expansion

- Obstacle extraction.
- Iterative width optimizer.
- Better status messages.

### M4: Trunk-Constrained Routing

- Start/end-edge inputs.
- Daisy-chain mode.
- Ordering visualization.

## Risks and Mitigations

- `PCB_PrimitivePour.create()` is marked beta.
  - Mitigation: keep `Region` fallback path available.
- Polygon validity may fail on self-intersection.
  - Mitigation: always union normalized offset paths before writing.
- Wasm library loading may not cooperate with bundling.
  - Mitigation: evaluate pure JS fallback before over-investing.
- Obstacle queries may be incomplete for some primitive types.
  - Mitigation: ship V1 with conservative supported obstacle set and document it.

## Recommendation

Proceed with a usable V1 centered on MST tree mode, preview via region, final apply via pour, and conservative width expansion. This gives the fastest path to business value while keeping the future door open for richer routing behavior.
