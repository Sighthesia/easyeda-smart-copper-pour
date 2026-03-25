import { describe, expect, test } from 'vitest';

import {
	type LcedaPadLike,
	type LcedaSelectablePrimitive,
	SelectionResolutionError,
	resolveSelectedPadNodes,
} from '../../../src/infrastructure/lceda/selection-resolver';

const createPad = (overrides: Partial<LcedaPadLike> = {}): LcedaPadLike => ({
	id: 'pad-1',
	type: 'PAD',
	net: 'VCC',
	layer: 'TopLayer',
	x: 10,
	y: 20,
	holeRadius: 0,
	padRadius: 1.2,
	...overrides,
});

type LcedaViaSelectablePrimitive = Omit<LcedaSelectablePrimitive, 'layerSpan'> & {
	type: 'VIA';
	layerSpan: {
		startLayer: string;
		endLayer: string;
	};
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
};

const createVia = (overrides: Partial<LcedaViaSelectablePrimitive> = {}): LcedaSelectablePrimitive =>
	({
		id: 'via-1',
		type: 'VIA',
		net: 'VCC',
		x: 15,
		y: 25,
		layerSpan: {
			startLayer: 'TopLayer',
			endLayer: 'BottomLayer',
		},
		padRadius: 0.4,
		...overrides,
	}) as unknown as LcedaSelectablePrimitive;

const createUnsupportedVia = (overrides: Partial<LcedaSelectablePrimitive> = {}): LcedaSelectablePrimitive => ({
	id: 'via-unsupported-1',
	type: 'VIA_UNSUPPORTED',
	net: 'VCC',
	x: 15,
	y: 25,
	...overrides,
});

const expectSelectionError = (selection: readonly LcedaSelectablePrimitive[], code: string, message: string): void => {
	try {
		resolveSelectedPadNodes(selection);
		expect.unreachable('Expected selection resolution to fail.');
	} catch (error) {
		expect(error).toBeInstanceOf(SelectionResolutionError);
		expect(error).toMatchObject({ code, message });
	}
};

