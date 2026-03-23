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

	test('strokes connected segments into one rounded polygon by default', () => {
		const polygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
		});
		const miterPolygons = buildSkeletonOffsetPolygons({
			segments: [createSegment(0, 0, 4, 0), createSegment(4, 0, 4, 3)],
			width: 2,
			cornerStyle: 'miter',
		});

		expect(polygons).toHaveLength(1);
		expect(getBounds(polygons[0])).toEqual({
			minX: -1,
			maxX: 5,
			minY: -1,
			maxY: 4,
		});
		expect(miterPolygons).toHaveLength(1);
		expect(polygons[0].vertices.length).toBeGreaterThan(miterPolygons[0].vertices.length);
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
