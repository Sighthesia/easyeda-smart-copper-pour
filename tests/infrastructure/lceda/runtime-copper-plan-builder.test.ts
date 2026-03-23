import { describe, expect, test } from 'vitest';

import { TopologyMode } from '../../../src/domain/topology-mode';
import type { LcedaSelectablePrimitive } from '../../../src/infrastructure/lceda/selection-resolver';
import { createRuntimeCopperPlanBuilder } from '../../../src/infrastructure/lceda/runtime-copper-plan-builder';

const createPad = (overrides: Partial<LcedaSelectablePrimitive> = {}): LcedaSelectablePrimitive => ({
  id: 'pad-a',
  type: 'PAD',
  net: ' VCC ',
  layer: ' TopLayer ',
  x: 0,
  y: 0,
  holeRadius: 0,
  padRadius: 1,
  ...overrides,
});

const createReader = (primitives: readonly LcedaSelectablePrimitive[]) => ({
  readSelectedPrimitives: async () => primitives,
});

const createTreeRequest = () => ({
  topologyMode: TopologyMode.Tree,
  width: 2,
  keepoutMargin: 0,
});

const createStarRequest = () => ({
  topologyMode: TopologyMode.Star,
  width: 2,
  keepoutMargin: 0,
});

const createDaisyChainRequest = () => ({
  topologyMode: TopologyMode.DaisyChain,
  width: 2,
  keepoutMargin: 0,
  trunkStart: { x: 0, y: 0 },
  trunkEnd: { x: 10, y: 0 },
});

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
      }),
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

  test('uses different topology plans for tree and star requests', async () => {
    const builder = createRuntimeCopperPlanBuilder(
      createReader([
        createPad({ id: 'pad-a', x: 0, y: 0 }),
        createPad({ id: 'pad-b', x: 6, y: 0 }),
        createPad({ id: 'pad-c', x: 0, y: 6 }),
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
