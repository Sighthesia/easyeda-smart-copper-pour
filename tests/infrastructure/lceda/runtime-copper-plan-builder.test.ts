import { afterEach, describe, expect, test } from 'vitest';

import type { SmartCopperPourDaisyChainRequest, SmartCopperPourTreeLikeRequest } from '../../../src/application/smart-copper-pour-contract';
import { planDaisyChainBackbone } from '../../../src/domain/daisy-chain-planner';
import type { PadNode } from '../../../src/domain/pad-node';
import { TopologyMode } from '../../../src/domain/topology-mode';
import { buildSkeletonOffsetPolygons } from '../../../src/infrastructure/geometry/polygon-offset-builder';
import { createRuntimeCopperPlanBuilder } from '../../../src/infrastructure/lceda/runtime-copper-plan-builder';
import type { LcedaInspectedSelectablePrimitive, LcedaSelectedPrimitivesReader } from '../../../src/infrastructure/lceda/selection-inspector';
import type { LcedaSelectablePrimitive } from '../../../src/infrastructure/lceda/selection-resolver';
import { createComponentSelection, createPadPrimitive } from './selection-fixtures';

type LcedaInspectedPadPrimitive = Extract<LcedaInspectedSelectablePrimitive, { type: 'PAD' }>;

const createPad = (overrides: Partial<LcedaInspectedPadPrimitive> = {}): LcedaInspectedPadPrimitive => ({
	id: 'pad-a',
	type: 'PAD' as const,
	net: ' VCC ',
	layer: ' TopLayer ',
	x: 0,
	y: 0,
	width: null,
	height: null,
	holeRadius: 0,
	padRadius: 1,
	...overrides,
});

const createReader = (primitives: readonly LcedaInspectedSelectablePrimitive[]): LcedaSelectedPrimitivesReader => ({
	readSelectedPrimitives: async () => primitives,
});

const edaGlobal = globalThis as typeof globalThis & {
	eda?: {
		pcb_SelectControl?: {
			getAllSelectedPrimitives?: () => Promise<unknown>;
		};
	};
};

const originalEda = edaGlobal.eda;

afterEach(() => {
	edaGlobal.eda = originalEda;
});

const createTreeRequest = (): SmartCopperPourTreeLikeRequest => ({
	topologyMode: TopologyMode.Tree,
	width: 2,
	keepoutMargin: 0,
	useNodeSizeAsBaseWidth: true,
	orthogonalRouting: true,
});

const createStarRequest = (): SmartCopperPourTreeLikeRequest => ({
	topologyMode: TopologyMode.Star,
	width: 2,
	keepoutMargin: 0,
	starAreaShape: 'convexHull',
	useNodeSizeAsBaseWidth: true,
	orthogonalRouting: true,
});

const createDaisyChainRequest = (): SmartCopperPourDaisyChainRequest => ({
	topologyMode: TopologyMode.DaisyChain,
	width: 2,
	keepoutMargin: 0,
	useNodeSizeAsBaseWidth: true,
	orthogonalRouting: true,
});

const createNonOrthogonalDaisyChainRequest = (): SmartCopperPourDaisyChainRequest => ({
	...createDaisyChainRequest(),
	orthogonalRouting: false,
});

const toPadNodes = (primitives: readonly LcedaSelectablePrimitive[]): PadNode[] =>
	primitives.map((primitive) => ({
		id: primitive.id,
		net: 'VCC',
		layer: 'TopLayer',
		center: { x: primitive.x ?? 0, y: primitive.y ?? 0 },
		effectiveRadius: primitive.padRadius ?? 1,
	}));

