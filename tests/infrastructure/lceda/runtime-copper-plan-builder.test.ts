import { describe, expect, test, vi } from 'vitest';

import type {
	SmartCopperPourDaisyChainAutoRequest,
	SmartCopperPourDaisyChainManualRequest,
	SmartCopperPourPreviewRequest,
	SmartCopperPourTreeLikeRequest,
} from '../../../src/application/smart-copper-pour-contract';
import { planDaisyChainBackbone } from '../../../src/domain/daisy-chain-planner';
import type { PadNode } from '../../../src/domain/pad-node';
import { TopologyMode } from '../../../src/domain/topology-mode';
import { buildSkeletonOffsetPolygons } from '../../../src/infrastructure/geometry/polygon-offset-builder';
import type {
	LcedaInspectedSelectablePrimitive,
	LcedaSelectedPrimitivesReader,
} from '../../../src/infrastructure/lceda/selection-inspector';
import type { LcedaSelectablePrimitive } from '../../../src/infrastructure/lceda/selection-resolver';
import { createRuntimeCopperPlanBuilder } from '../../../src/infrastructure/lceda/runtime-copper-plan-builder';

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

const createTreeRequest = (): SmartCopperPourTreeLikeRequest => ({
	topologyMode: TopologyMode.Tree,
	width: 2,
	keepoutMargin: 0,
});

const createStarRequest = (): SmartCopperPourTreeLikeRequest => ({
	topologyMode: TopologyMode.Star,
	width: 2,
	keepoutMargin: 0,
});

const createDaisyChainRequest = (): SmartCopperPourDaisyChainManualRequest => ({
	topologyMode: TopologyMode.DaisyChain,
	width: 2,
	keepoutMargin: 0,
	trunkMode: 'manual' as const,
	trunkStart: { x: 0, y: 0 },
	trunkEnd: { x: 10, y: 0 },
});

