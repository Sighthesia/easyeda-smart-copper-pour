import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { planStarArea } from '../../src/domain/star-area-planner';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
	width: 2,
	height: 2,
	outlineShape: 'rect',
});

describe('star area planner', () => {
	test('builds a convex hull from node outlines by default', () => {
		const plan = planStarArea([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 2, 5), createPad('pad-d', 2, 2)]);

		expect(plan.outline.vertices).toContainEqual({ x: -1, y: -1 });
		expect(plan.outline.vertices).toContainEqual({ x: 7, y: -1 });
		expect(plan.outline.vertices).toContainEqual({ x: 3, y: 6 });
	});

	test('supports center-based outlines when node size is disabled', () => {
		const plan = planStarArea([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 2, 5)], {
			useNodeSizeAsBaseWidth: false,
		});

		expect(plan.outline.vertices).toEqual([
			{ x: 0, y: 0 },
			{ x: 6, y: 0 },
			{ x: 2, y: 5 },
		]);
	});

	test('supports bounding-box outlines', () => {
		const plan = planStarArea([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 2, 5)], { areaShape: 'boundingBox' });

		expect(plan.outline.vertices).toEqual([
			{ x: -1, y: -1 },
			{ x: 7, y: -1 },
			{ x: 7, y: 6 },
			{ x: -1, y: 6 },
		]);
	});
});
