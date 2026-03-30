import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { bootstrapIframeApp, createIframeApp, resolveSuccessStatus } from '../../src/iframe/index';
import type { SmartCopperPourRuntimeWindow } from '../../src/iframe/runtime-eda';

class FakeElement extends EventTarget {
	public checked = false;
	public hidden = false;
	public textContent = '';
	public dataset: Record<string, string> = {};
	public value = '';
	public topologyMode?: FakeElement;
	public starAreaShape?: FakeElement;
	public cornerStyle?: FakeElement;
	public width?: FakeElement;
	public keepoutMargin?: FakeElement;
	public useNodeSizeAsBaseWidth?: FakeElement;
	public orthogonalRouting?: FakeElement;
}

const createField = (value: string, checked = false): FakeElement => {
	const field = new FakeElement();
	field.value = value;
	field.checked = checked;
	return field;
};

const createForm = (): FakeElement => {
	const form = new FakeElement();
	Object.assign(form, {
		topologyMode: createField('daisyChain'),
		starAreaShape: createField('convexHull'),
		cornerStyle: createField('bevel45'),
		width: createField('1'),
		keepoutMargin: createField('0'),
		useNodeSizeAsBaseWidth: createField('', true),
		orthogonalRouting: createField('', true),
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
	const starOnlyField = new FakeElement();
	const treeLikeOnlyField = new FakeElement();
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
		querySelectorAll: (selector: string) => {
			if (selector === '[data-star-only]') {
				return [starOnlyField];
			}

			if (selector === '[data-tree-like-only]') {
				return [treeLikeOnlyField];
			}

			return [];
		},
	};

	const windowObject = new EventTarget();

	return {
		applyButton,
		clearButton,
		documentObject,
		form,
		panelApi,
		previewButton,
		selectionLayer,
		selectionNet,
		selectionPadCount,
		starOnlyField,
		statusPanel,
		storage,
		treeLikeOnlyField,
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
	test('reads default daisy-chain request before calling direct panel API', async () => {
		const panelApi = createPanelApi();
		const app = createIframeApp({
			form: createForm() as unknown as never,
			panelApi,
		});

		await app.preview();

		expect(panelApi.inspectSelection).toHaveBeenCalledTimes(1);
		expect(panelApi.preview).toHaveBeenCalledWith({
			cornerStyle: 'bevel45',
			keepoutMargin: 0,
			orthogonalRouting: true,
			topologyMode: 'daisyChain',
			useNodeSizeAsBaseWidth: true,
			width: 1,
		});
	});

	test('reads star requests with block area controls', async () => {
		const panelApi = createPanelApi();
		const form = createForm();
		form.topologyMode!.value = 'star';
		form.starAreaShape!.value = 'boundingBox';

		const app = createIframeApp({
			form: form as unknown as never,
			panelApi,
		});

		await app.apply();

		expect(panelApi.apply).toHaveBeenCalledWith({
			cornerStyle: 'bevel45',
			keepoutMargin: 0,
			orthogonalRouting: true,
			starAreaShape: 'boundingBox',
			topologyMode: 'star',
			useNodeSizeAsBaseWidth: true,
			width: 1,
		});
	});
});

describe('bootstrapIframeApp', () => {
	test('hydrates stored form state and renders direct selection summary', async () => {
		const harness = createBootstrapHarness();
		harness.storage.getItem.mockReturnValue(
			JSON.stringify({
				topologyMode: 'star',
				starAreaShape: 'boundingBox',
				cornerStyle: 'rightAngle',
				width: '2.5',
				keepoutMargin: '0.4',
				useNodeSizeAsBaseWidth: false,
				orthogonalRouting: false,
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

		expect(harness.form.topologyMode!.value).toBe('star');
		expect(harness.form.starAreaShape!.value).toBe('boundingBox');
		expect(harness.form.cornerStyle!.value).toBe('rightAngle');
		expect(harness.form.width!.value).toBe('2.5');
		expect(harness.form.useNodeSizeAsBaseWidth!.checked).toBe(false);
		expect(harness.starOnlyField.hidden).toBe(false);
		expect(harness.treeLikeOnlyField.hidden).toBe(true);
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
			cornerStyle: 'bevel45',
			keepoutMargin: 0,
			orthogonalRouting: true,
			topologyMode: 'daisyChain',
			useNodeSizeAsBaseWidth: true,
			width: 2,
		});
		expect(harness.storage.setItem).toHaveBeenCalledTimes(1);
		expect(harness.statusPanel.textContent).toBe('预览已更新。');
		harness.windowObject.dispatchEvent(new Event('beforeunload'));
	});
});

describe('iframe shell', () => {
	test('renders summary label as node count', () => {
		const iframeHtml = readFileSync(resolve(__dirname, '../../iframe/index.html'), 'utf8');

		expect(iframeHtml).toContain('<strong>节点</strong>');
		expect(iframeHtml).not.toContain('<strong>焊盘</strong>');
	});

	test('keeps iframe default corner style aligned to bevel45', () => {
		const iframeHtml = readFileSync(resolve(__dirname, '../../iframe/index.html'), 'utf8');

		expect(iframeHtml).toContain('<option value="bevel45" selected>45°斜切</option>');
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