describe('resolveSelectedPadNodes', () => {
	test('rejects empty selection', () => {
		expect(() => resolveSelectedPadNodes([])).toThrowError(SelectionResolutionError);
		expect(() => resolveSelectedPadNodes([])).toThrow('Select at least two pads before running Smart Copper Pour.');
	});

	test('rejects a one-pad selection', () => {
		expect(() => resolveSelectedPadNodes([createPad()])).toThrow('Select at least two pads on the same net.');
	});

	test('normalizes a pad plus via when the via spans the resolved target layer', () => {
		const padNodes = resolveSelectedPadNodes([
			createPad({ id: 'pad-1', x: 1, y: 2, layer: 'TopLayer' }),
			createVia({ id: 'via-1', x: 5, y: 6, layerSpan: { startLayer: 'TopLayer', endLayer: 'Inner1' } }),
		]);

		expect(padNodes).toEqual([
			{
				id: 'pad-1',
				net: 'VCC',
				layer: 'TopLayer',
				center: { x: 1, y: 2 },
				effectiveRadius: 1.2,
			},
			{
				id: 'via-1',
				net: 'VCC',
				layer: 'TopLayer',
				center: { x: 5, y: 6 },
				effectiveRadius: 0.4,
			},
		]);
	});

	test('rejects a via without a usable radius explicitly', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1', layer: 'TopLayer' }), createVia({ id: 'via-1', padRadius: null, holeRadius: null, width: null, height: null })],
			'selection-via-unsupported',
			'Via via-1 is missing supported metadata.',
		);
	});

	test('rejects supported via-only selection with the stable missing target layer source error', () => {
		expectSelectionError([createVia()], 'selection-layer-missing', 'Select at least one pad on a named layer.');
	});

	test('rejects unsupported via-only selection with the stable missing target layer source error', () => {
		expectSelectionError([createUnsupportedVia()], 'selection-layer-missing', 'Select at least one pad on a named layer.');
	});

	test('rejects a via whose span does not include the resolved target layer', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1', layer: 'TopLayer' }), createVia({ id: 'via-1', layerSpan: { startLayer: 'Inner1', endLayer: 'BottomLayer' } })],
			'selection-via-layer-invalid',
			'Via via-1 does not span the resolved target layer TopLayer.',
		);
	});

	test('rejects a via whose span uses unsupported layer tokens explicitly', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1', layer: 'TopLayer' }), createVia({ id: 'via-1', layerSpan: { startLayer: 'TopLayer', endLayer: 'InnerFoo' } })],
			'selection-via-unsupported',
			'Via via-1 uses unsupported layer span metadata.',
		);
	});

	test('rejects a selected via with invalid coordinates instead of ignoring it', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1', layer: 'TopLayer' }), createVia({ id: 'via-1', x: Number.NaN })],
			'selection-via-unsupported',
			'Via via-1 is missing supported metadata.',
		);
	});

	test('rejects a selected via with an invalid layer span structure instead of ignoring it', () => {
		expectSelectionError(
			[
				createPad({ id: 'pad-1', layer: 'TopLayer' }),
				({ id: 'via-1', type: 'VIA', net: 'VCC', x: 15, y: 25, layerSpan: null, padRadius: 0.4 } as unknown as LcedaSelectablePrimitive),
			],
			'selection-via-unsupported',
			'Via via-1 is missing supported metadata.',
		);
	});

	test('rejects a selected unsupported via with invalid coordinates explicitly', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1', layer: 'TopLayer' }), createUnsupportedVia({ id: 'via-unsupported-1', x: Number.NaN })],
			'selection-via-unsupported',
			'Via via-unsupported-1 is missing supported metadata.',
		);
	});

	test('rejects unsupported via metadata explicitly', () => {
		expectSelectionError(
			[createPad({ id: 'pad-1' }), createUnsupportedVia({ id: 'via-unsupported-1' })],
			'selection-via-unsupported',
			'Via via-unsupported-1 is missing supported layer span metadata.',
		);
	});

	test('rejects pads from mixed nets', () => {
		expect(() => resolveSelectedPadNodes([createPad({ id: 'pad-1', net: 'VCC' }), createPad({ id: 'pad-2', net: 'GND' })])).toThrow(
			'Selected pads must share the same net.',
		);
	});

	test('rejects pads from mixed layers', () => {
		expect(() =>
			resolveSelectedPadNodes([createPad({ id: 'pad-1', layer: 'TopLayer' }), createPad({ id: 'pad-2', layer: 'BottomLayer' })]),
		).toThrow('Selected pads must be on the same layer.');
	});

	test('rejects pads without a named net', () => {
		expect(() => resolveSelectedPadNodes([createPad({ id: 'pad-1', net: undefined }), createPad({ id: 'pad-2' })])).toThrow(
			'Selected pads must belong to a named net.',
		);
	});

	test('rejects pads without a named layer', () => {
		expect(() => resolveSelectedPadNodes([createPad({ id: 'pad-1', layer: undefined }), createPad({ id: 'pad-2' })])).toThrow(
			'Selected pads must be on a named layer.',
		);
	});

	test('rejects pads without a usable radius', () => {
		expect(() =>
			resolveSelectedPadNodes([
				createPad({ id: 'pad-1', padRadius: null, holeRadius: null, width: null, height: null }),
				createPad({ id: 'pad-2' }),
			]),
		).toThrow('Pad pad-1 is missing a usable radius.');
	});

	test('rejects a selected pad with invalid coordinates explicitly', () => {
		expectSelectionError(
			[createPad({ id: 'pad-invalid', x: Number.NaN }), createPad({ id: 'pad-2' })],
			'selection-pad-invalid',
			'Pad pad-invalid is missing supported metadata.',
		);
	});

	test('normalizes same-net pads on the same layer', () => {
		const padNodes = resolveSelectedPadNodes([
			createPad({
				id: 'pad-1',
				x: 1,
				y: 2,
				padRadius: 0.9,
				holeRadius: 0.4,
			}),
			createPad({
				id: 'pad-2',
				x: 5,
				y: 6,
				padRadius: 1.1,
				holeRadius: 0.2,
			}),
		]);

		expect(padNodes).toEqual([
			{
				id: 'pad-1',
				net: 'VCC',
				layer: 'TopLayer',
				center: { x: 1, y: 2 },
				effectiveRadius: 0.9,
			},
			{
				id: 'pad-2',
				net: 'VCC',
				layer: 'TopLayer',
				center: { x: 5, y: 6 },
				effectiveRadius: 1.1,
			},
		]);
	});
});
