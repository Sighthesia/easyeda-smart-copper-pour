import { describe, expect, test } from 'vitest';

import { planDaisyChainBackbone } from '../../src/domain/daisy-chain-planner';
import type { PadNode } from '../../src/domain/pad-node';
import { TopologyMode } from '../../src/domain/topology-mode';

const createPad = (id: string, x: number, y: number): PadNode => ({
	id,
	net: 'VCC',
	layer: 'TopLayer',
	center: { x, y },
	effectiveRadius: 1,
});

describe('daisy chain planner', () => {
	test('derives a horizontal trunk in auto mode', () => {
		const plan = planDaisyChainBackbone([createPad('pad-c', 8, 3), createPad('pad-a', 1, 1), createPad('pad-b', 4, 5)], {
			trunkBias: 'horizontal',
		});

		expect(plan.mode).toBe(TopologyMode.DaisyChain);
		expect(plan.segments).toEqual([
			{ start: { x: 1, y: 3 }, end: { x: 8, y: 3 }, role: 'trunk' },
			{ start: { x: 1, y: 3 }, end: { x: 1, y: 1 }, role: 'branch' },
			{ start: { x: 4, y: 3 }, end: { x: 4, y: 5 }, role: 'branch' },
		]);
	});

	test('uses the larger spread axis for neutral mode', () => {
		const plan = planDaisyChainBackbone([createPad('pad-c', 4, 8), createPad('pad-a', 3, 1), createPad('pad-b', 5, 5)], { trunkBias: 'neutral' });

		expect(plan.segments[0]).toEqual({
			start: { x: 4, y: 1 },
			end: { x: 4, y: 8 },
			role: 'trunk',
		});
	});

	test('returns no segments for fewer than two pads', () => {
		expect(planDaisyChainBackbone([createPad('pad-a', 1, 1)])).toEqual({ mode: TopologyMode.DaisyChain, segments: [] });
	});
});
