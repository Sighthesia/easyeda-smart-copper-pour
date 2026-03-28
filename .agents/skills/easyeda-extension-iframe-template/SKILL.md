---
name: easyeda-extension-iframe-template
description: Use when creating a new EasyEDA extension from a proven menu plus registerFn plus IFrame template, especially when you want a copyable host entry, iframe page structure, and direct eda API usage pattern inspired by the generate-silkscreen demo extension.
---

# EasyEDA Extension IFrame Template

Build a new EasyEDA extension from a proven template: `extension.json` menu wiring, thin host entry, `sys_IFrame.openIFrame(...)`, and page-side direct `eda` API usage.

This skill is based on reusable patterns from the `easyeda/eext-generate-silkscreen` demo extension.

## When to Use

Use this skill when the user wants to:

- Start a new EasyEDA extension quickly
- Copy a working `headerMenus + registerFn + IFrame` skeleton
- Build a custom page UI under `/iframe/`
- Follow an example extension instead of designing the structure from scratch
- Separate reusable extension scaffolding from feature-specific business logic

Do not use this skill for exact API lookup.

- Use `easyeda-api` for class and method signatures
- Use `easyeda-extension-manifest` for deeper `extension.json` rules
- Use `easyeda-extension-debugging` for debug mode and recovery flow
- Use `easyeda-extension-iframe-communication` for architecture decisions about direct API versus message bus

## What This Template Is Good At

The reference demo is most useful as a skeleton for:

- Menu registration
- Host entry export shape
- Opening one or more IFrame pages
- Organizing `iframe/` static assets
- Letting the page directly call `eda` APIs
- Remembering small UI state with local storage

The reference demo is not mainly useful for:

- Its silkscreen algorithm
- Its field names and business copy
- Its exact window sizes
- Old experimental pages not wired into menus

## Template Architecture

Use this mental model:

- `extension.json` defines what the user can click
- `src/index.ts` exports what EasyEDA actually calls
- `eda.sys_IFrame.openIFrame(...)` opens the custom page
- `iframe/*.html` loads the UI shell
- Page script uses `eda` directly for business actions

This is the simplest proven pattern when the page itself can safely own the interaction flow.

## Minimal File Layout

Recommended starting layout:

```text
extension.json
src/
  index.ts
iframe/
  index.html
  css/
  js/
  icon/
```

If the repo already uses TypeScript build tooling, prefer:

```text
src/
  index.ts
  iframe/
    index.ts
iframe/
  index.html
  index.css
```

Use the first layout for ultra-thin examples.
Use the second layout when page logic is large enough to deserve compilation and modules.

## `extension.json` Template

Use a menu group plus action items.

```json
{
	"entry": "./dist/index",
	"headerMenus": {
		"pcb": [
			{
				"id": "MyTool",
				"title": "My Tool",
				"menuItems": [
					{
						"id": "open_my_tool",
						"title": "Open My Tool...",
						"registerFn": "openMyTool"
					}
				]
			}
		]
	}
}
```

Template rules:

- One menu group can contain multiple related actions
- Each leaf item maps to one named export in `src/index.ts`
- Keep menu labels business-facing and export names implementation-facing
- Prefer one feature family per menu group

## Host Entry Template

Keep the host entry thin.

```ts
export function activate(): void {}

export function openMyTool(): void {
	void eda.sys_IFrame.openIFrame('/iframe/index.html', 900, 640, 'my-tool-window');
}
```

Recommended host responsibilities:

- Export `registerFn` targets
- Open the correct page
- Keep window IDs stable
- Avoid putting large business logic in the entry file

If multiple pages exist, use one exported function per page or workflow.

## Better Window Pattern

Prefer `showIFrame` first, then `openIFrame`.

```ts
const WINDOW_ID = 'my-tool-window';

export async function openMyTool(): Promise<void> {
	const shown = await eda.sys_IFrame.showIFrame(WINDOW_ID);
	if (shown) return;

	await eda.sys_IFrame.openIFrame('/iframe/index.html', 900, 640, WINDOW_ID, {
		title: 'My Tool',
		maximizeButton: true,
		minimizeButton: true,
	});
}
```

