import { describe, expect, test } from 'vitest';

import {
	SelectionResolutionError,
	resolveSelectedPadNodes,
	type LcedaPadLike,
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

describe('resolveSelectedPadNodes', () => {
	test('rejects empty selection', () => {
		expect(() => resolveSelectedPadNodes([])).toThrowError(SelectionResolutionError);
		expect(() => resolveSelectedPadNodes([])).toThrow('Select at least two pads before running Smart Copper Pour.');
	});

	test('rejects a one-pad selection', () => {
		expect(() => resolveSelectedPadNodes([createPad()])).toThrow('Select at least two pads on the same net.');
	});

	test('rejects pads from mixed nets', () => {
		expect(() =>
			resolveSelectedPadNodes([createPad({ id: 'pad-1', net: 'VCC' }), createPad({ id: 'pad-2', net: 'GND' })]),
		).toThrow('Selected pads must share the same net.');
	});

	test('rejects pads from mixed layers', () => {
		expect(() =>
			resolveSelectedPadNodes([
				createPad({ id: 'pad-1', layer: 'TopLayer' }),
				createPad({ id: 'pad-2', layer: 'BottomLayer' }),
			]),
		).toThrow('Selected pads must be on the same layer.');
	});

	test('rejects pads without a named net', () => {
		expect(() =>
			resolveSelectedPadNodes([createPad({ id: 'pad-1', net: undefined }), createPad({ id: 'pad-2' })]),
		).toThrow('Selected pads must belong to a named net.');
	});

	test('rejects pads without a named layer', () => {
		expect(() =>
			resolveSelectedPadNodes([createPad({ id: 'pad-1', layer: undefined }), createPad({ id: 'pad-2' })]),
		).toThrow('Selected pads must be on a named layer.');
	});

	test('rejects pads without a usable radius', () => {
		expect(() =>
			resolveSelectedPadNodes([
				createPad({ id: 'pad-1', padRadius: null, holeRadius: null, width: null, height: null }),
				createPad({ id: 'pad-2' }),
			]),
		).toThrow('Pad pad-1 is missing a usable radius.');
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
