import { describe, expect, test, vi } from 'vitest';

import { createLcedaNetObstacleResolver } from '../../../src/infrastructure/lceda/net-obstacle-resolver';

describe('createLcedaNetObstacleResolver', () => {
	test('ignores same-net primitives and converts foreign-net boxes to obstacles', async () => {
		const resolver = createLcedaNetObstacleResolver({
			listSameLayerPrimitives: vi.fn(async () => [
				{ id: 'same-net', layer: 'TopLayer', net: 'VCC', x: 0, y: 0, width: 2, height: 2 },
				{ id: 'foreign-net', layer: 'TopLayer', net: 'GND', x: 5, y: 5, width: 4, height: 2 },
			]),
		});

		await expect(resolver.resolveObstacles({ layerName: 'TopLayer', netName: 'VCC' })).resolves.toEqual([
			{
				outline: {
					vertices: [
						{ x: 3, y: 4 },
						{ x: 7, y: 4 },
						{ x: 7, y: 6 },
						{ x: 3, y: 6 },
					],
				},
			},
		]);
	});

	test('returns explicit outlines unchanged and skips unusable primitives', async () => {
		const resolver = createLcedaNetObstacleResolver({
			listSameLayerPrimitives: vi.fn(async () => [
				{ id: 'outline', layer: 'TopLayer', net: 'GND', outline: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 2 }] },
				{ id: 'invalid', layer: 'TopLayer', net: 'GND' },
			]),
		});

		await expect(resolver.resolveObstacles({ layerName: 'TopLayer', netName: 'VCC' })).resolves.toEqual([
			{
				outline: {
					vertices: [
						{ x: 0, y: 0 },
						{ x: 2, y: 0 },
						{ x: 1, y: 2 },
					],
				},
			},
		]);
	});
});
