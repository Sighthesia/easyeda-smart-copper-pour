import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SMART_COPPER_POUR_EVENT_TOPIC } from '../../../src/application/smart-copper-pour-contract';
import { registerSmartCopperPourSelectionChangeSync } from '../../../src/infrastructure/lceda/selection-change-sync';

describe('registerSmartCopperPourSelectionChangeSync', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, 'info').mockImplementation(() => undefined);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test('publishes selectionChanged when selected primitive ids change', async () => {
		const publish = vi.fn();
		const selectionReader = {
			getAllSelectedPrimitives_PrimitiveId: vi
				.fn<() => Promise<unknown>>()
				.mockResolvedValueOnce([])
				.mockResolvedValueOnce(['pad-2', 'pad-1'])
				.mockResolvedValueOnce(['pad-2', 'pad-1']),
		};

		const sync = registerSmartCopperPourSelectionChangeSync({ publish, subscribe: vi.fn() }, selectionReader, 100);

		await vi.runAllTicks();
		expect(publish).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(100);
		expect(publish).toHaveBeenCalledTimes(1);
		expect(publish).toHaveBeenNthCalledWith(1, SMART_COPPER_POUR_EVENT_TOPIC, { type: 'selectionChanged' });

		await vi.advanceTimersByTimeAsync(100);
		expect(publish).toHaveBeenCalledTimes(1);

		sync.dispose();
	});

	test('publishes selectionChanged after a PCB event listener observes activity', async () => {
		const publish = vi.fn();
		const selectionReader = {
			getAllSelectedPrimitives_PrimitiveId: vi.fn<() => Promise<unknown>>().mockResolvedValueOnce([]).mockResolvedValueOnce(['pad-1']),
		};
		let mouseEventHandler: ((...args: unknown[]) => void) | undefined;
		const pcbEventBridge = {
			addMouseEventListener: vi.fn((_id: string, _eventType: string, callback: (...args: unknown[]) => void) => {
				mouseEventHandler = callback;
			}),
			addPrimitiveEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			isEventListenerAlreadyExist: vi.fn().mockReturnValue(false),
		};

		const sync = registerSmartCopperPourSelectionChangeSync({ publish, subscribe: vi.fn() }, selectionReader, 1000, pcbEventBridge);

		await vi.runAllTicks();
		mouseEventHandler?.('selected', []);
		await vi.advanceTimersByTimeAsync(60);

		expect(publish).toHaveBeenCalledTimes(1);
		expect(publish).toHaveBeenNthCalledWith(1, SMART_COPPER_POUR_EVENT_TOPIC, { type: 'selectionChanged' });

		sync.dispose();
	});

	test('does not republish when primitive id ordering changes without selection changes', async () => {
		const publish = vi.fn();
		const selectionReader = {
			getAllSelectedPrimitives_PrimitiveId: vi
				.fn<() => Promise<unknown>>()
				.mockResolvedValueOnce(['pad-1', 'pad-2'])
				.mockResolvedValueOnce(['pad-2', 'pad-1'])
				.mockResolvedValueOnce(['pad-1', 'pad-2']),
		};

		const sync = registerSmartCopperPourSelectionChangeSync({ publish, subscribe: vi.fn() }, selectionReader, 100);

		await vi.runAllTicks();
		await vi.advanceTimersByTimeAsync(200);

		expect(publish).not.toHaveBeenCalled();

		sync.dispose();
	});

	test('stops polling after dispose', async () => {
		const publish = vi.fn();
		const selectionReader = {
			getAllSelectedPrimitives_PrimitiveId: vi.fn<() => Promise<unknown>>().mockResolvedValueOnce([]).mockResolvedValue(['pad-1']),
		};

		const sync = registerSmartCopperPourSelectionChangeSync({ publish, subscribe: vi.fn() }, selectionReader, 100);

		await vi.runAllTicks();
		sync.dispose();
		await vi.advanceTimersByTimeAsync(300);

		expect(publish).not.toHaveBeenCalled();
	});

	test('removes registered PCB event listeners on dispose', async () => {
		const publish = vi.fn();
		const selectionReader = {
			getAllSelectedPrimitives_PrimitiveId: vi.fn<() => Promise<unknown>>().mockResolvedValue([]),
		};
		const pcbEventBridge = {
			addMouseEventListener: vi.fn(),
			addPrimitiveEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			isEventListenerAlreadyExist: vi.fn().mockReturnValue(false),
		};

		const sync = registerSmartCopperPourSelectionChangeSync({ publish, subscribe: vi.fn() }, selectionReader, 100, pcbEventBridge);

		await vi.runAllTicks();
		sync.dispose();

		expect(pcbEventBridge.removeEventListener).toHaveBeenCalledWith('smart-copper-pour-selection-mouse');
		expect(pcbEventBridge.removeEventListener).toHaveBeenCalledWith('smart-copper-pour-selection-primitive');
	});
});
