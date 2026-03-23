import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { planStarBackbone } from '../../src/domain/star-backbone-planner';
import { TopologyMode } from '../../src/domain/topology-mode';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
});

describe('star backbone planner', () => {
	test('returns an empty star when no pads are given', () => {
		const plan = planStarBackbone([]);

		expect(plan.mode).toBe(TopologyMode.Star);
		expect(plan.hub).toEqual({ x: 0, y: 0 });
		expect(plan.segments).toEqual([]);
	});

	test('does not emit a zero-length branch for a single pad', () => {
		const plan = planStarBackbone([createPad('pad-a', 3, 4)]);

		expect(plan.hub).toEqual({ x: 3, y: 4 });
		expect(plan.segments).toEqual([]);
	});

	test('connects every pad to the centroid hub by default', () => {
		const plan = planStarBackbone([
			createPad('pad-a', 0, 0),
			createPad('pad-b', 6, 0),
			createPad('pad-c', 0, 6),
		]);

		expect(plan.mode).toBe(TopologyMode.Star);
		expect(plan.hub).toEqual({ x: 2, y: 2 });
		expect(plan.segments).toEqual([
			{
				start: { x: 2, y: 2 },
				end: { x: 0, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 2, y: 2 },
				end: { x: 6, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 2, y: 2 },
				end: { x: 0, y: 6 },
				role: 'branch',
			},
		]);
	});

	test('orders output segments deterministically by pad id', () => {
		const plan = planStarBackbone([
			createPad('pad-c', 0, 6),
			createPad('pad-a', 0, 0),
			createPad('pad-b', 6, 0),
		]);

			expect(plan.segments.map((segment) => segment.end)).toEqual([
			{ x: 0, y: 0 },
			{ x: 6, y: 0 },
			{ x: 0, y: 6 },
		]);
	});

	test('can anchor the hub on a specific source pad', () => {
		const plan = planStarBackbone(
			[
				createPad('pad-a', 0, 0),
				createPad('pad-b', 6, 0),
				createPad('pad-c', 0, 6),
			],
			{ hubPadId: 'pad-b' },
		);

		expect(plan.hub).toEqual({ x: 6, y: 0 });
		expect(plan.segments).toEqual([
			{
				start: { x: 6, y: 0 },
				end: { x: 0, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 6, y: 0 },
				end: { x: 0, y: 6 },
				role: 'branch',
			},
		]);
	});
});