Why this should be the default:

- Avoids duplicate windows
- Keeps one stable panel identity
- Makes testing easier
- Matches the stronger pattern we used in this repository

## IFrame Page Template

Use a simple HTML shell.

```html
<!doctype html>
<html lang="zh-Hans">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>My Tool</title>
		<link rel="stylesheet" href="/iframe/index.css" />
	</head>
	<body>
		<div id="app"></div>
		<script src="/dist/iframe.js"></script>
	</body>
</html>
```

Rules:

- Keep the HTML page as a shell, not a logic dump
- Put large logic in compiled TS or dedicated JS modules
- Reference assets with package-root paths such as `/iframe/...` or `/dist/...`

## Page-Side Direct API Pattern

The reference demo mostly uses direct `eda` access from the page.

Use this when:

- The page is the main interaction surface
- The API calls naturally belong to that flow
- A message bus would only add indirection

Minimal pattern:

```ts
function requireEda(): typeof eda {
	if (!globalThis.eda) {
		throw new Error('EasyEDA API is unavailable in current page runtime');
	}

	return globalThis.eda;
}

async function runAction(): Promise<void> {
	const api = requireEda();
	api.sys_Message.showToastMessage('Running');
}
```

Recommended page responsibilities:

- Read UI state
- Call EasyEDA APIs
- Render results and feedback
- Persist small preferences locally

## Local UI State Pattern

The reference demo uses browser-side persistence for small preferences.

Good fit:

- Last used form values
- Preferred mode or filter
- Last selected option

Minimal pattern:

```ts
const STORAGE_KEY = 'my-tool:form';

function loadState() {
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : { mode: 'default' };
}

function saveState(value: unknown): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}
```

Do not use this for large project data that should live in EasyEDA extension storage or domain models.

## Event-Driven Page Pattern

The reference demo is not just a form submit page. It also reacts to EDA state and selection.

Common pattern:

- Read current selection
- Register EDA event listener
- Update page UI when editor state changes
- Clean up listeners when needed

Use this pattern when the page should feel live and editor-aware.

## What To Copy vs What Not To Copy

### Copy These

- `headerMenus` group plus item structure
- Thin named exports in host entry
- `openIFrame`-based page launch
- Static assets under `/iframe/`
- Direct page-side `eda` access when no bus is needed
- Small page preferences in local storage

### Rewrite These

- Business labels
- Form schema
- Window dimensions
- Validation rules
- Action workflow
- Domain logic and algorithms

### Do Not Copy Blindly

- Old unused pages
- Experimental scripts not referenced by menus
- Demo-specific field naming
- Business rules hidden inside UI code

## Anti-Patterns

- Making `src/index.ts` a giant business file
- Copying demo algorithms when only the extension shell is needed
- Hard-coding many unrelated actions into one HTML page
- Mixing old sample pages with real product pages
- Using message bus for a page that can already call APIs directly
- Treating the demo's exact layout as universally correct

## Build Upgrade Path

If the demo-style static JS page grows too large, upgrade it like this:

1. Move page logic from `iframe/js/*.js` into `src/iframe/*.ts`
2. Add an iframe bundle entry in build config
3. Keep `iframe/index.html` as the static shell
4. Load `/dist/iframe.js` from HTML

This is the right move when:

- The page has multiple modules
- You want shared types
- You want easier refactoring and review
- The extension is no longer a tiny demo

## Standard Answer Shape

When a user asks for a demo-like EasyEDA extension template, answer in this order:

1. Give the minimal file layout
2. Give the `extension.json` menu example
3. Give the host `registerFn` export example
4. Give the IFrame opening snippet
5. Give the page-side direct `eda` pattern
6. Explain what parts are template and what parts are business-specific

## Related Skills

- Use `easyeda-extension-manifest` for manifest validation
- Use `easyeda-extension-iframe-communication` for architecture tradeoffs
- Use `easyeda-extension-debugging` for debug workflow and safety mode
- Use `easyeda-api` for exact API references
