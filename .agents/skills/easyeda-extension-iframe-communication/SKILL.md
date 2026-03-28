---
name: easyeda-extension-iframe-communication
description: Use when designing, implementing, or reviewing EasyEDA extensions that involve IFrame windows, cross-context communication, runtime eda access, resource packaging, and API invocation boundaries.
---

# EasyEDA Extension IFrame Communication

Design EasyEDA extension UI architecture with clear boundaries between host runtime, IFrame UI, communication, and API ownership.

## When to Use

Use this skill when the user asks about:

- Building an EasyEDA extension with an `IFrame` window
- Deciding between direct API calls and `sys_MessageBus`
- Organizing host-side code versus page-side code
- Debugging broken `IFrame` loading, missing `eda`, or unstable cross-context communication
- Reviewing whether an extension uses EasyEDA APIs in the correct runtime

Do not use this skill as the main API reference.

- Use `easyeda-api` for class, method, enum, and interface lookup
- Use `easyeda-extension-debugging` for debug mode, safety mode, and independent script workflow
- Use `easyeda-extension-manifest` for `extension.json`, `headerMenus`, and `registerFn`

## Core Model

Think of the extension as a shop:

- **Host runtime** is the back office that owns platform permissions and window lifecycle
- **IFrame** is the storefront UI that users interact with
- **Communication layer** is the counter between them

The main rule is simple:

- Put platform ownership in one place
- Make cross-boundary communication explicit
- Do not mix host concerns and UI concerns randomly

## When to Use IFrame

Choose `IFrame` when you need:

- A custom multi-section UI
- Long-lived interaction instead of one-shot commands
- Lists, filters, forms, tabs, or detail panels
- A browser-style page with CSS and richer DOM control

Do not choose `IFrame` when you only need:

- A toast
- A confirmation dialog
- A one-click command with no persistent UI
- A tiny settings prompt that fits built-in dialogs

Important limits:

- `SYS_IFrame` belongs to real extension runtime, not independent script runtime
- IFrame resources should live under `/iframe/`
- Resource loading should be explicit and shallow; do not rely on deep recursive discovery
- If you open multiple windows, give each one a stable `id`

## Direct API vs Message Bus

Choose the interaction model based on runtime boundaries, not personal preference.

### Prefer Direct API

Use direct API calls when:

- The logic already runs inside the correct EasyEDA runtime
- The page can safely call the needed API itself
- There is no real host/page separation requirement
- Adding a bus would only wrap a local function call in extra async noise

Good fit:

- Read current schematic context
- Save snapshots through existing shared use-cases
- Run in-memory diff logic
- Focus the current document after UI selection

### Prefer Message Bus

Use `sys_MessageBus` when:

- Host and page are intentionally separated
- The page must request the host to do privileged or centralized work
- Multiple modules or windows must coordinate through a stable protocol
- You need RPC-style request/response or event broadcasting across runtimes

Good fit:

- Centralized window manager or singleton host service
- Shared background task coordinator
- Multi-window orchestration
- Event notifications that multiple listeners consume

### Decision Rule

Use this order:

1. If one runtime can do the job safely, use direct API
2. If ownership must stay in host, use a thin bridge
3. If multiple parties coordinate, define a stable message contract

Do not introduce a bus just to make local calls look abstract.

## `eda` Access Rules

- `eda` is runtime-injected, not a generic global you own
- Do not assume `eda` is shared across all runtimes or all executions
- Use EasyEDA instance naming rules, for example `eda.sys_IFrame.openIFrame(...)`
- Re-check runtime assumptions whenever code moves between host, IFrame, and independent scripts

Recommended rule:

- Use the current runtime's `eda` first
- Treat cross-window `parent.eda` access as a compatibility fallback, not a core architecture guarantee

If your design only works because `parent.eda` happens to be reachable, the design is too fragile.

## Ownership Boundaries

Use one of these two models on purpose.

### Model A: Host Owns Platform, IFrame Owns UI

Best when:

- You want strict boundaries
- The IFrame should stay mostly view-focused
- Platform calls need centralized control

Pattern:

- Host opens the IFrame
- Host owns EasyEDA side effects
- IFrame sends commands through a thin bridge
- Responses return plain data and errors

### Model B: IFrame Directly Uses API

Best when:

- The IFrame and host effectively run in the same extension runtime boundary
- Existing domain/use-case modules can be reused directly
- Adding a message layer would only duplicate local code paths

Pattern:

