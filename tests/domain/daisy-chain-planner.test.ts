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
	test('orders pad branches by trunk projection distance in manual mode', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 9, 3),
				createPad('pad-a', 2, 1),
				createPad('pad-b', 6, -2),
			],
			{ trunkMode: 'manual', trunkStart: { x: 0, y: 0 }, trunkEnd: { x: 10, y: 0 } },
		);

		expect(plan.mode).toBe(TopologyMode.DaisyChain);
		expect(plan.segments).toEqual([
			{ start: { x: 0, y: 0 }, end: { x: 10, y: 0 }, role: 'trunk' },
			{ start: { x: 2, y: 0 }, end: { x: 2, y: 1 }, role: 'branch' },
			{ start: { x: 6, y: 0 }, end: { x: 6, y: -2 }, role: 'branch' },
			{ start: { x: 9, y: 0 }, end: { x: 9, y: 3 }, role: 'branch' },
		]);
	});

	test('derives a horizontal trunk in auto mode', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 8, 3),
				createPad('pad-a', 1, 1),
				createPad('pad-b', 4, 5),
			],
			{ trunkMode: 'auto', trunkBias: 'horizontal' },
		);

		expect(plan.segments).toEqual([
			{ start: { x: 1, y: 3 }, end: { x: 8, y: 3 }, role: 'trunk' },
			{ start: { x: 1, y: 3 }, end: { x: 1, y: 1 }, role: 'branch' },
			{ start: { x: 4, y: 3 }, end: { x: 4, y: 5 }, role: 'branch' },
		]);
	});

	test('derives a vertical trunk in auto mode', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 2, 9),
				createPad('pad-a', 1, 1),
				createPad('pad-b', 5, 4),
			],
			{ trunkMode: 'auto', trunkBias: 'vertical' },
		);

		expect(plan.segments).toEqual([
			{ start: { x: 8 / 3, y: 1 }, end: { x: 8 / 3, y: 9 }, role: 'trunk' },
			{ start: { x: 8 / 3, y: 1 }, end: { x: 1, y: 1 }, role: 'branch' },
			{ start: { x: 8 / 3, y: 4 }, end: { x: 5, y: 4 }, role: 'branch' },
			{ start: { x: 8 / 3, y: 9 }, end: { x: 2, y: 9 }, role: 'branch' },
		]);
	});

	test('uses the larger spread axis for neutral auto mode', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 4, 8),
				createPad('pad-a', 3, 1),
				createPad('pad-b', 5, 5),
			],
			{ trunkMode: 'auto', trunkBias: 'neutral' },
		);

		expect(plan.segments[0]).toEqual({
			start: { x: 4, y: 1 },
			end: { x: 4, y: 8 },
			role: 'trunk',
		});
	});

	test('falls back to the x axis when neutral auto mode ties', () => {
		const plan = planDaisyChainBackbone(
			[
				createPad('pad-c', 8, 8),
				createPad('pad-a', 2, 2),
				createPad('pad-b', 5, 5),
			],
			{ trunkMode: 'auto', trunkBias: 'neutral' },
		);

		expect(plan.segments[0]).toEqual({
			start: { x: 2, y: 5 },
			end: { x: 8, y: 5 },
			role: 'trunk',
		});
	});

	test('returns no segments when trunk is degenerate', () => {
		expect(
			planDaisyChainBackbone([createPad('pad-a', 1, 1)], { trunkMode: 'manual', trunkStart: { x: 0, y: 0 }, trunkEnd: { x: 0, y: 0 } }),
		).toEqual({ mode: TopologyMode.DaisyChain, segments: [] });
	});
});
