import { afterEach, describe, expect, test } from 'vitest';

import { createLcedaSelectedPrimitivesReader, createSmartCopperPourSelectionInspector } from '../../../src/infrastructure/lceda/selection-inspector';
import { createComponentSelection, createPadPrimitive, createViaPrimitive } from './selection-fixtures';

const edaGlobal = globalThis as typeof globalThis & {
	eda?: {
		pcb_SelectControl: {
			getAllSelectedPrimitives: () => Promise<unknown>;
		};
	};
};

const originalEda = edaGlobal.eda;

afterEach(() => {
	edaGlobal.eda = originalEda;
});

const createBasePrimitive = (id: string) => ({
	getState_PrimitiveId: () => id,
});

const createSupportedViaPrimitive = () =>
	({
		...createBasePrimitive('via-1'),
		getState_X: () => 10,
		getState_Y: () => 20,
		getState_Net: () => 'VCC',
		getState_Diameter: () => 1.6,
		getState_ViaType: () => 0,
		getState_DesignRuleBlindViaName: () => null,
	}) as unknown;

const createUnsupportedViaPrimitive = () =>
	({
		...createBasePrimitive('via-unsupported-1'),
		getState_X: () => 10,
		getState_Y: () => 20,
		getState_Net: () => 'VCC',
		getState_Diameter: () => 1.6,
		getState_ViaType: () => 1,
		getState_DesignRuleBlindViaName: () => 'L1-L2 blind rule',
	}) as unknown;

const createInvalidCoordinateViaPrimitive = () =>
	({
		...createBasePrimitive('via-invalid-1'),
		getState_X: () => Number.NaN,
		getState_Y: () => 20,
		getState_Net: () => 'VCC',
		getState_Diameter: () => 1.6,
		getState_ViaType: () => 0,
		getState_DesignRuleBlindViaName: () => null,
	}) as unknown;

const createMissingDiameterViaPrimitive = () =>
	({
		...createBasePrimitive('via-missing-diameter-1'),
		getState_X: () => 10,
		getState_Y: () => 20,
		getState_Net: () => 'VCC',
		getState_ViaType: () => 0,
		getState_DesignRuleBlindViaName: () => null,
	}) as unknown;

const createInvalidCoordinatePadPrimitive = () =>
	({
		...createBasePrimitive('pad-invalid-1'),
		getState_X: () => Number.NaN,
		getState_Y: () => 34,
		getState_Layer: () => 1,
		getState_Net: () => 'VCC',
		getState_Pad: () => ['ELLIPSE', 6, 4],
		getState_Hole: () => ['ROUND', 2, 2],
	}) as unknown;

const createMethodCollisionPrimitive = () =>
	({
		...createBasePrimitive('collision-1'),
		getState_ViaTypeX: () => 0,
	}) as unknown;

const createOtherPrimitive = () => createBasePrimitive('track-1') as unknown;