describe('createRuntimeCopperPlanBuilder', () => {
	test('rejects empty selection through the resolver-backed builder flow', async () => {
		const builder = createRuntimeCopperPlanBuilder(createReader([]));

		await expect(builder.buildWriterInput(createTreeRequest())).rejects.toThrow('Select at least two pads before running Smart Copper Pour.');
	});

	test('builds tree polygons from selected pads with node-size base width', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 4, y: 0 }),
				createPad({ id: 'pad-c', x: 0, y: 4 }),
			]),
		);

		const result = await builder.buildWriterInput(createTreeRequest());

		expect(result.layerName).toBe('TopLayer');
		expect(result.netName).toBe('VCC');
		expect(result.polygons.length).toBeGreaterThan(0);
		expect(bounds(result.polygons).minX).toBeLessThan(-1);
		expect(bounds(result.polygons).maxY).toBeGreaterThan(5);
	});

	test('builds star polygons from a convex hull block outline', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([createPad({ id: 'pad-a', x: 0, y: 0 }), createPad({ id: 'pad-b', x: 6, y: 0 }), createPad({ id: 'pad-c', x: 0, y: 6 })]),
		);

		const result = await builder.buildWriterInput(createStarRequest());

		expect(result.polygons.length).toBeGreaterThan(0);
		expect(result.polygons[0].vertices.length).toBeGreaterThanOrEqual(3);
		expect(bounds(result.polygons).minX).toBeLessThan(0);
		expect(bounds(result.polygons).maxX).toBeGreaterThan(6);
	});

	test('supports bounding-box star block fills', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([createPad({ id: 'pad-a', x: 0, y: 0 }), createPad({ id: 'pad-b', x: 6, y: 0 }), createPad({ id: 'pad-c', x: 2, y: 6 })]),
		);

		const convexHullResult = await builder.buildWriterInput(createStarRequest());
		const boundingBoxResult = await builder.buildWriterInput({
			...createStarRequest(),
			starAreaShape: 'boundingBox',
		});

		expect(boundingBoxResult.polygons).not.toEqual(convexHullResult.polygons);
	});

	test('builds daisy-chain polygons from an auto-derived orthogonal trunk', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 2, y: 2 }),
			createPad({ id: 'pad-b', x: 6, y: 4 }),
			createPad({ id: 'pad-c', x: 8, y: -3 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const result = await builder.buildWriterInput(createDaisyChainRequest());
		const expectedPolygons = buildSkeletonOffsetPolygons({
			segments: planDaisyChainBackbone(toPadNodes(primitives)).segments,
			width: 4,
		});

		expect(result.polygons).toEqual(expectedPolygons);
	});

	test('lets daisy-chain requests fall back to legacy non-orthogonal tree routing when disabled', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 1, y: 1 }),
			createPad({ id: 'pad-b', x: 6, y: 4 }),
			createPad({ id: 'pad-c', x: 8, y: -3 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const orthogonalResult = await builder.buildWriterInput(createDaisyChainRequest());
		const nonOrthogonalResult = await builder.buildWriterInput(createNonOrthogonalDaisyChainRequest());

		expect(nonOrthogonalResult.polygons).not.toEqual(orthogonalResult.polygons);
	});

	test('maps Inner30 to the last supported EasyEDA inner layer id', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([createPad({ id: 'pad-a', x: 0, y: 0, layer: 'Inner30' }), createPad({ id: 'pad-b', x: 4, y: 0, layer: 'Inner30' })]),
		);

		const result = await builder.buildWriterInput(createTreeRequest());

		expect(result.layerName).toBe('Inner30');
		expect(result.layerId).toBe(44);
	});

	test('rejects unsupported inner layers before creating writer input', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([createPad({ id: 'pad-a', x: 0, y: 0, layer: 'Inner31' }), createPad({ id: 'pad-b', x: 4, y: 0, layer: 'Inner31' })]),
		);

		await expect(builder.buildWriterInput(createTreeRequest())).rejects.toThrow('Unsupported copper layer: Inner31');
	});

	test('builds tree polygons from a component-expanded selection through the default reader path', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [
					createComponentSelection({
						id: 'component-1',
						children: [
							createPadPrimitive({ id: 'component-pad-1', x: 0, y: 0 }),
							createPadPrimitive({ id: 'component-pad-2', x: 4, y: 0 }),
							createPadPrimitive({ id: 'component-pad-3', x: 0, y: 4 }),
						],
					}),
				],
			},
		};

		const builder = createRuntimeCopperPlanBuilder();
		const result = await builder.buildWriterInput(createTreeRequest());

		expect(result.layerName).toBe('TopLayer');
		expect(result.netName).toBe('VCC');
		expect(result.polygons.length).toBeGreaterThan(0);
	});
});

const bounds = (polygons: ReadonlyArray<{ vertices: ReadonlyArray<{ x: number; y: number }> }>) => {
	const xs = polygons.flatMap((polygon) => polygon.vertices.map((vertex) => vertex.x));
	const ys = polygons.flatMap((polygon) => polygon.vertices.map((vertex) => vertex.y));

	return {
		minX: Math.min(...xs),
		maxX: Math.max(...xs),
		minY: Math.min(...ys),
		maxY: Math.max(...ys),
	};
};
