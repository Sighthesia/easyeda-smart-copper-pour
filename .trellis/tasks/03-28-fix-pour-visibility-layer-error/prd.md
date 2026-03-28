# Fix copper pour preview/apply visibility layer error

## Problem

When previewing or applying copper pours, the generated copper area is not visible and EasyEDA emits repeated runtime errors like:

`TypeError: can't access property "layer", yn.getInstance().getLayer(...) is undefined`

## Expected outcome

- Preview and apply both create visible copper objects on supported PCB copper layers.
- Unsupported or invalid layer selections fail early with a clear error.
- Runtime code never forwards an invalid layer id into EasyEDA `Region` or `Pour` creation APIs.

## Scope

- Inspect the selection -> layer mapping -> planner -> writer -> EasyEDA object store path.
- Fix the root cause for invalid layer ids during preview/apply.
- Add or update focused tests around layer validation and object creation.

## Acceptance criteria

- Supported layers continue to preview/apply normally.
- Invalid inner-layer ids are rejected before calling EasyEDA create APIs.
- Targeted infrastructure tests pass.
