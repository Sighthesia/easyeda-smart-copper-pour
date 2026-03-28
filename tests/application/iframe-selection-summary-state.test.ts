import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { bootstrapIframeApp, createIframeApp, resolveSuccessStatus } from '../../src/iframe/index';
import type { SmartCopperPourRuntimeWindow } from '../../src/iframe/runtime-eda';

class FakeElement extends EventTarget {
	public hidden = false;
	public textContent = '';
	public dataset: Record<string, string> = {};
	public value = '';
	public topologyMode?: FakeElement;
	public cornerStyle?: FakeElement;
	public trunkBias?: FakeElement;
	public width?: FakeElement;
	public keepoutMargin?: FakeElement;
	public trunkStartX?: FakeElement;
	public trunkStartY?: FakeElement;
	public trunkEndX?: FakeElement;
	public trunkEndY?: FakeElement;
}

const createField = (value: string): FakeElement => {
	const field = new FakeElement();
	field.value = value;
	return field;
};

const createForm = (): FakeElement => {
	const form = new FakeElement();
	Object.assign(form, {
		topologyMode: createField('tree'),
		cornerStyle: createField('bevel'),
		trunkBias: createField('neutral'),
		width: createField('1'),
		keepoutMargin: createField('0'),
		trunkStartX: createField('0'),
		trunkStartY: createField('0'),
		trunkEndX: createField('10'),
		trunkEndY: createField('0'),
	});
	return form;
};

const createPanelApi = () => ({
	inspectSelection: vi.fn().mockResolvedValue({
		connectionCount: 2,
		layerName: 'TopLayer',
		netName: 'VCC',
		selectionFingerprint: 'selection-1',
	}),
	preview: vi.fn().mockResolvedValue({ previewToken: 'preview-1' }),
	apply: vi.fn().mockResolvedValue({ applied: true }),
	clearPreview: vi.fn().mockResolvedValue({ cleared: true }),
});

const createBootstrapHarness = () => {
	const form = createForm();
	const previewButton = new FakeElement();
	const applyButton = new FakeElement();
	const clearButton = new FakeElement();
	const statusPanel = new FakeElement();
	const selectionNet = new FakeElement();
	const selectionLayer = new FakeElement();
	const selectionPadCount = new FakeElement();
	const daisyOnlyField = new FakeElement();
	const panelApi = createPanelApi();
	const storage = {
		getItem: vi.fn<(key: string) => string | null>(() => null),
		setItem: vi.fn<(key: string, value: string) => void>(),
	};
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
		getElementById: (id: string) => elements.get(id) ?? null,
		querySelectorAll: (selector: string) => (selector === '[data-daisy-only]' ? [daisyOnlyField] : []),
	};

	const windowObject = new EventTarget();

	return {
		applyButton,
		clearButton,
		daisyOnlyField,
		documentObject,
		form,
		panelApi,
		previewButton,
		selectionLayer,
		selectionNet,
		selectionPadCount,
		statusPanel,
		storage,
		windowObject,
	};
};