- Host only opens the window
- IFrame imports shared logic and calls EasyEDA APIs directly
- Shared logic stays in reusable modules, not inline page scripts

### Avoid Hybrid Chaos

Avoid a design where:

- Some actions use direct API
- Some actions use message bus
- Some actions poke `parent.eda`
- No one can explain which path is the source of truth

Pick one primary path per feature.

## Recommended File Organization

Recommended structure:

```text
src/
  index.ts
  application/
    commands.ts
    panel/
      open-panel.ts
  iframe/
    index.ts
    panel-api.ts
    state.ts
    render-*.ts
iframe/
  index.html
  index.css
config/
  esbuild.common.ts
```

Recommended responsibilities:

- `src/index.ts`: exported `registerFn` entrypoints
- `src/application/panel/open-panel.ts`: `showIFrame` / `openIFrame` policy
- `src/iframe/index.ts`: page bootstrap and event binding
- `src/iframe/panel-api.ts`: page-facing façade over shared logic
- `iframe/index.html`: static shell only
- `config/esbuild.common.ts`: host bundle and IFrame bundle entries

Keep browser UI logic in `src/iframe/` and keep `/iframe/` as static assets and HTML entry.

## Build and Resource Rules

- Use a dedicated bundle entry for the IFrame page
- Output a file that HTML can reference directly, for example `/dist/iframe.js`
- Keep `iframe/index.html` stable and lightweight
- Do not scatter business logic across raw static `.js` files if the project already has TypeScript build infrastructure

Recommended flow:

```ts
const entryPoints = {
	index: './src/index',
	iframe: './src/iframe/index',
};
```

```html
<script src="/dist/iframe.js"></script>
```

This keeps runtime behavior predictable and keeps page logic reviewable in TypeScript.

## Window Lifecycle Pattern

Prefer this open pattern:

```ts
const shown = await eda.sys_IFrame.showIFrame(PANEL_ID);
if (!shown) {
	await eda.sys_IFrame.openIFrame('/iframe/index.html', 1200, 760, PANEL_ID, {
		title: 'My Panel',
		maximizeButton: true,
		minimizeButton: true,
	});
}
```

Why this is safer:

- Prevents duplicate windows
- Keeps one stable panel identity
- Makes manual testing and recovery easier

## Communication Contract Rules

If you do use `sys_MessageBus`, keep it thin and explicit.

Good contract shape:

- Command name
- Input payload
- Success result
- Error result
- Timeout expectation

Good patterns:

- Request/response for commands
- Publish/subscribe for events
- Stable topic names with a namespace
- Shared type definitions for both sides

Bad patterns:

- Ad-hoc string payloads
- Hidden side effects in bridge code
- Business state stored inside transport helpers
- Topic names duplicated manually across many files

## Anti-Patterns

- Testing `SYS_IFrame` behavior only inside independent scripts
- Relying on undocumented cross-window access as the primary architecture
- Putting all EasyEDA API calls directly inside HTML-inline scripts
- Duplicating domain logic in both host and IFrame
- Using message bus as a wrapper for simple local function calls
- Mixing window lifecycle, transport, and business logic in one file
- Opening multiple anonymous IFrames without stable IDs

## Debug and Validation Checklist

Check in this order:

1. Confirm you are in real extension runtime, not independent script mode
2. Confirm `iframe/index.html` path is package-root relative
3. Confirm the IFrame bundle is actually produced by build
4. Confirm `showIFrame` and `openIFrame` use the same stable `id`
5. Confirm `eda` exists in the expected runtime
6. Confirm direct calls or message topics follow one primary communication path
7. Confirm user actions complete the real business flow, not just UI rendering

Manual validation sequence:

- Open panel
- Refresh context
- Trigger one state-changing action
- Reload affected data
- Trigger one navigation or focus action
- Close and reopen panel

If the extension becomes broken or blocks the UI, use safety mode:

```text
https://pro.lceda.cn/editor?safetyMode=true
```

## Standard Answer Shape

When a user asks how to build an EasyEDA extension with an IFrame, answer in this order:

1. Decide whether the feature really needs `IFrame`
2. Decide direct API versus message bus based on runtime boundaries
3. State who owns platform API calls and who owns UI state
4. Give the file layout and build entry pattern
5. End with a debug and validation checklist

## Related Skills

- Use `easyeda-api` for exact API lookup
- Use `easyeda-extension-debugging` for debug mode and recovery flow
- Use `easyeda-extension-manifest` for `extension.json` and `registerFn`
