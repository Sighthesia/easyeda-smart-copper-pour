import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, test, vi } from 'vitest';

import { bootstrapIframeApp, createIframeApp, resolveSuccessStatus } from '../../iframe/app.js';

const createForm = () => {
	const values = {
		topologyMode: createField('tree'),
		cornerStyle: createField('bevel'),
		trunkBias: createField('neutral'),
		width: createField('1'),
		keepoutMargin: createField('0'),
		trunkStartX: createField('0'),
		trunkStartY: createField('0'),
		trunkEndX: createField('10'),
		trunkEndY: createField('0'),
	};

	return values;
};

class FakeElement extends EventTarget {
	hidden;
	textContent;
	dataset;
	value;
	topologyMode;
	cornerStyle;
	trunkBias;
	width;
	keepoutMargin;
	trunkStartX;
	trunkStartY;
	trunkEndX;
	trunkEndY;

	constructor() {
		super();
		this.hidden = false;
		this.textContent = '';
		this.dataset = {};
		this.value = '';
	}
}

function createField(value) {
	const field = new FakeElement();
	field.value = value;
	return field;
}

const createIframeDomHarness = () => {
	const form = new FakeElement();
	Object.assign(form, createForm());

	const previewButton = new FakeElement();
	const applyButton = new FakeElement();
	const clearButton = new FakeElement();
	const statusPanel = new FakeElement();
	const selectionNet = new FakeElement();
	const selectionLayer = new FakeElement();
	const selectionPadCount = new FakeElement();
	const daisyOnlyField = new FakeElement();

	const elements = new Map([
		['smart-copper-pour-form', form],
		['preview-button', previewButton],
		['apply-button', applyButton],
		['clear-button', clearButton],
		['status-panel', statusPanel],
		['selection-net', selectionNet],
		['selection-layer', selectionLayer],
		['selection-pad-count', selectionPadCount],
	]);

	const documentObject = {
		getElementById: (id) => elements.get(id) ?? null,
		querySelectorAll: (selector) => (selector === '[data-daisy-only]' ? [daisyOnlyField] : []),
	};

	let responseHandler;
	const messageBus = {
		publish: vi.fn(),
		subscribe: vi.fn((_topic, handler) => {
			responseHandler = handler;
			return {
				cancel: vi.fn(),
			};
		}),
	};

	/** @type {any} */
	const windowObject = new EventTarget();
	Object.assign(windowObject, {
		parent: {
			eda: {
				sys_MessageBus: messageBus,
			},
		},
	});

	return {
		applyButton,
		documentObject,
		form,
		messageBus,
		previewButton,
		responseHandler: () => responseHandler,
		selectionLayer,
		selectionNet,
		selectionPadCount,
		statusPanel,
		windowObject,
	};
};

const bootstrapHarness = (harness) => {
	bootstrapIframeApp({
		documentObject: /** @type {any} */ (harness.documentObject),
		windowObject: /** @type {any} */ (harness.windowObject),
	});
};

