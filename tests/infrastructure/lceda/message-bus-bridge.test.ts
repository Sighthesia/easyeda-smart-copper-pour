import { beforeEach, describe, expect, test, vi } from 'vitest';

import { SMART_COPPER_POUR_RESPONSE_TOPIC } from '../../../src/application/smart-copper-pour-contract';
import { registerSmartCopperPourMessageBusBridge } from '../../../src/infrastructure/lceda/message-bus-bridge';
import { TopologyMode } from '../../../src/domain/topology-mode';

const publish = vi.fn();

vi.stubGlobal('eda', {
	sys_MessageBus: {
		publish,
	},
});

describe('registerSmartCopperPourMessageBusBridge', () => {
	beforeEach(() => {
		publish.mockReset();
	});

	test('subscribes to request messages and publishes controller responses', async () => {
		let requestHandler: ((message: unknown) => void) | undefined;
		const cancel = vi.fn();
		const subscribe = vi.fn((_topic: string, handler: (message: unknown) => void) => {
			requestHandler = handler;
			return { cancel };
		});
 		const bridgeMessageBus = { subscribe, publish };

		registerSmartCopperPourMessageBusBridge(
			{
				inspectSelection: async () => ({ connectionCount: 2, netName: 'VCC', layerName: 'TopLayer', selectionFingerprint: 'selection-1' }),
				preview: async () => ({ previewToken: 'preview-1' }),
				apply: async () => ({ applied: true }),
				clearPreview: async () => ({ cleared: true }),
			},
			bridgeMessageBus,
		);

		expect(subscribe).toHaveBeenCalledOnce();
		requestHandler?.({
			command: 'preview',
			payload: {
				topologyMode: TopologyMode.Tree,
				width: 1,
				keepoutMargin: 0.2,
			},
		});
		await vi.waitFor(() => {
			expect(publish).toHaveBeenCalledWith(SMART_COPPER_POUR_RESPONSE_TOPIC, {
				ok: true,
				command: 'preview',
				payload: { previewToken: 'preview-1' },
			});
		});
	});

	test('preserves meta.sequence across bridge request and response', async () => {
		let requestHandler: ((message: unknown) => void) | undefined;
		const subscribe = vi.fn((_topic: string, handler: (message: unknown) => void) => {
			requestHandler = handler;
			return { cancel: vi.fn() };
		});
		const bridgeMessageBus = { subscribe, publish };

		registerSmartCopperPourMessageBusBridge(
			{
				inspectSelection: async () => ({ connectionCount: 2, netName: 'VCC', layerName: 'TopLayer', selectionFingerprint: 'selection-1' }),
				preview: async () => ({ previewToken: 'preview-1' }),
				apply: async () => ({ applied: true }),
				clearPreview: async () => ({ cleared: true }),
			},
			bridgeMessageBus,
		);

		requestHandler?.({
			command: 'inspectSelection',
			meta: { sequence: 42 },
		});

		await vi.waitFor(() => {
			expect(publish).toHaveBeenCalledWith(SMART_COPPER_POUR_RESPONSE_TOPIC, {
				ok: true,
				command: 'inspectSelection',
				payload: { connectionCount: 2, netName: 'VCC', layerName: 'TopLayer', selectionFingerprint: 'selection-1' },
				meta: { sequence: 42 },
			});
		});
	});

	test('ignores invalid request payloads from the iframe bus', async () => {
		let requestHandler: ((message: unknown) => void) | undefined;
		const subscribe = vi.fn((_topic: string, handler: (message: unknown) => void) => {
			requestHandler = handler;
			return { cancel: vi.fn() };
		});
 		const bridgeMessageBus = { subscribe, publish };

		registerSmartCopperPourMessageBusBridge(
			{
				inspectSelection: async () => ({ connectionCount: 2, netName: 'VCC', layerName: 'TopLayer', selectionFingerprint: 'selection-1' }),
				preview: async () => ({ previewToken: 'preview-1' }),
				apply: async () => ({ applied: true }),
				clearPreview: async () => ({ cleared: true }),
			},
			bridgeMessageBus,
		);

		requestHandler?.({
			command: 'preview',
			payload: {
				topologyMode: TopologyMode.Tree,
				width: Number.NaN,
				keepoutMargin: 0.2,
			},
		});
		await vi.waitFor(() => {
			expect(publish).not.toHaveBeenCalled();
		});
	});

	test('publishes failure responses when the controller rejects a request', async () => {
		let requestHandler: ((message: unknown) => void) | undefined;
		const subscribe = vi.fn((_topic: string, handler: (message: unknown) => void) => {
			requestHandler = handler;
			return { cancel: vi.fn() };
		});
		const bridgeMessageBus = { subscribe, publish };

		registerSmartCopperPourMessageBusBridge(
			{
				inspectSelection: async () => {
					throw new Error('selection failed');
				},
				preview: async () => ({ previewToken: 'preview-1' }),
				apply: async () => ({ applied: true }),
				clearPreview: async () => ({ cleared: true }),
			},
			bridgeMessageBus,
		);

		requestHandler?.({ command: 'inspectSelection' });

		await vi.waitFor(() => {
			expect(publish).toHaveBeenCalledWith(SMART_COPPER_POUR_RESPONSE_TOPIC, {
				ok: false,
				command: 'inspectSelection',
				error: {
					code: 'runtime-error',
					message: 'selection failed',
				},
			});
		});
	});

	test('returns a disposable bridge that cancels the subscription', () => {
		const cancel = vi.fn();
		const subscribe = vi.fn((_topic: string, _handler: (message: unknown) => void) => ({ cancel }));
 		const bridgeMessageBus = { subscribe, publish };

		const bridge = registerSmartCopperPourMessageBusBridge(
			{
				inspectSelection: async () => ({ connectionCount: 2, netName: 'VCC', layerName: 'TopLayer', selectionFingerprint: 'selection-1' }),
				preview: async () => ({ previewToken: 'preview-1' }),
				apply: async () => ({ applied: true }),
				clearPreview: async () => ({ cleared: true }),
			},
			bridgeMessageBus,
		);

		bridge.dispose();

		expect(cancel).toHaveBeenCalledOnce();
	});
});
