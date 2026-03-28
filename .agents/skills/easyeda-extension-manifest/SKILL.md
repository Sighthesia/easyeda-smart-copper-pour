---
name: easyeda-extension-manifest
description: Use when creating or reviewing a 嘉立创EDA extension manifest, writing extension.json, configuring headerMenus, or wiring registerFn exports for EasyEDA extensions.
---

# EasyEDA Extension Manifest

Create and validate `extension.json` for 嘉立创EDA / EasyEDA extensions.

## When to Use

- Writing a new extension package
- Generating or reviewing `extension.json`
- Configuring `headerMenus`, `menuItems`, or `registerFn`
- Explaining manifest fields, constraints, or page keys

## Default Template

Use `default-extension.json` in this skill directory as the SDK starter template.

All example names, UUIDs, titles, URLs, and publisher values in the template are placeholders unless the user explicitly wants the SDK sample values.

Key rules:

| Field        | Rule                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| `name`       | `a-z`, `0-9`, `-` only, length `5-30`                                      |
| `uuid`       | 32 chars, lowercase letters and digits only                                |
| `version`    | Semantic version, `major.minor.patch`                                      |
| `categories` | `Schematic` `Symbol` `PCB` `Footprint` `Panel` `Library` `Project` `Other` |
| `entry`      | Keep SDK default unless there is a strong reason to change it              |

Common field reminders:

- `displayName`: human-readable store name
- `keywords`: short discovery terms for the extension store
- `activationEvents`: upstream feature area, still marked in-progress in current docs
- `dependentExtensions`: accepts store UUIDs or custom extension names

## `headerMenus` Quick Reference

Supported page keys in current docs:

```json
{
	"headerMenus": {
		"home": [],
		"blank": [],
		"schematic": [],
		"symbol": [],
		"pcb": [],
		"footprint": [],
		"pcbView": [],
		"panel": [],
		"panelView": []
	}
}
```

Important constraints:

- `headerMenus[].id` must be unique
- `menuItems` and `registerFn` are mutually exclusive at the same level
- Menu nesting is limited to two levels
- Prefer `schematic`; `sch` is deprecated

Node shapes:

| Node type   | Required fields             | Use for                                  |
| ----------- | --------------------------- | ---------------------------------------- |
| Menu group  | `id`, `title`, `menuItems`  | Parent node that opens a submenu         |
| Action item | `id`, `title`, `registerFn` | Clickable leaf that calls extension code |

If a node has children, it should behave like a folder. If it triggers code, it should behave like a button. Do not try to make one node be both.

Answer conservatively when the docs are silent:

- Treat the page key list above as the current documented set
- Prefer submenu groups because that is the clearest documented pattern
- If asked whether top-level direct action items are supported, say they may be possible in the type system but submenu grouping is the safer documented configuration

## `registerFn` Mapping

`registerFn` must point to an exported ES module function from the extension code.

Resolution rules:

- Export the function from the module resolved by `entry`
- Match the exported name exactly
- Prefer named exports for clarity
- Do not assume a default export will be resolved as `registerFn` unless you have verified it in your runtime

Example:

```json
{
	"id": "About",
	"title": "About...",
	"registerFn": "about"
}
```

```ts
export function about() {
	// implementation lives in the extension entry bundle
}
```

Minimal pairable example:

```json
{
	"name": "demo-extension",
	"uuid": "0123456789abcdef0123456789abcdef",
	"displayName": "Demo Extension",
	"description": "Minimal example for header menu wiring",
	"version": "1.0.0",
	"publisher": "Example <dev@example.com>",
	"engines": { "eda": "^2.3.0" },
	"license": "Apache-2.0",
	"categories": "Other",
	"keywords": ["demo"],
	"images": { "logo": "./images/logo.png" },
	"homepage": "https://example.com",
	"bugs": "https://example.com/issues",
	"activationEvents": {},
	"entry": "./dist/index",
	"dependentExtensions": {},
	"headerMenus": {
		"home": [
			{
				"id": "Demo",
				"title": "Demo",
				"menuItems": [
					{
						"id": "About",
						"title": "About...",
						"registerFn": "about"
					}
				]
			}
		]
	}
}
```

```ts
export function about() {
	return true;
}
```

Think of `extension.json` as the restaurant menu, and `registerFn` as the kitchen ticket. The menu shows what can be clicked; the exported function is what actually gets cooked when the user clicks it.

## Standard Answer Shape

When a user asks how to configure `extension.json`, answer in this order:

1. Give a copyable manifest example
2. Explain `headerMenus` as menu structure
3. Explain `registerFn` as the exact exported function name from the `entry` bundle
4. Call out `schematic` over deprecated `sch`
5. End with the first things to check if the menu does not appear or does nothing

## Field Notes

- `engines.eda`: declares the supported 嘉立创EDA version range
- `repository`: source hosting metadata; some values are still marked as in-progress upstream
- `dependentExtensions`: accepts store UUIDs or custom extension names
- `images.logo`: use square PNG/JPEG; larger source assets are safer for store display
- `bugs`: must be a valid URI

## Why It Does Not Work

Check these first when a menu item does not appear or does nothing:

- Wrong page key, especially using deprecated `sch`
- `registerFn` name does not match the exported symbol exactly
- `entry` bundle does not actually export the target function
- One node mixes `menuItems` and `registerFn`
- Duplicate menu `id` values causing collisions

## Common Mistakes

- Using `sch` in new manifests instead of `schematic`
- Putting both `menuItems` and `registerFn` on one menu node
- Treating `registerFn` as a global function name instead of an exported symbol
- Hand-editing `entry` away from the SDK default without a real packaging reason
- Forgetting that `uuid` is not a dashed UUID format here

## Related Skills

- Use `easyeda-api` for API class and method lookup
- Use `easyeda-extension-debugging` for `eda` runtime, debug mode, independent scripts, IFrame, and recovery flow
