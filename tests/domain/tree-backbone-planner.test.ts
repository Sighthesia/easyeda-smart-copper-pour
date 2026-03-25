import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { planTreeBackbone } from '../../src/domain/tree-backbone-planner';
import { TopologyMode } from '../../src/domain/topology-mode';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
});

describe('tree backbone planner', () => {
	test('returns no segments for fewer than two pads', () => {
		expect(planTreeBackbone([]).segments).toEqual([]);
		expect(planTreeBackbone([createPad('pad-a', 0, 0)]).segments).toEqual([]);
	});

	test('builds a deterministic mst with stable tie-breaking', () => {
		const plan = planTreeBackbone([
			createPad('pad-a', 0, 0),
			createPad('pad-b', 2, 0),
			createPad('pad-c', 0, 2),
			createPad('pad-d', 2, 2),
		]);

		expect(plan.mode).toBe(TopologyMode.Tree);
		expect(plan.segments).toEqual([
			{
				start: { x: 0, y: 0 },
				end: { x: 2, y: 0 },
				role: 'branch',
			},
			{
				start: { x: 0, y: 0 },
				end: { x: 0, y: 2 },
				role: 'branch',
			},
			{
				start: { x: 2, y: 0 },
				end: { x: 2, y: 2 },
				role: 'branch',
			},
		]);
	});

	test('produces the same mst regardless of input order', () => {
		const orderedPlan = planTreeBackbone([
			createPad('pad-a', 0, 0),
			createPad('pad-b', 2, 0),
			createPad('pad-c', 0, 2),
			createPad('pad-d', 2, 2),
		]);

		const shuffledPlan = planTreeBackbone([
			createPad('pad-d', 2, 2),
			createPad('pad-b', 2, 0),
			createPad('pad-c', 0, 2),
			createPad('pad-a', 0, 0),
		]);

		expect(shuffledPlan).toEqual(orderedPlan);
	});

	test('prefers flatter edges when horizontal trunk bias is enabled', () => {
		const plan = planTreeBackbone(
			[
				createPad('pad-a', 0, 0),
				createPad('pad-b', 4, 0.1),
				createPad('pad-c', 0.1, 4),
			],
			{ trunkBias: 'horizontal' },
		);

		expect(plan.segments[0]).toEqual({
			start: { x: 0, y: 0 },
			end: { x: 4, y: 0.1 },
			role: 'branch',
		});
	});

	test('prefers taller edges when vertical trunk bias is enabled', () => {
		const plan = planTreeBackbone(
			[
				createPad('pad-a', 0, 0),
				createPad('pad-b', 4, 0.1),
				createPad('pad-c', 0.1, 4),
			],
			{ trunkBias: 'vertical' },
		);

		expect(plan.segments[0]).toEqual({
			start: { x: 0, y: 0 },
			end: { x: 0.1, y: 4 },
			role: 'branch',
		});
	});

	test('lets vertical trunk bias flip the first edge when distances are within the near-tie threshold', () => {
		const unbiasedPlan = planTreeBackbone([
			createPad('pad-a', 0, 0),
			createPad('pad-b', 4, 0.2),
			createPad('pad-c', 0.2, 4.15),
		]);

		const biasedPlan = planTreeBackbone(
			[
				createPad('pad-a', 0, 0),
				createPad('pad-b', 4, 0.2),
				createPad('pad-c', 0.2, 4.15),
			],
			{ trunkBias: 'vertical' },
		);

		expect(unbiasedPlan.segments[0]).toEqual({
			start: { x: 0, y: 0 },
			end: { x: 4, y: 0.2 },
			role: 'branch',
		});

		expect(biasedPlan.segments[0]).toEqual({
			start: { x: 0, y: 0 },
			end: { x: 0.2, y: 4.15 },
			role: 'branch',
		});
	});

	test('keeps the shortest edge when the distance gap exceeds the near-tie threshold', () => {
		const plan = planTreeBackbone(
			[
				createPad('pad-a', 0, 0),
				createPad('pad-b', 4, 0.2),
				createPad('pad-c', 0.2, 4.4),
			],
			{ trunkBias: 'vertical' },
		);

		expect(plan.segments[0]).toEqual({
			start: { x: 0, y: 0 },
			end: { x: 4, y: 0.2 },
			role: 'branch',
		});
	});
});
