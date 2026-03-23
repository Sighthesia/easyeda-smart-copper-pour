import { describe, expect, test } from 'vitest';

import type { SkeletonObstacle, SkeletonSegment } from '../../src/domain/skeleton-types';
import { optimizeSkeletonClearance } from '../../src/domain/clearance-optimizer';

const createObstacle = (vertices: ReadonlyArray<{ x: number; y: number }>): SkeletonObstacle => ({
	outline: {
		vertices,
	},
});

describe('clearance optimizer', () => {
	test('stops growth before obstacle collision', () => {
		const segments: SkeletonSegment[] = [
			{
				start: { x: 0, y: 0 },
				end: { x: 10, y: 0 },
				role: 'trunk',
			},
		];

		const obstacle = createObstacle([
			{ x: 0, y: 2.6 },
			{ x: 10, y: 2.6 },
			{ x: 10, y: 6 },
			{ x: 0, y: 6 },
		]);

		expect(
			optimizeSkeletonClearance({
				segments,
				baseWidth: 2,
				maxWidth: 6,
				widthStep: 1,
				keepoutMargin: 0.5,
				obstacles: [obstacle],
			}),
		).toEqual({
			width: 4,
			collided: true,
		});
	});
});
