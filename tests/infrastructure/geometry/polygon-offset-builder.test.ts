import { describe, expect, test } from 'vitest';

import type { SkeletonPolygon, SkeletonSegment } from '../../../src/domain/skeleton-types';
import { buildSkeletonOffsetPolygons } from '../../../src/infrastructure/geometry/polygon-offset-builder';

const createSegment = (startX: number, startY: number, endX: number, endY: number): SkeletonSegment => ({
	start: { x: startX, y: startY },
	end: { x: endX, y: endY },
	role: 'branch',
});

const getBounds = (polygon: SkeletonPolygon) => {
	const xs = polygon.vertices.map((vertex) => vertex.x);
	const ys = polygon.vertices.map((vertex) => vertex.y);

	return {
		minX: Math.min(...xs),
		maxX: Math.max(...xs),
		minY: Math.min(...ys),
		maxY: Math.max(...ys),
	};
};

describe('buildSkeletonOffsetPolygons', () => {
	test('strokes a single segment into one polygon', () => {
		const polygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0)],
			width: 2,
		});

		expect(polygons).toHaveLength(1);
		expect(getBounds(polygons[0])).toEqual({
			minX: -1,
			maxX: 5,
			minY: -1,
			maxY: 1,
		});
	});

	test('falls back to bevel corners by default', () => {
		const polygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
		});
		const bevelPolygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
			cornerStyle: 'bevel',
		});
		const roundPolygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
			cornerStyle: 'round',
		});

		expect(polygons).toHaveLength(1);
		expect(bevelPolygons).toHaveLength(1);
		expect(roundPolygons).toHaveLength(1);
		expect(getBounds(polygons[0])).toEqual({
			minX: -1,
			maxX: 5,
			minY: -1,
			maxY: 4,
		});
		expect(polygons[0].vertices).toEqual(bevelPolygons[0].vertices);
		expect(polygons[0].vertices.length).toBeLessThan(roundPolygons[0].vertices.length);
	});

	test('supports explicit bevel corners without splitting the island', () => {
		const polygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
			cornerStyle: 'bevel',
		});

		expect(polygons).toHaveLength(1);
		expect(getBounds(polygons[0])).toEqual({
			minX: -1,
			maxX: 5,
			minY: -1,
			maxY: 4,
		});
	});

	test('unions overlapping stroked segments into one island', () => {
		const polygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(2, 0, 6, 0)],
			width: 2,
		});

		expect(polygons).toHaveLength(1);
		expect(getBounds(polygons[0])).toEqual({
			minX: -1,
			maxX: 7,
			minY: -1,
			maxY: 1,
		});
	});
});