describe('createIframeApp', () => {
	test('creates shell API with readable state and form request', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		expect(app.getState).toBeTypeOf('function');
		expect(app.handleResponse).toBeTypeOf('function');
		expect(app.readFormRequest).toBeTypeOf('function');
			expect(app.readFormRequest()).toEqual({
				topologyMode: 'tree',
				cornerStyle: 'bevel',
				trunkBias: 'neutral',
				width: 1,
				keepoutMargin: 0,
		});
	});

	test('ignores stale inspectSelection responses by sequence', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		app.handleResponse({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 2,
			},
			payload: {
				connectionCount: 4,
				netName: 'NEW',
				layerName: 'TopLayer',
				selectionFingerprint: 'fingerprint-new',
			},
		});

		app.handleResponse({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 1,
			},
			payload: {
				connectionCount: 2,
				netName: 'OLD',
				layerName: 'BottomLayer',
				selectionFingerprint: 'fingerprint-old',
			},
		});

		expect(app.getState()).toMatchObject({
			latestInspectSequence: 2,
			selectionSummary: {
				connectionCount: 4,
				netName: 'NEW',
				layerName: 'TopLayer',
				selectionFingerprint: 'fingerprint-new',
			},
			selectionFingerprint: 'fingerprint-new',
		});
	});

	test('ignores inspectSelection success responses without a valid sequence', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		expect(
			app.handleResponse({
				command: 'inspectSelection',
				ok: true,
				payload: {
					connectionCount: 2,
					netName: 'VCC',
					layerName: 'TopLayer',
					selectionFingerprint: 'fingerprint-a',
				},
			}),
		).toBe(false);

		expect(
			app.handleResponse({
				command: 'inspectSelection',
				ok: true,
				meta: {
					sequence: Number.NaN,
				},
				payload: {
					connectionCount: 3,
					netName: 'GND',
					layerName: 'BottomLayer',
					selectionFingerprint: 'fingerprint-b',
				},
			}),
		).toBe(false);

		expect(app.getState()).toMatchObject({
			latestInspectSequence: 0,
			selectionFingerprint: null,
			selectionSummary: null,
		});
	});

	test('starts with latestInspectSequence and selectionFingerprint in state', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		expect(app.getState()).toMatchObject({
			latestInspectSequence: 0,
			selectionFingerprint: null,
		});
	});

	test('increments inspectSelection request sequence on the same instance', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		expect(app.createInspectSelectionRequest()).toEqual({
			command: 'inspectSelection',
			meta: {
				sequence: 1,
			},
		});

		expect(app.createInspectSelectionRequest()).toEqual({
			command: 'inspectSelection',
			meta: {
				sequence: 2,
			},
		});
	});

	test('deduplicates repeated inspectSelection responses with same sequence and fingerprint', () => {
		const app = createIframeApp({
			form: createForm(),
		});

		expect(
			app.handleResponse({
				command: 'inspectSelection',
				ok: true,
				meta: {
					sequence: 3,
				},
				payload: {
					connectionCount: 4,
					netName: 'NEW',
					layerName: 'TopLayer',
					selectionFingerprint: 'fingerprint-stable',
				},
			}),
		).toBe(true);

		expect(
			app.handleResponse({
				command: 'inspectSelection',
				ok: true,
				meta: {
					sequence: 3,
				},
				payload: {
					connectionCount: 99,
					netName: 'NOISE',
					layerName: 'Inner1',
					selectionFingerprint: 'fingerprint-stable',
				},
			}),
		).toBe(false);

		expect(app.getState()).toMatchObject({
			latestInspectSequence: 3,
			selectionFingerprint: 'fingerprint-stable',
			selectionSummary: {
				connectionCount: 4,
				netName: 'NEW',
				layerName: 'TopLayer',
				selectionFingerprint: 'fingerprint-stable',
			},
		});
	});

	test('sends daisy-chain requests with manual trunk mode', () => {
		const app = createIframeApp({
			form: {
				...createForm(),
				topologyMode: { value: 'daisyChain' },
			},
		});

			expect(app.readFormRequest()).toEqual({
				topologyMode: 'daisyChain',
				cornerStyle: 'bevel',
				trunkBias: 'neutral',
				width: 1,
				keepoutMargin: 0,
			trunkMode: 'manual',
			trunkStart: {
				x: 0,
				y: 0,
			},
			trunkEnd: {
				x: 10,
				y: 0,
			},
		});
	});

	test('clears daisy manual edit dirty state when inspectSelection fingerprint changes', () => {
		const app = createIframeApp({
			form: {
				...createForm(),
				topologyMode: { value: 'daisyChain' },
			},
		});

		app.markDaisyManualEditsDirty();

		expect(app.getState().daisyManualEditsDirty).toBe(true);

		app.handleResponse({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 1,
			},
			payload: {
				connectionCount: 2,
				layerName: 'TopLayer',
				netName: 'OLD',
				selectionFingerprint: 'fingerprint-old',
			},
		});

		app.markDaisyManualEditsDirty();

		expect(app.getState().daisyManualEditsDirty).toBe(true);

		app.handleResponse({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 2,
			},
			payload: {
				connectionCount: 4,
				layerName: 'BottomLayer',
				netName: 'NEW',
				selectionFingerprint: 'fingerprint-new',
			},
		});

		expect(app.getState().daisyManualEditsDirty).toBe(false);
	});

	test('clears daisy manual edit dirty state when switching away from daisyChain mode', () => {
		const form = createForm();
		form.topologyMode.value = 'daisyChain';
		const app = createIframeApp({ form });

		app.markDaisyManualEditsDirty();

		expect(app.getState().daisyManualEditsDirty).toBe(true);

		form.topologyMode.value = 'tree';
		app.handleTopologyModeChange();
		expect(app.getState().daisyManualEditsDirty).toBe(false);

		form.topologyMode.value = 'daisyChain';
		app.markDaisyManualEditsDirty();
		expect(app.getState().daisyManualEditsDirty).toBe(true);

		form.topologyMode.value = 'star';
		app.handleTopologyModeChange();
		expect(app.getState().daisyManualEditsDirty).toBe(false);
	});

	test('clears daisy manual edit dirty state when the panel reopens', () => {
		const firstApp = createIframeApp({
			form: {
				...createForm(),
				topologyMode: { value: 'daisyChain' },
			},
		});

		firstApp.markDaisyManualEditsDirty();
		expect(firstApp.getState().daisyManualEditsDirty).toBe(true);

		const reopenedApp = createIframeApp({
			form: {
				...createForm(),
				topologyMode: { value: 'daisyChain' },
			},
		});

		expect(reopenedApp.getState().daisyManualEditsDirty).toBe(false);
	});

	test('renders summary label as node count', () => {
		const iframeHtml = readFileSync(resolve(__dirname, '../../iframe/index.html'), 'utf8');

		expect(iframeHtml).toContain('<strong>节点</strong>');
		expect(iframeHtml).not.toContain('<strong>焊盘</strong>');
	});

	test('keeps iframe default corner style aligned to bevel', () => {
		const iframeHtml = readFileSync(resolve(__dirname, '../../iframe/index.html'), 'utf8');

		expect(iframeHtml).toContain('<option value="bevel" selected>斜切</option>');
		expect(iframeHtml).not.toContain('<option value="round" selected>圆角</option>');
	});

	test('does not throw for apply success responses with missing payload', () => {
		expect(() =>
			resolveSuccessStatus({
				command: 'apply',
				ok: true,
			}),
		).not.toThrow();

		expect(
			resolveSuccessStatus({
				command: 'apply',
				ok: true,
			}),
		).toEqual({
			message: '未生成铜皮。',
			tone: 'success',
		});
	});

	test('refreshes inspectSelection before preview and waits for matching success', () => {
		const harness = createIframeDomHarness();
		bootstrapHarness(harness);

		harness.previewButton.dispatchEvent(new Event('click'));

		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(1, 'smart-copper-pour/request', {
			command: 'inspectSelection',
			meta: {
				sequence: 1,
			},
		});
		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(2, 'smart-copper-pour/request', {
			command: 'inspectSelection',
			meta: {
				sequence: 2,
			},
		});
		expect(harness.messageBus.publish).toHaveBeenCalledTimes(2);

		harness.responseHandler()({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 1,
			},
			payload: {
				connectionCount: 2,
				layerName: 'TopLayer',
				netName: 'OLD',
				selectionFingerprint: 'old-selection',
			},
		});

		expect(harness.messageBus.publish).toHaveBeenCalledTimes(2);

		harness.responseHandler()({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 2,
			},
			payload: {
				connectionCount: 4,
				layerName: 'TopLayer',
				netName: 'REFRESHED',
				selectionFingerprint: 'fresh-selection',
			},
		});

		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(3, 'smart-copper-pour/request', {
			command: 'preview',
			payload: {
				cornerStyle: 'bevel',
				keepoutMargin: 0,
				topologyMode: 'tree',
				trunkBias: 'neutral',
				width: 1,
			},
		});
	});

	test('refreshes inspectSelection before apply and waits for matching success', () => {
		const harness = createIframeDomHarness();
		bootstrapHarness(harness);

		harness.applyButton.dispatchEvent(new Event('click'));

		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(2, 'smart-copper-pour/request', {
			command: 'inspectSelection',
			meta: {
				sequence: 2,
			},
		});
		expect(harness.messageBus.publish).toHaveBeenCalledTimes(2);

		harness.responseHandler()({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 2,
			},
			payload: {
				connectionCount: 4,
				layerName: 'BottomLayer',
				netName: 'APPLY-NET',
				selectionFingerprint: 'apply-selection',
			},
		});

		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(3, 'smart-copper-pour/request', {
			command: 'apply',
			payload: {
				cornerStyle: 'bevel',
				keepoutMargin: 0,
				topologyMode: 'tree',
				trunkBias: 'neutral',
				width: 1,
			},
		});
	});

	test('aborts preview and apply when forced inspect refresh fails', () => {
		const previewHarness = createIframeDomHarness();
		bootstrapHarness(previewHarness);

		previewHarness.previewButton.dispatchEvent(new Event('click'));
		previewHarness.responseHandler()({
			command: 'inspectSelection',
			ok: false,
			meta: {
				sequence: 2,
			},
			error: {
				code: 'invalidSelection',
				message: 'Selection is invalid.',
			},
		});

		expect(previewHarness.messageBus.publish).toHaveBeenCalledTimes(2);

		const applyHarness = createIframeDomHarness();
		bootstrapHarness(applyHarness);

		applyHarness.applyButton.dispatchEvent(new Event('click'));
		applyHarness.responseHandler()({
			command: 'inspectSelection',
			ok: false,
			meta: {
				sequence: 2,
			},
			error: {
				code: 'runtimeError',
				message: 'Runtime refresh failed.',
			},
		});

		expect(applyHarness.messageBus.publish).toHaveBeenCalledTimes(2);
	});

	test('requests inspectSelection again when host focus returns', () => {
		const harness = createIframeDomHarness();
		bootstrapHarness(harness);

		harness.windowObject.dispatchEvent(new Event('focus'));

		expect(harness.messageBus.publish).toHaveBeenNthCalledWith(2, 'smart-copper-pour/request', {
			command: 'inspectSelection',
			meta: {
				sequence: 2,
			},
		});
	});

	test('updates the visible selection summary after a newer inspectSelection succeeds', () => {
		const harness = createIframeDomHarness();
		bootstrapHarness(harness);

		harness.responseHandler()({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 1,
			},
			payload: {
				connectionCount: 2,
				layerName: 'TopLayer',
				netName: 'OLD',
				selectionFingerprint: 'summary-old',
			},
		});

		expect(harness.selectionNet.textContent).toBe('OLD');
		expect(harness.selectionLayer.textContent).toBe('TopLayer');
		expect(harness.selectionPadCount.textContent).toBe('2');

		harness.windowObject.dispatchEvent(new Event('focus'));
		harness.responseHandler()({
			command: 'inspectSelection',
			ok: true,
			meta: {
				sequence: 2,
			},
			payload: {
				connectionCount: 5,
				layerName: 'BottomLayer',
				netName: 'NEW',
				selectionFingerprint: 'summary-new',
			},
		});

		expect(harness.selectionNet.textContent).toBe('NEW');
		expect(harness.selectionLayer.textContent).toBe('BottomLayer');
		expect(harness.selectionPadCount.textContent).toBe('5');
		expect(harness.statusPanel.textContent).toBe('已准备好选择。请调整参数后预览。');
		expect(harness.statusPanel.dataset.tone).toBe('success');
	});
});