describe('createSmartCopperPourSelectionInspector', () => {
	test('summarizes normalized same-net pads', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
				{ id: 'pad-2', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 3, y: 4, width: null, height: null, padRadius: 1.2, holeRadius: null },
			],
		});

		const summary = await inspector.inspectSelection();

		expect(summary).toMatchObject({
			connectionCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
		});
		expect(summary.selectionFingerprint).toEqual(expect.any(String));
		expect(summary.selectionFingerprint).toContain('"id":"pad-1"');
		expect(summary.selectionFingerprint).toContain('"id":"pad-2"');
		expect(summary.selectionFingerprint).toContain('"net":"VCC"');
	});

	test('summarizes a single selected pad instead of waiting for two pads', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
			],
		});

		await expect(inspector.inspectSelection()).resolves.toEqual({
			connectionCount: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			selectionFingerprint: JSON.stringify([
				{
					center: { x: 1, y: 2 },
					effectiveRadius: 1,
					height: 2,
					id: 'pad-1',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					width: 2,
				},
			]),
		});
	});

	test('summarizes a single selected via and includes it in connectionCount', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'via-1', type: 'VIA', net: 'VCC', x: 3, y: 4, layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' }, padRadius: 0.8 },
			],
		});

		await expect(inspector.inspectSelection()).resolves.toEqual({
			connectionCount: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			selectionFingerprint: JSON.stringify([
				{
					center: { x: 3, y: 4 },
					effectiveRadius: 0.8,
					height: 1.6,
					id: 'via-1',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					width: 1.6,
				},
			]),
		});
	});

	test('includes via nodes in connectionCount when the selection includes a via', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
				{ id: 'via-1', type: 'VIA', net: 'VCC', x: 3, y: 4, layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' }, padRadius: 0.8 },
			],
		});

		const summary = await inspector.inspectSelection();

		expect(summary).toMatchObject({
			connectionCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
		});
		expect(summary.selectionFingerprint).toEqual(expect.any(String));
		expect(summary.selectionFingerprint).toContain('"id":"pad-1"');
		expect(summary.selectionFingerprint).toContain('"id":"via-1"');
		expect(summary.selectionFingerprint).toContain('"effectiveRadius":0.8');
	});

	test('rejects invalid-coordinate pads instead of silently dropping them from padCount', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
				{
					id: 'pad-invalid',
					type: 'PAD',
					net: 'VCC',
					layer: 'TopLayer',
					x: Number.NaN,
					y: 4,
					width: null,
					height: null,
					padRadius: 1.2,
					holeRadius: null,
				},
				{ id: 'via-1', type: 'VIA', net: 'VCC', x: 3, y: 4, layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' }, padRadius: 0.8 },
			],
		});

		await expect(inspector.inspectSelection()).rejects.toMatchObject({
			code: 'selection-pad-invalid',
			message: 'Pad pad-invalid is missing supported metadata.',
		});
	});

	test('rejects invalid via coordinates instead of silently ignoring the via', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
				{
					id: 'via-1',
					type: 'VIA',
					net: 'VCC',
					x: Number.NaN,
					y: 4,
					layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' },
					padRadius: 0.8,
				},
			],
		});

		await expect(inspector.inspectSelection()).rejects.toMatchObject({
			code: 'selection-via-unsupported',
			message: 'Via via-1 is missing supported metadata.',
		});
	});

	test('rejects an invalid via layer span instead of silently ignoring the via', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: null, height: null, padRadius: 1, holeRadius: null },
				{ id: 'via-1', type: 'VIA', net: 'VCC', x: 3, y: 4, layerSpan: null, padRadius: 0.8 } as unknown as never,
			],
		});

		await expect(inspector.inspectSelection()).rejects.toMatchObject({
			code: 'selection-via-unsupported',
			message: 'Via via-1 is missing supported metadata.',
		});
	});

	test('expands a selected component with pad children into child pad candidates', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				createComponentSelection({
					id: 'component-1',
					children: [createPadPrimitive({ id: 'component-pad-1', x: 1, y: 2 }), createPadPrimitive({ id: 'component-pad-2', x: 3, y: 4 })],
				}) as unknown as never,
			],
		});

		await expect(inspector.inspectSelection()).resolves.toEqual({
			connectionCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
			selectionFingerprint: JSON.stringify([
				{
					center: { x: 1, y: 2 },
					effectiveRadius: 3,
					height: 4,
					id: 'component-pad-1',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					rotation: 0,
					width: 6,
				},
				{
					center: { x: 3, y: 4 },
					effectiveRadius: 3,
					height: 4,
					id: 'component-pad-2',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					rotation: 0,
					width: 6,
				},
			]),
		});
	});

	test('keeps first occurrence order when a component and explicit child pad overlap', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				createComponentSelection({
					id: 'component-2',
					children: [createPadPrimitive({ id: 'shared-pad', x: 11, y: 12 }), createPadPrimitive({ id: 'component-pad-3', x: 13, y: 14 })],
				}) as unknown as never,
				createPadPrimitive({ id: 'shared-pad', x: 11, y: 12 }) as unknown as never,
			],
		});

		const summary = await inspector.inspectSelection();

		expect(summary).toEqual({
			connectionCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
			selectionFingerprint: JSON.stringify([
				{
					center: { x: 11, y: 12 },
					effectiveRadius: 3,
					height: 4,
					id: 'shared-pad',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					rotation: 0,
					width: 6,
				},
				{
					center: { x: 13, y: 14 },
					effectiveRadius: 3,
					height: 4,
					id: 'component-pad-3',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					rotation: 0,
					width: 6,
				},
			]),
		});
	});

	test('includes component child vias in the normalized selection summary', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				createComponentSelection({
					id: 'component-with-via-1',
					children: [createPadPrimitive({ id: 'component-pad-1', x: 1, y: 2 }), createViaPrimitive({ id: 'component-via-1', x: 9, y: 10 })],
				}) as unknown as never,
			],
		});

		await expect(inspector.inspectSelection()).resolves.toEqual({
			connectionCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
			selectionFingerprint: JSON.stringify([
				{
					center: { x: 1, y: 2 },
					effectiveRadius: 3,
					height: 4,
					id: 'component-pad-1',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					rotation: 0,
					width: 6,
				},
				{
					center: { x: 9, y: 10 },
					effectiveRadius: 0.8,
					height: 1.6,
					id: 'component-via-1',
					layer: 'TopLayer',
					net: 'VCC',
					outlineShape: 'ellipse',
					width: 1.6,
				},
			]),
		});
	});

	test('rejects expandable-looking unsupported selections that expose no pad-like children', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				createComponentSelection({
					id: 'component-unsupported-1',
					children: [{ id: 'track-child-1', type: 'TRACK' }],
				}) as unknown as never,
			],
		});

		await expect(inspector.inspectSelection()).rejects.toThrowError(/component-unsupported-1/);
		await expect(inspector.inspectSelection()).rejects.toThrowError(/node-like children/);
	});

	test('maps supported via primitives to VIA with a readable layer span', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createSupportedViaPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'via-1',
				type: 'VIA',
				net: 'VCC',
				x: 10,
				y: 20,
				layerSpan: {
					startLayer: 'TopLayer',
					endLayer: 'BottomLayer',
				},
				padRadius: 0.8,
			},
		]);
	});

	test('maps unsupported via primitives to VIA_UNSUPPORTED instead of OTHER', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createUnsupportedViaPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'via-unsupported-1',
				type: 'VIA_UNSUPPORTED',
				net: 'VCC',
				x: 10,
				y: 20,
			},
		]);
	});

	test('keeps missing-diameter via primitives as VIA_UNSUPPORTED instead of VIA', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createMissingDiameterViaPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'via-missing-diameter-1',
				type: 'VIA_UNSUPPORTED',
				net: 'VCC',
				x: 10,
				y: 20,
			},
		]);
	});

	test('keeps invalid-coordinate via primitives as VIA_UNSUPPORTED instead of OTHER', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createInvalidCoordinateViaPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'via-invalid-1',
				type: 'VIA_UNSUPPORTED',
				net: 'VCC',
				x: Number.NaN,
				y: 20,
			},
		]);
	});

	test('keeps non-pad non-via primitives as OTHER', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createOtherPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'track-1',
				type: 'OTHER',
			},
		]);
	});

	test('does not classify a single similar method name collision as VIA_UNSUPPORTED', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createMethodCollisionPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'collision-1',
				type: 'OTHER',
			},
		]);
	});

	test('maps raw LCEDA pad primitives to PAD selection metadata', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createPadPrimitive()],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			{
				id: 'pad-runtime-1',
				type: 'PAD',
				net: 'VCC',
				layer: 'TopLayer',
				x: 12,
				y: 34,
				rotation: 0,
				padShape: 'ELLIPSE',
				width: 6,
				height: 4,
				padRadius: 3,
				holeRadius: 1,
			},
		]);
	});

	test('does not downgrade invalid-coordinate pads to OTHER in the reader path', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createInvalidCoordinatePadPrimitive(), createPadPrimitive()],
			},
		};

		const inspector = createSmartCopperPourSelectionInspector(createLcedaSelectedPrimitivesReader());

		await expect(inspector.inspectSelection()).rejects.toMatchObject({
			code: 'selection-pad-invalid',
			message: 'Pad pad-invalid-1 is missing supported metadata.',
		});
	});

	test('treats unusable pad layer metadata as null instead of coercing arbitrary values', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createPadPrimitive({ layer: { kind: 'TopLayer' } })],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			expect.objectContaining({
				id: 'pad-runtime-1',
				type: 'PAD',
				layer: null,
			}),
		]);
	});

	test('treats unsupported runtime inner pad layers as null instead of passing through invalid names', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [createPadPrimitive({ layer: 45 })],
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).resolves.toEqual([
			expect.objectContaining({
				id: 'pad-runtime-1',
				type: 'PAD',
				layer: null,
			}),
		]);
	});

	test('throws a clear runtime error when selected primitives cannot be read as an array', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => undefined,
			},
		};

		const reader = createLcedaSelectedPrimitivesReader();

		await expect(reader.readSelectedPrimitives()).rejects.toThrow('LCEDA selected primitives API returned an unusable result.');
	});
});