const createAutoDaisyChainRequest = (): SmartCopperPourDaisyChainAutoRequest => ({
	topologyMode: TopologyMode.DaisyChain,
	width: 2,
	keepoutMargin: 0,
	trunkMode: 'auto' as const,
	trunkBias: 'horizontal' as const,
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

    await expect(builder.buildWriterInput(createTreeRequest())).rejects.toThrow(
      'Select at least two pads before running Smart Copper Pour.',
    );
  });

  test('rejects an unsupported topology mode explicitly', async () => {
    const builder = createRuntimeCopperPlanBuilder(
      createReader([
        createPad({ id: 'pad-a', x: 0, y: 0 }),
        createPad({ id: 'pad-b', x: 4, y: 0 }),
      ]),
    );

		await expect(
			builder.buildWriterInput({
				topologyMode: 'bogus' as TopologyMode,
				width: 2,
				keepoutMargin: 0,
			} as SmartCopperPourPreviewRequest),
		).rejects.toThrow('Unsupported topology mode: bogus');
	});

  test('builds tree polygons from selected pads', async () => {
    const builder = createRuntimeCopperPlanBuilder(
      createReader([
        createPad({ id: 'pad-a', x: 0, y: 0 }),
        createPad({ id: 'pad-b', x: 4, y: 0 }),
        createPad({ id: 'pad-c', x: 0, y: 4 }),
      ]),
    );

    const result = await builder.buildWriterInput(createTreeRequest());

    expect(result.layerName).toBe('TopLayer');
    expect(result.netName).toBe('VCC');
    expect(result.polygons.length).toBeGreaterThan(0);
    expect(result.polygons[0].vertices.length).toBeGreaterThan(4);
    // eslint-disable-next-line max-nested-callbacks
    expect(bounds(result.polygons)).toEqual({ minX: expect.any(Number), maxX: expect.any(Number), minY: expect.any(Number), maxY: expect.any(Number) });
    expect(bounds(result.polygons).minX).toBeLessThan(0);
    expect(bounds(result.polygons).maxX).toBeGreaterThan(4);
    expect(bounds(result.polygons).maxY).toBeGreaterThan(4);
  });

	test('builds star polygons from selected pads', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
        createPad({ id: 'pad-a', x: 0, y: 0 }),
        createPad({ id: 'pad-b', x: 6, y: 0 }),
        createPad({ id: 'pad-c', x: 0, y: 6 }),
      ]),
    );

    const result = await builder.buildWriterInput(createStarRequest());

    expect(result.polygons.length).toBeGreaterThan(0);
		expect(result.polygons[0].vertices.length).toBeGreaterThan(4);
	});

	test('passes trunkBias through the runtime star planning path', async () => {
		vi.resetModules();
		const planStarBackbone = vi.fn(() => ({
			mode: TopologyMode.Star,
			hub: { x: 0, y: 0 },
			segments: [
				{
					start: { x: 0, y: 0 },
					end: { x: 4, y: 0 },
					role: 'branch' as const,
				},
			],
		}));

		vi.doMock('../../../src/domain/star-backbone-planner', () => ({
			planStarBackbone,
		}));

		try {
			const { createRuntimeCopperPlanBuilder: createMockedRuntimeCopperPlanBuilder } = await import(
				'../../../src/infrastructure/lceda/runtime-copper-plan-builder'
			);
			const builder = createMockedRuntimeCopperPlanBuilder(
				createReader([
					createPad({ id: 'pad-a', x: 0, y: 0 }),
					createPad({ id: 'pad-b', x: 4, y: 0 }),
				]),
			);

			await builder.buildWriterInput({
				...createStarRequest(),
				trunkBias: 'vertical',
			});

			expect(planStarBackbone).toHaveBeenCalledWith(
				expect.any(Array),
				{ trunkBias: 'vertical' },
			);
		} finally {
			vi.doUnmock('../../../src/domain/star-backbone-planner');
			vi.resetModules();
		}
	});

	test('uses different topology plans for tree and star requests', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 0, y: 0 }),
				createPad({ id: 'pad-b', x: 8, y: 0 }),
				createPad({ id: 'pad-c', x: 0, y: 8 }),
				createPad({ id: 'pad-d', x: 8, y: 8 }),
			]),
		);

    const treeResult = await builder.buildWriterInput(createTreeRequest());
    const starResult = await builder.buildWriterInput(createStarRequest());

    expect(treeResult.polygons).not.toEqual(starResult.polygons);
  });

	test('builds daisy-chain polygons from trunk endpoints', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 2, y: 2 }),
        createPad({ id: 'pad-b', x: 6, y: 4 }),
        createPad({ id: 'pad-c', x: 8, y: -3 }),
      ]),
    );

    const result = await builder.buildWriterInput(createDaisyChainRequest());

		expect(result.polygons.length).toBeGreaterThan(0);
		expect(result.polygons.some((polygon) => polygon.vertices.some((vertex) => vertex.x < 0 || vertex.x > 10))).toBe(true);
	});

	test('builds daisy-chain polygons from an auto-derived trunk', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 2, y: 2 }),
			createPad({ id: 'pad-b', x: 6, y: 4 }),
			createPad({ id: 'pad-c', x: 8, y: -3 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const result = await builder.buildWriterInput(createAutoDaisyChainRequest());
		const expectedPolygons = buildSkeletonOffsetPolygons({
			segments: planDaisyChainBackbone(toPadNodes(primitives), { trunkMode: 'auto', trunkBias: 'horizontal' }).segments,
			width: 2,
		});

		expect(result.polygons).toEqual(expectedPolygons);
	});

	test('keeps using explicit endpoints for manual daisy-chain requests', async () => {
		const primitives = [
			createPad({ id: 'pad-a', x: 2, y: 2 }),
			createPad({ id: 'pad-b', x: 6, y: 4 }),
			createPad({ id: 'pad-c', x: 8, y: -3 }),
		] as const;
		const builder = createRuntimeCopperPlanBuilder(createReader(primitives));

		const result = await builder.buildWriterInput(createDaisyChainRequest());
		const expectedPolygons = buildSkeletonOffsetPolygons({
			segments: planDaisyChainBackbone(toPadNodes(primitives), {
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}).segments,
			width: 2,
		});

		expect(result.polygons).toEqual(expectedPolygons);
	});

	test('rejects manual daisy-chain requests without a trunk end point', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 2, y: 2 }),
				createPad({ id: 'pad-b', x: 6, y: 4 }),
			]),
		);

		await expect(
			builder.buildWriterInput({
				width: 2,
				keepoutMargin: 0,
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
			} as unknown as SmartCopperPourPreviewRequest),
		).rejects.toThrow('Daisy Chain mode requires a valid trunk end point.');
	});

	test('rejects manual daisy-chain requests with an invalid trunk end point', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 2, y: 2 }),
				createPad({ id: 'pad-b', x: 6, y: 4 }),
			]),
		);

		await expect(
			builder.buildWriterInput({
				width: 2,
				keepoutMargin: 0,
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
				trunkEnd: { x: Number.NaN, y: 0 },
			} as unknown as SmartCopperPourPreviewRequest),
		).rejects.toThrow('Daisy Chain mode requires a valid trunk end point.');
	});

	test('rejects daisy-chain requests without trunkMode instead of falling back to auto', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 2, y: 2 }),
				createPad({ id: 'pad-b', x: 6, y: 4 }),
			]),
		);

		await expect(
			builder.buildWriterInput({
				width: 2,
				keepoutMargin: 0,
				topologyMode: TopologyMode.DaisyChain,
			} as unknown as SmartCopperPourPreviewRequest),
		).rejects.toThrow('Daisy Chain mode requires trunkMode to be either manual or auto.');
	});

	test('rejects daisy-chain requests with an invalid trunkMode instead of falling back to auto', async () => {
		const builder = createRuntimeCopperPlanBuilder(
			createReader([
				createPad({ id: 'pad-a', x: 2, y: 2 }),
				createPad({ id: 'pad-b', x: 6, y: 4 }),
			]),
		);

		await expect(
			builder.buildWriterInput({
				width: 2,
				keepoutMargin: 0,
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'bogus',
			} as unknown as SmartCopperPourPreviewRequest),
		).rejects.toThrow('Daisy Chain mode requires trunkMode to be either manual or auto.');
	});

  test('does not fall back to a placeholder square', async () => {
    const builder = createRuntimeCopperPlanBuilder(
      createReader([
        createPad({ id: 'pad-a', x: 1, y: 1 }),
        createPad({ id: 'pad-b', x: 5, y: 1 }),
        createPad({ id: 'pad-c', x: 1, y: 5 }),
      ]),
    );

    const result = await builder.buildWriterInput(createTreeRequest());

    const resultBounds = bounds(result.polygons);

    expect(resultBounds.minX).toBeLessThan(1);
    expect(resultBounds.maxX).toBeGreaterThan(5);
    expect(resultBounds.minY).toBeLessThan(1);
    expect(resultBounds.maxY).toBeGreaterThan(5);
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