beforeEach(() => {
	vi.spyOn(globalThis, 'setInterval').mockReturnValue(1 as unknown as ReturnType<typeof setInterval>);
	vi.spyOn(globalThis, 'clearInterval').mockImplementation(() => undefined);
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('createIframeApp', () => {
	test('reads default tree request before calling direct panel API', async () => {
		const panelApi = createPanelApi();
		const app = createIframeApp({
			form: createForm() as unknown as never,
			panelApi,
		});

		await app.preview();

		expect(panelApi.inspectSelection).toHaveBeenCalledTimes(1);
		expect(panelApi.preview).toHaveBeenCalledWith({
			cornerStyle: 'bevel',
			keepoutMargin: 0,
			topologyMode: 'tree',
			trunkBias: 'neutral',
			width: 1,
		});
	});

	test('reads daisy-chain requests with manual trunk coordinates', async () => {
		const panelApi = createPanelApi();
		const form = createForm();
		form.topologyMode!.value = 'daisyChain';

		const app = createIframeApp({
			form: form as unknown as never,
			panelApi,
		});

		await app.apply();

		expect(panelApi.apply).toHaveBeenCalledWith({
			cornerStyle: 'bevel',
			keepoutMargin: 0,
			topologyMode: 'daisyChain',
			trunkBias: 'neutral',
			trunkEnd: {
				x: 10,
				y: 0,
			},
			trunkMode: 'manual',
			trunkStart: {
				x: 0,
				y: 0,
			},
			width: 1,
		});
	});
});

describe('bootstrapIframeApp', () => {
	test('hydrates stored form state and renders direct selection summary', async () => {
		const harness = createBootstrapHarness();
		harness.storage.getItem.mockReturnValue(
			JSON.stringify({
				topologyMode: 'daisyChain',
				cornerStyle: 'miter',
				trunkBias: 'vertical',
				width: '2.5',
				keepoutMargin: '0.4',
				trunkStartX: '1',
				trunkStartY: '2',
				trunkEndX: '9',
				trunkEndY: '3',
			}),
		);

		bootstrapIframeApp({
			documentObject: harness.documentObject as unknown as Document,
			windowObject: harness.windowObject as unknown as SmartCopperPourRuntimeWindow,
			storage: harness.storage,
			panelApi: harness.panelApi,
		});

		await vi.waitFor(() => {
			expect(harness.selectionNet.textContent).toBe('VCC');
		});

		expect(harness.form.topologyMode!.value).toBe('daisyChain');
		expect(harness.form.cornerStyle!.value).toBe('miter');
		expect(harness.form.trunkBias!.value).toBe('vertical');
		expect(harness.form.width!.value).toBe('2.5');
		expect(harness.daisyOnlyField.hidden).toBe(false);
		expect(harness.selectionLayer.textContent).toBe('TopLayer');
		expect(harness.selectionPadCount.textContent).toBe('2');
		expect(harness.statusPanel.textContent).toBe('已准备好选择。请调整参数后预览。');
		harness.windowObject.dispatchEvent(new Event('beforeunload'));
	});

	test('runs preview through direct panel API and persists form changes', async () => {
		const harness = createBootstrapHarness();

		bootstrapIframeApp({
			documentObject: harness.documentObject as unknown as Document,
			windowObject: harness.windowObject as unknown as SmartCopperPourRuntimeWindow,
			storage: harness.storage,
			panelApi: harness.panelApi,
		});

		await vi.waitFor(() => {
			expect(harness.panelApi.inspectSelection).toHaveBeenCalledTimes(1);
		});
		harness.panelApi.inspectSelection.mockClear();
		harness.panelApi.preview.mockClear();

		harness.form.width!.value = '2';
		harness.form.width!.dispatchEvent(new Event('change'));
		harness.previewButton.dispatchEvent(new Event('click'));

		await vi.waitFor(() => {
			expect(harness.panelApi.preview).toHaveBeenCalledTimes(1);
		});

		expect(harness.panelApi.inspectSelection).toHaveBeenCalledTimes(1);
		expect(harness.panelApi.preview).toHaveBeenCalledWith({
			cornerStyle: 'bevel',
			keepoutMargin: 0,
			topologyMode: 'tree',
			trunkBias: 'neutral',
			width: 2,
		});
		expect(harness.storage.setItem).toHaveBeenCalledTimes(1);
		expect(harness.statusPanel.textContent).toBe('预览已更新。');
		harness.windowObject.dispatchEvent(new Event('beforeunload'));
	});

	test('refreshes selection again when iframe regains focus', async () => {
		const harness = createBootstrapHarness();
		harness.panelApi.inspectSelection
			.mockResolvedValueOnce({
				connectionCount: 2,
				layerName: 'TopLayer',
				netName: 'OLD',
				selectionFingerprint: 'selection-1',
			})
			.mockResolvedValueOnce({
				connectionCount: 5,
				layerName: 'BottomLayer',
				netName: 'NEW',
				selectionFingerprint: 'selection-2',
			});

		bootstrapIframeApp({
			documentObject: harness.documentObject as unknown as Document,
			windowObject: harness.windowObject as unknown as SmartCopperPourRuntimeWindow,
			storage: harness.storage,
			panelApi: harness.panelApi,
		});

		await vi.waitFor(() => {
			expect(harness.selectionNet.textContent).toBe('OLD');
		});

		harness.windowObject.dispatchEvent(new Event('focus'));

		await vi.waitFor(() => {
			expect(harness.selectionNet.textContent).toBe('NEW');
		});

		expect(harness.selectionLayer.textContent).toBe('BottomLayer');
		expect(harness.selectionPadCount.textContent).toBe('5');
		expect(harness.statusPanel.textContent).toBe('已同步当前选区。');
		harness.windowObject.dispatchEvent(new Event('beforeunload'));
	});
});

describe('iframe shell', () => {
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

	test('loads the compiled iframe bundle', () => {
		const iframeHtml = readFileSync(resolve(__dirname, '../../iframe/index.html'), 'utf8');

		expect(iframeHtml).toContain('<script src="/dist/iframe.js"></script>');
		expect(iframeHtml).not.toContain('type="module"');
	});
});

describe('resolveSuccessStatus', () => {
	test('does not throw for apply success responses with missing payload', () => {
		expect(() => resolveSuccessStatus('apply')).not.toThrow();
		expect(resolveSuccessStatus('apply')).toEqual({
			message: '未生成铜皮。',
			tone: 'success',
		});
	});
});
