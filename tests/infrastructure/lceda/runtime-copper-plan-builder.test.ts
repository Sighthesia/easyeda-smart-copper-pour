import { afterEach, describe, expect, test, vi } from 'vitest';

import type { SmartCopperPourDaisyChainRequest, SmartCopperPourTreeLikeRequest } from '../../../src/application/smart-copper-pour-contract';
import { TopologyMode } from '../../../src/domain/topology-mode';
import { createRuntimeCopperPlanBuilder } from '../../../src/infrastructure/lceda/runtime-copper-plan-builder';
import type { LcedaInspectedSelectablePrimitive, LcedaSelectedPrimitivesReader } from '../../../src/infrastructure/lceda/selection-inspector';
import { createComponentSelection, createPadPrimitive, createViaPrimitive } from './selection-fixtures';

type LcedaInspectedPadPrimitive = Extract<LcedaInspectedSelectablePrimitive, { type: 'PAD' }>;

const createPad = (overrides: Partial<LcedaInspectedPadPrimitive> = {}): LcedaInspectedPadPrimitive => ({
	id: 'pad-a',
	type: 'PAD' as const,
	net: ' VCC ',
	layer: ' TopLayer ',
	x: 0,
	y: 0,
	rotation: null,
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

describe('createRuntimeCopperPlanBuilder', () => {
	test('rejects empty selection through the resolver-backed builder flow', async () => {
		const builder = createRuntimeCopperPlanBuilder(createReader([]));

		await expect(builder.buildWriterInput(createTreeRequest())).rejects.toThrow('最少选择两个焊盘才可进行铺铜');
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

	test('keeps star hull aligned to node outlines when additional width is zero', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createStarRequest(),
			width: 0,
			starAreaShape: 'boundingBox',
		});

		expect(bounds(result.polygons)).toEqual({
			minX: -2,
			maxX: 10,
			minY: -2,
			maxY: 2,
		});
	});

	test('keeps bevel45 node transitions visible for square pads', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 2,
			cornerStyle: 'bevel45',
		});

		expect(result.polygons).toHaveLength(1);
		expect(bounds(result.polygons)).toEqual({
			minX: -3,
			maxX: 11,
			minY: -3,
			maxY: 3,
		});
		expect(result.polygons[0].vertices).toContainEqual({ x: -2.414, y: -3 });
		expect(result.polygons[0].vertices).toContainEqual({ x: 10.414, y: 3 });
	});

	test('keeps round node transitions flat along the shared top edge', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 2,
			cornerStyle: 'round',
		});

		expect(result.polygons).toHaveLength(1);
		const topEdgeVertices = result.polygons[0].vertices.filter((vertex) => Math.abs(vertex.y - 3) < 0.001);
		const topXs = topEdgeVertices.map((vertex) => vertex.x).sort((left, right) => left - right);
		expect(topXs[0]).toBeLessThan(-1.9);
		expect(topXs[topXs.length - 1]).toBeGreaterThan(9.9);
		expect(Math.max(...result.polygons[0].vertices.map((vertex) => vertex.y))).toBe(3);
	});

	test('applies corner style to square boundary pads even when additional width is zero', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 0,
			cornerStyle: 'bevel45',
		});

		expect(result.polygons).toHaveLength(1);
		expect(bounds(result.polygons)).toEqual({
			minX: -2,
			maxX: 10,
			minY: -2,
			maxY: 2,
		});
		expect(result.polygons[0].vertices).toContainEqual({ x: -2, y: -2 });
		expect(result.polygons[0].vertices).toContainEqual({ x: -2, y: 2 });
		expect(result.polygons[0].vertices).toContainEqual({ x: 10, y: -2 });
		expect(result.polygons[0].vertices).toContainEqual({ x: 10, y: 2 });
	});

	test('keeps full square pad corners covered after bevel styling with additional width', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 2,
			cornerStyle: 'bevel45',
		});

		expect(result.polygons).toHaveLength(1);
		for (const point of [
			{ x: -1.9, y: -1.9 },
			{ x: -1.9, y: 1.9 },
			{ x: 1.9, y: -1.9 },
			{ x: 1.9, y: 1.9 },
			{ x: 6.1, y: -1.9 },
			{ x: 6.1, y: 1.9 },
			{ x: 9.9, y: -1.9 },
			{ x: 9.9, y: 1.9 },
		]) {
			expect(isPointInsideOrOnPolygonBoundary(point, result.polygons[0])).toBe(true);
		}
	});

	test('applies corner style to inner right angles in tree-like T regions', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-b', x: 8, y: 0, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
				createPad({ id: 'pad-c', x: 4, y: 6, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			]),
		);

		const rightAngle = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 2,
			cornerStyle: 'rightAngle',
		});
		const beveled = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 2,
			cornerStyle: 'bevel45',
		});

		expect(rightAngle.polygons[0].vertices).toContainEqual({ x: 7, y: 5 });
		expect(rightAngle.polygons[0].vertices).toContainEqual({ x: 1, y: 5 });
		expect(beveled.polygons[0].vertices).not.toContainEqual({ x: 7, y: 5 });
		expect(beveled.polygons[0].vertices).not.toContainEqual({ x: 1, y: 5 });
		expect(hasNoSharpConvexCorners(beveled.polygons[0], 120)).toBe(true);
	});

	test('builds daisy-chain polygons from an auto-derived orthogonal trunk', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 2, y: 2 }),
			createPad({ id: 'pad-b', x: 6, y: 4 }),
			createPad({ id: 'pad-c', x: 8, y: -3 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const result = await builder.buildWriterInput(createDaisyChainRequest());

		expect(result.polygons.length).toBeGreaterThan(0);
		expect(bounds(result.polygons).minX).toBeLessThan(2);
		expect(bounds(result.polygons).maxX).toBeGreaterThan(8);
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

	test('keeps bevel45 free of sharp non-45 spikes in non-orthogonal routing', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 1, y: 1, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			createPad({ id: 'pad-b', x: 6, y: 4, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
			createPad({ id: 'pad-c', x: 8, y: -3, padShape: 'RECT', width: 4, height: 4, padRadius: 2 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const result = await builder.buildWriterInput({
			...createNonOrthogonalDaisyChainRequest(),
			cornerStyle: 'bevel45',
		});

		expect(result.polygons).toHaveLength(1);
		expect(hasNoSharpConvexCorners(result.polygons[0], 120)).toBe(true);
	});

	test('covers rectangular pads without sharp bevel spikes when additional width is small', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0, padShape: 'RECT', width: 8, height: 2, padRadius: 4 }),
				createPad({ id: 'pad-b', x: 14, y: 0, padShape: 'RECT', width: 8, height: 2, padRadius: 4 }),
			]),
		);

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 0.2,
			cornerStyle: 'bevel45',
		});

		expect(result.polygons).toHaveLength(1);
		for (const point of [
			{ x: -4, y: -1 },
			{ x: 4, y: -1 },
			{ x: 4, y: 1 },
			{ x: -4, y: 1 },
			{ x: 10, y: -1 },
			{ x: 18, y: -1 },
			{ x: 18, y: 1 },
			{ x: 10, y: 1 },
		]) {
			expect(isPointInsidePolygon(point, result.polygons[0])).toBe(true);
		}
		expect(hasNoSharpConvexCorners(result.polygons[0], 135)).toBe(true);
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

		await expect(builder.buildWriterInput(createTreeRequest())).rejects.toThrow('Pad pad-a uses unsupported layer Inner31.');
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

	test('includes component child vias when computing polygons through the default reader path', async () => {
		edaGlobal.eda = {
			pcb_SelectControl: {
				getAllSelectedPrimitives: async () => [
					createComponentSelection({
						id: 'component-with-via-1',
						children: [
							createPadPrimitive({ id: 'component-pad-1', x: 0, y: 0 }),
							createViaPrimitive({ id: 'component-via-1', x: 12, y: 0 }),
						],
					}),
				],
			},
		};

		const builder = createRuntimeCopperPlanBuilder();
		const result = await builder.buildWriterInput(createTreeRequest());

		expect(result.layerName).toBe('TopLayer');
		expect(result.netName).toBe('VCC');
		expect(bounds(result.polygons).maxX).toBeGreaterThan(12);
	});

	test('covers rotated rectangular pad corners for the provided four-pad tree scenario', async () => {
		const builder = createRuntimeCopperPlanBuilder(createReader(createRotatedPadScenario()));

		const result = await builder.buildWriterInput({
			...createTreeRequest(),
			width: 0,
		});

		for (const corner of createPhysicalScenarioCorners()) {
			expect(isCoveredByAnyPolygon(corner.point, result.polygons), `tree missed ${corner.padId} corner ${JSON.stringify(corner.point)}`).toBe(
				true,
			);
		}
	});

	test('covers rotated rectangular pad corners for the provided four-pad daisy-chain scenario', async () => {
		const builder = createRuntimeCopperPlanBuilder(createReader(createRotatedPadScenario()));

		const result = await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 0,
		});

		for (const corner of createPhysicalScenarioCorners()) {
			expect(
				isCoveredByAnyPolygon(corner.point, result.polygons),
				`daisyChain missed ${corner.padId} corner ${JSON.stringify(corner.point)}`,
			).toBe(true);
		}
	});

	test('covers rotated rectangular pad corners for the provided four-pad star scenario', async () => {
		const builder = createRuntimeCopperPlanBuilder(createReader(createRotatedPadScenario()));

		const result = await builder.buildWriterInput({
			...createStarRequest(),
			width: 0,
		});

		for (const corner of createPhysicalScenarioCorners()) {
			expect(isCoveredByAnyPolygon(corner.point, result.polygons), `star missed ${corner.padId} corner ${JSON.stringify(corner.point)}`).toBe(
				true,
			);
		}
	});

	test('outputs selected pads, planning nodes, and generated copper area nodes with output prefix', async () => {
		const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 10, y: 20, padShape: 'RECT', width: 6, height: 4, rotation: 90, padRadius: 3 }),
				createPad({ id: 'pad-b', x: 30, y: 20, padShape: 'RECT', width: 8, height: 2, rotation: 0, padRadius: 4 }),
			]),
		);

		await builder.buildWriterInput({
			...createDaisyChainRequest(),
			width: 0,
		});

		const outputMessage = consoleInfoSpy.mock.calls
			.map((call) => call[0])
			.find((message): message is string => typeof message === 'string' && message.startsWith('[smart-copper-pour::output] '));

		consoleInfoSpy.mockRestore();

		expect(outputMessage).toBeDefined();
		const payload = JSON.parse((outputMessage as string).slice('[smart-copper-pour::output] '.length)) as {
			selectedPads: Array<{ id: string; rotation: number }>;
			nodesForPlanning: Array<{ id: string; outlineVertices: Array<{ x: number; y: number }> }>;
			generatedCopperAreaNodes: Array<{ vertices: Array<{ x: number; y: number }> }>;
		};

		expect(payload.selectedPads).toEqual([
			expect.objectContaining({ id: 'pad-a', rotation: 90 }),
			expect.objectContaining({ id: 'pad-b', rotation: 0 }),
		]);
		expect(payload.nodesForPlanning[0]?.outlineVertices.length).toBeGreaterThanOrEqual(4);
		expect(payload.generatedCopperAreaNodes[0]?.vertices.length).toBeGreaterThanOrEqual(4);
	});
});

