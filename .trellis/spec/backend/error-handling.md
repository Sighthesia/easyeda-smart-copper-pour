# Error Handling

> How errors are handled in this project.

---

## Overview

Errors are handled at layer boundaries, not through a large shared exception framework.

- Validate user-facing requests at application and message boundaries
- Throw explicit `Error` objects in runtime adapters when EasyEDA state is invalid or unusable
- Return consistent failure envelopes on the message bus
- Surface failures to the iframe as readable status text or stable failure payloads

There is no HTTP error middleware because there are **no** HTTP routes in this repository.

---

## Error Types

The project mostly uses two shapes:

- Typed validation-style objects with `code` and `message` for request validation failures
- Standard `Error` instances for runtime adapter failures

Examples:

- `src/application/smart-copper-pour-controller.ts` rejects invalid widths, keepout margins, and daisy-chain trunk inputs
- `src/infrastructure/lceda/runtime-copper-plan-builder.ts` throws for unsupported topology modes and invalid manual trunk points
- `src/infrastructure/lceda/selection-inspector.ts` throws when required EasyEDA runtime APIs are unavailable

---

## Error Handling Patterns

- Validate early before calling infrastructure code
- Let lower-level runtime adapters throw when they cannot recover safely
- Convert thrown failures into a transport-safe envelope at the dispatcher boundary
- Prefer clear messages over silent fallback behavior

Examples:

- `src/application/smart-copper-pour-contract.ts` uses type guards to reject malformed iframe messages before dispatch
- `src/infrastructure/lceda/message-bus-bridge.ts` ignores invalid request messages instead of trying to coerce them
- `tests/application/smart-copper-pour-controller.test.ts` asserts exact validation error codes and messages

---

## API Error Responses

There is no HTTP API response format. The equivalent contract is the iframe message-bus failure envelope.

Current shape:

```ts
{
	ok: false,
	command: 'preview' | 'apply' | 'inspectSelection' | 'clearPreview',
	error: {
		code: string,
		message: string,
		details?: string,
	},
}
```

Examples:

- `src/application/smart-copper-pour-contract.ts` defines `SmartCopperPourFailureMessage`
- `tests/infrastructure/lceda/message-bus-bridge.test.ts` verifies failed controller calls publish `{ ok: false, error: ... }`
- `iframe/app.js` reads `message.error?.message` and updates the status panel

---

## Common Mistakes

- Do not swallow EasyEDA runtime failures and continue with partial state
- Do not invent fallback success results when preview/apply cannot proceed
- Do not return inconsistent error shapes across message-bus commands
- Do not rely on logging for user feedback; the current UX expects message text in iframe state
