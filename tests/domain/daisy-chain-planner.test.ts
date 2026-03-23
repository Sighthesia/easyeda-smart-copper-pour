import { describe, expect, test } from 'vitest';

import type { PadNode } from '../../src/domain/pad-node';
import { planDaisyChainBackbone } from '../../src/domain/daisy-chain-planner';
import { TopologyMode } from '../../src/domain/topology-mode';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
});

describe('daisy chain planner', () => {
	test('orders pad branches by trunk projection distance', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 9, 3),
				createPad('pad-a', 2, 1),
				createPad('pad-b', 6, -2),
			],
			{ trunkStart: { x: 0, y: 0 }, trunkEnd: { x: 10, y: 0 } },
		);

		expect(plan.mode).toBe(TopologyMode.DaisyChain);
		expect(plan.segments).toEqual([
			{ start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, role: 'trunk' },
			{ start: { x: 2, y: 0 }, end: { x: 2, y: 1 }, role: 'branch' },
			{ start: { x: 6, y: 0 }, end: { x: 6, y: -2 }, role: 'branch' },
			{ start: { x: 9, y: 0 }, end: { x: 9, y: 3 }, role: 'branch' },
		]);
	});

	test('returns no segments when trunk is degenerate', () => {
		expect(
			planDaisyChainBackbone([createPad('pad-a', 1, 1)], { trunkStart: { x: 0, y: 0 }, trunkEnd: { x: 0, y: 0 } }),
		).toEqual({ mode: TopologyMode.DaisyChain, segments: [] });
	});
});
