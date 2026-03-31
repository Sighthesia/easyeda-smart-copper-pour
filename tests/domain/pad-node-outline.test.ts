import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { buildPadNodeOutline } from '../../src/domain/pad-node-outline';

const createNode = (overrides: Partial<PadNode> = {}): PadNode => ({
	id: 'node-1',
	net: 'VCC',
	layer: 'TopLayer',
	center: { x: 10, y: 20 },
	effectiveRadius: 2,
	width: 4,
	height: 4,
	outlineShape: 'rect',
	...overrides,
});

describe('buildPadNodeOutline', () => {
	test('expands rectangular nodes into their four real corners', () => {
		const outline = buildPadNodeOutline(
			createNode({
				center: { x: 5, y: 6 },
				width: 8,
				height: 4,
				outlineShape: 'rect',
			}),
			{ cornerStyle: 'bevel45' },
		);

		expect(outline.vertices).toEqual([
			{ x: 1, y: 4 },
			{ x: 9, y: 4 },
			{ x: 9, y: 8 },
			{ x: 1, y: 8 },
		]);
	});

	test('samples ellipse perimeter from node width, height, and center', () => {
		const outline = buildPadNodeOutline(
			createNode({
				center: { x: 0, y: 0 },
				width: 6,
				height: 4,
				outlineShape: 'ellipse',
			}),
		);

		expect(outline.vertices).toHaveLength(24);
		expect(hasPointNear(outline.vertices, { x: 3, y: 0 })).toBe(true);
		expect(hasPointNear(outline.vertices, { x: 0, y: 2 })).toBe(true);
		expect(hasPointNear(outline.vertices, { x: -3, y: 0 })).toBe(true);
		expect(hasPointNear(outline.vertices, { x: 0, y: -2 })).toBe(true);
	});
});

const hasPointNear = (points: ReadonlyArray<{ x: number; y: number }>, target: { x: number; y: number }, epsilon = 0.001): boolean => {
	return points.some((point) => Math.abs(point.x - target.x) <= epsilon && Math.abs(point.y - target.y) <= epsilon);
};
