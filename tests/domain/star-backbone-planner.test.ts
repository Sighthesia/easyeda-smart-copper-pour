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

	test('uses a selected pad as the default hub', () => {
		const plan = planStarBackbone([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 0, 6)]);

		expect(plan.mode).toBe(TopologyMode.Star);
		expect(plan.hub).toEqual({ x: 0, y: 0 });
		expect(plan.segments).toEqual([
			{
				start: { x: 0, y: 0 },
				end: { x: 6, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 0, y: 0 },
				end: { x: 0, y: 6 },
				role: 'branch',
			},
		]);
	});

	test('prefers the selected pad with the shortest total branch distance when bias is neutral', () => {
		const plan = planStarBackbone([createPad('pad-a', 0, 0), createPad('pad-b', 4, 0), createPad('pad-c', 1, 1)], { trunkBias: 'neutral' });

		expect(plan.hub).toEqual({ x: 1, y: 1 });
		expect(plan.segments).toEqual([
			{
				start: { x: 1, y: 1 },
				end: { x: 0, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 1, y: 1 },
				end: { x: 4, y: 0 },
				role: 'branch',
			},
		]);
	});

	test('lets horizontal trunk bias flip the hub when total distances stay within the near-tie threshold', () => {
		const unbiasedPlan = planStarBackbone([
			createPad('pad-a', 0, 0.29),
			createPad('pad-b', 0, 0),
			createPad('pad-c', -1.8, 0),
			createPad('pad-d', 1.8, 0),
			createPad('pad-e', 0, 4),
		]);

		const biasedPlan = planStarBackbone(
			[
				createPad('pad-a', 0, 0.29),
				createPad('pad-b', 0, 0),
				createPad('pad-c', -1.8, 0),
				createPad('pad-d', 1.8, 0),
				createPad('pad-e', 0, 4),
			],
			{ trunkBias: 'horizontal' },
		);

		expect(unbiasedPlan.hub).toEqual({ x: 0, y: 0.29 });
		expect(biasedPlan.hub).toEqual({ x: 0, y: 0 });
	});

	test('lets vertical trunk bias flip the hub when total distances stay within the near-tie threshold', () => {
		const unbiasedPlan = planStarBackbone([
			createPad('pad-a', 0.29, 0),
			createPad('pad-b', 0, 0),
			createPad('pad-c', 0, -1.8),
			createPad('pad-d', 0, 1.8),
			createPad('pad-e', 4, 0),
		]);

		const biasedPlan = planStarBackbone(
			[
				createPad('pad-a', 0.29, 0),
				createPad('pad-b', 0, 0),
				createPad('pad-c', 0, -1.8),
				createPad('pad-d', 0, 1.8),
				createPad('pad-e', 4, 0),
			],
			{ trunkBias: 'vertical' },
		);

		expect(unbiasedPlan.hub).toEqual({ x: 0.29, y: 0 });
		expect(biasedPlan.hub).toEqual({ x: 0, y: 0 });
	});

	test('keeps the shortest-total-distance hub when the gap exceeds the near-tie threshold', () => {
		const plan = planStarBackbone(
			[
				createPad('pad-a', 0, 0.35),
				createPad('pad-b', 0, 0),
				createPad('pad-c', -1.8, 0),
				createPad('pad-d', 1.8, 0),
				createPad('pad-e', 0, 4),
			],
			{ trunkBias: 'horizontal' },
		);

		expect(plan.hub).toEqual({ x: 0, y: 0.35 });
	});

	test('orders output segments deterministically by pad id', () => {
		const plan = planStarBackbone([createPad('pad-c', 0, 6), createPad('pad-a', 0, 0), createPad('pad-b', 6, 0)]);

		expect(plan.segments.map((segment) => segment.end)).toEqual([
			{ x: 6, y: 0 },
			{ x: 0, y: 6 },
		]);
	});

	test('keeps co-located non-hub pads as branches', () => {
		const plan = planStarBackbone([createPad('pad-a', 0, 0), createPad('pad-b', 0, 0), createPad('pad-c', 4, 0)], { hubPadId: 'pad-a' });

		expect(plan.segments).toEqual([
			{
				start: { x: 0, y: 0 },
				end: { x: 0, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 0, y: 0 },
				end: { x: 4, y: 0 },
				role: 'branch',
			},
		]);
	});

	test('can anchor the hub on a specific source pad', () => {
		const plan = planStarBackbone([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 0, 6)], { hubPadId: 'pad-b' });

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

	test('throws when the requested hub pad does not exist', () => {
		expect(() =>
			planStarBackbone([createPad('pad-a', 0, 0), createPad('pad-b', 6, 0), createPad('pad-c', 0, 6)], { hubPadId: 'pad-missing' }),
		).toThrow('Star hub pad not found: pad-missing');
	});
});