const createRotatedPadScenario = (): readonly LcedaInspectedPadPrimitive[] =>
	[
		createPad({
			id: 'pad-a',
			x: 2710,
			y: 1083.6,
			padShape: 'RECT',
			width: 31.5,
			height: 35.4,
			rotation: 90,
			padRadius: 17.7,
		}),
		createPad({
			id: 'pad-b',
			x: 2770,
			y: 2770,
			padShape: 'RECT',
			width: 31.5,
			height: 35.4,
			rotation: 90,
			padRadius: 17.7,
		}),
		createPad({
			id: 'pad-c',
			x: 2870,
			y: 949.7,
			padShape: 'RECT',
			width: 82.7,
			height: 70.9,
			rotation: 270,
			padRadius: 41.35,
		}),
		createPad({
			id: 'pad-d',
			x: 3121.7,
			y: 1104.1,
			padShape: 'RECT',
			width: 39.4,
			height: 106.3,
			rotation: 90,
			padRadius: 53.15,
		}),
	] as const;

const createPhysicalScenarioCorners = (): ReadonlyArray<{ padId: string; point: { x: number; y: number } }> => {
	return [
		createRectCorners('pad-a', { x: 2710, y: 1083.6 }, 31.5, 35.4, 90),
		createRectCorners('pad-b', { x: 2770, y: 2770 }, 31.5, 35.4, 90),
		createRectCorners('pad-c', { x: 2870, y: 949.7 }, 82.7, 70.9, 270),
		createRectCorners('pad-d', { x: 3121.7, y: 1104.1 }, 39.4, 106.3, 90),
	].flat();
};

