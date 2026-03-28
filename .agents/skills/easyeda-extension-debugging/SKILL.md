---
name: easyeda-extension-debugging
description: Use when debugging 嘉立创EDA extensions, using the runtime eda object, testing logic with independent scripts, loading IFrame windows, recovering from broken extensions, or explaining API stability rules.
---

# EasyEDA Extension Debugging

This skill focuses on extension runtime behavior, debug entry points, IFrame windows, failure recovery, and API stability. Use `easyeda-api` for detailed API references.

## Pick the Right Environment

| Goal                                                   | Best choice                    | Why                                            |
| ------------------------------------------------------ | ------------------------------ | ---------------------------------------------- |
| Verify menu wiring, packaging, `registerFn`, or IFrame | Real extension runtime         | These depend on packaged extension behavior    |
| Try pure API logic quickly                             | Independent script             | Faster than rebuild and upload                 |
| Build a custom window                                  | IFrame inside a real extension | UI assets and extension resources are involved |

## Runtime Map

| Context            | What it is good for                 | Important limit                                |
| ------------------ | ----------------------------------- | ---------------------------------------------- |
| Extension runtime  | Real packaged behavior              | Requires build + upload cycle                  |
| Independent script | Fast logic experiments              | Some APIs such as `SYS_IFrame` are unavailable |
| IFrame window      | Fully custom UI inside an extension | Resource loading is not recursive              |

Think of this as workshop mode versus showroom mode: independent scripts are the workbench for quick experiments, while packaged extensions are the real shipped product.

## `eda` Access Rules

- Every extension runtime gets its own `eda` object
- Independent scripts also get a fresh `eda` object each run
- Access pattern is `eda` + instantiated object name + method or property
- Class instance names use the prefix before `_`, lowercased, for example `SYS_I18n` -> `sys_I18n`

Example:

```ts
eda.sys_ToastMessage.showMessage(eda.sys_I18n.text('Done'), ESYS_ToastMessageType.INFO);
```

## Debug Entry Points

### Extension Debug Flow

1. Build and upload the extension package
2. Open the editor with `cll=debug`
3. Open DevTools with `F12`
4. Trigger the target menu action or runtime path
5. Inspect `Console` first, then verify the expected extension behavior

Browser editor debug mode:

```text
https://pro.lceda.cn/editor?cll=debug
```

- Open DevTools with `F12`
- On newer builds you may need to press `F12` three times quickly

Client debug mode:

```js
window.location.href = 'https://client/editor?cll=debug';
```

## Independent Scripts

Use independent scripts when you want to test logic without rebuilding the full extension package.

- V2 entry: `顶部菜单 -> 设置 -> 扩展 -> 独立脚本`
- V3 entry: `顶部菜单 -> 高级 -> 运行脚本`
- Script storage lives in browser storage such as `LocalStorage` or `IndexedDB`
- Treat saved scripts as unsafe local data and back them up yourself
- Treat this as a logic sandbox, not a full extension simulator

Common limit:

- Do not expect extension-only APIs such as `SYS_IFrame` to work inside an independent script

### Script Debug Flow

1. Enter the independent script panel in V2 or V3
2. Paste only the logic you want to validate
3. Log or inspect the fresh `eda` object when needed
4. Move back to a packaged extension once the feature depends on menus, assets, exports, or IFrame

## IFrame Rules

Recommended structure:

- Put IFrame assets under `/iframe/`
- Load them with `eda.sys_IFrame.openIFrame('/iframe/index.html', 500, 500)`
- The HTML path is resolved from the extension package root
- Associated files can be discovered from the HTML entry, but nested recursive parsing is blocked by resource access rules
- If one extension opens multiple IFrame windows, assign an ID to each one

Use IFrame when built-in dialogs are too constrained and you need a fully custom window.

### IFrame Debug Flow

1. Start the editor in debug mode
2. Trigger `eda.sys_IFrame.openIFrame(...)` from the real extension runtime
3. Confirm the HTML path is package-root relative, usually under `/iframe/`
4. If assets fail to load, check whether the missing file is only reachable through deeper recursive references
5. If multiple windows are involved, give each IFrame an ID and test them one by one

## Recovery Mode

If a broken extension corrupts menus, covers the UI, or prevents uninstall, disable extensions and scripts globally with:

```text
https://pro.lceda.cn/editor?safetyMode=true
```

Client entry:

```js
window.location.href = 'https://client/editor?safetyMode=true';
```

Need both safety mode and debugging:

```text
https://pro.lceda.cn/editor?safetyMode=true&cll=debug
```

This is a safe startup mode, not a permanent platform setting. Use it to regain control, remove or repair the broken extension, then reopen the editor normally.

## API Stability

- `major`: breaking API changes or changed behavior that may require extension updates
- `minor`: new APIs and most bug fixes; extensions on newer 嘉立创EDA builds can use them automatically
- `patch`: urgent fixes, tiny changes, and documentation updates
- Development-stage APIs are only available to extensions configured as development versions

Business value: this versioning model tries to balance fast feature delivery with extension reliability, so published extensions do not break every time the editor evolves.

## Common Mistakes

- Debugging packaged extension issues only with independent scripts and forgetting the runtime differences
- Expecting `SYS_IFrame` to run from independent scripts
- Assuming `eda` is shared across runs
- Forgetting `safetyMode=true` when a bad extension blocks the normal uninstall path
- Treating patch-level type updates as runtime breaking changes by default

## Related Skills

- Use `easyeda-extension-manifest` for `extension.json`, `headerMenus`, and `registerFn`
- Use `easyeda-api` for API classes, enums, interfaces, and bridge-based execution
