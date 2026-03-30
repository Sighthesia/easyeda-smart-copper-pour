import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { planStarArea } from '../../src/domain/star-area-planner';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
});

describe('star area planner', () => {
	test('builds a convex hull by default', () => {
		const plan = planStarArea([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 2, 5), createPad('pad-d', 2, 2)]);

		expect(plan.outline.vertices).toEqual([
			{ x: 0, y: 0 },
			{ x: 6, y: 0 },
			{ x: 2, y: 5 },
		]);
	});

	test('supports bounding-box outlines', () => {
		const plan = planStarArea([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 2, 5)], { areaShape: 'boundingBox' });

		expect(plan.outline.vertices).toEqual([
			{ x: 0, y: 0 },
			{ x: 6, y: 0 },
			{ x: 6, y: 5 },
			{ x: 0, y: 5 },
		]);
	});
});