const createRectCorners = (
	padId: string,
	center: { x: number; y: number },
	width: number,
	height: number,
	rotationDegrees: number,
): ReadonlyArray<{ padId: string; point: { x: number; y: number } }> => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	return [
		{ x: -halfWidth, y: -halfHeight },
		{ x: halfWidth, y: -halfHeight },
		{ x: halfWidth, y: halfHeight },
		{ x: -halfWidth, y: halfHeight },
	].map((point) => ({
		padId,
		point: rotatePoint(center, point, rotationDegrees),
	}));
};

const rotatePoint = (center: { x: number; y: number }, point: { x: number; y: number }, rotationDegrees: number): { x: number; y: number } => {
	const rotationRadians = (rotationDegrees * Math.PI) / 180;
	const cosRotation = Math.cos(rotationRadians);
	const sinRotation = Math.sin(rotationRadians);
	return {
		x: center.x + point.x * cosRotation - point.y * sinRotation,
		y: center.y + point.x * sinRotation + point.y * cosRotation,
	};
};

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

const hasNoSharpConvexCorners = (polygon: { vertices: ReadonlyArray<{ x: number; y: number }> }, minimumAngleDegrees: number): boolean => {
	const area = polygon.vertices.reduce((sum, vertex, index) => {
		const nextVertex = polygon.vertices[(index + 1) % polygon.vertices.length];
		return sum + (vertex.x * nextVertex.y - nextVertex.x * vertex.y);
	}, 0);
	const windingSign = Math.sign(area) || 1;

	for (let index = 0; index < polygon.vertices.length; index += 1) {
		const previousVertex = polygon.vertices[(index - 1 + polygon.vertices.length) % polygon.vertices.length];
		const currentVertex = polygon.vertices[index];
		const nextVertex = polygon.vertices[(index + 1) % polygon.vertices.length];
		const incomingX = previousVertex.x - currentVertex.x;
		const incomingY = previousVertex.y - currentVertex.y;
		const outgoingX = nextVertex.x - currentVertex.x;
		const outgoingY = nextVertex.y - currentVertex.y;
		const incomingLength = Math.hypot(incomingX, incomingY);
		const outgoingLength = Math.hypot(outgoingX, outgoingY);
		if (incomingLength < 0.001 || outgoingLength < 0.001) {
			continue;
		}

		const cross = incomingX * outgoingY - incomingY * outgoingX;
		const isConvex = windingSign > 0 ? cross < 0 : cross > 0;
		if (!isConvex) {
			continue;
		}

		const normalizedDot = (incomingX * outgoingX + incomingY * outgoingY) / (incomingLength * outgoingLength);
		const angle = (Math.acos(Math.max(-1, Math.min(1, normalizedDot))) * 180) / Math.PI;
		if (angle + 0.001 < minimumAngleDegrees) {
			return false;
		}
	}

	return true;
};

const isPointInsidePolygon = (point: { x: number; y: number }, polygon: { vertices: ReadonlyArray<{ x: number; y: number }> }): boolean => {
	let inside = false;
	for (let index = 0, previousIndex = polygon.vertices.length - 1; index < polygon.vertices.length; previousIndex = index, index += 1) {
		const currentVertex = polygon.vertices[index];
		const previousVertex = polygon.vertices[previousIndex];
		const intersects =
			currentVertex.y > point.y !== previousVertex.y > point.y &&
			point.x < ((previousVertex.x - currentVertex.x) * (point.y - currentVertex.y)) / (previousVertex.y - currentVertex.y) + currentVertex.x;
		if (intersects) {
			inside = !inside;
		}
	}

	return inside;
};

const isPointInsideOrOnPolygonBoundary = (
	point: { x: number; y: number },
	polygon: { vertices: ReadonlyArray<{ x: number; y: number }> },
): boolean => {
	if (isPointOnPolygonBoundary(point, polygon)) {
		return true;
	}

	return isPointInsidePolygon(point, polygon);
};

const isCoveredByAnyPolygon = (
	point: { x: number; y: number },
	polygons: ReadonlyArray<{ vertices: ReadonlyArray<{ x: number; y: number }> }>,
): boolean => {
	return polygons.some((polygon) => isPointInsideOrOnPolygonBoundary(point, polygon));
};

const isPointOnPolygonBoundary = (point: { x: number; y: number }, polygon: { vertices: ReadonlyArray<{ x: number; y: number }> }): boolean => {
	for (let index = 0; index < polygon.vertices.length; index += 1) {
		const start = polygon.vertices[index];
		const end = polygon.vertices[(index + 1) % polygon.vertices.length];
		if (isPointOnSegment(point, start, end)) {
			return true;
		}
	}

	return false;
};

const isPointOnSegment = (
	point: { x: number; y: number },
	start: { x: number; y: number },
	end: { x: number; y: number },
	epsilon = 0.001,
): boolean => {
	const cross = (point.y - start.y) * (end.x - start.x) - (point.x - start.x) * (end.y - start.y);
	if (Math.abs(cross) > epsilon) {
		return false;
	}

	const dot = (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y);
	if (dot < -epsilon) {
		return false;
	}

	const squaredLength = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
	return dot - squaredLength <= epsilon;
};
