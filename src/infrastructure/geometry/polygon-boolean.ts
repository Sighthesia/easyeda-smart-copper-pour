import ClipperLib from 'clipper-lib';

import type { SkeletonPoint, SkeletonPolygon } from '../../domain/skeleton-types';

interface ClipperPoint {
	X: number;
	Y: number;
}

// FIXME: Revisit scaling if later tasks need finer-than-0.001 geometry precision.
const CLIPPER_SCALE = 1000;

/**
 * Unions overlapping polygon shells into normalized copper islands.
 *
 * @param polygons
 * - Closed polygon shells in planner coordinates.
 *
 * @returns
 * - One or more normalized polygons after union.
 *
 * @public
 */
export const unionSkeletonPolygons = (polygons: ReadonlyArray<SkeletonPolygon>): SkeletonPolygon[] =>
	executeClipperBoolean(polygons, [], ClipperLib.ClipType.ctUnion);

/**
 * Subtracts keepout polygons from a copper candidate.
 *
 * @param subjectPolygons
 * - Copper polygons that should remain after subtraction.
 *
 * @param clipPolygons
 * - Keepout polygons that should be removed.
 *
 * @returns
 * - Difference polygons in planner coordinates.
 *
 * @public
 */
export const subtractSkeletonPolygons = (
	subjectPolygons: ReadonlyArray<SkeletonPolygon>,
	clipPolygons: ReadonlyArray<SkeletonPolygon>,
): SkeletonPolygon[] => executeClipperBoolean(subjectPolygons, clipPolygons, ClipperLib.ClipType.ctDifference);

const executeClipperBoolean = (
	subjectPolygons: ReadonlyArray<SkeletonPolygon>,
	clipPolygons: ReadonlyArray<SkeletonPolygon>,
	clipType: number,
): SkeletonPolygon[] => {
	if (subjectPolygons.length === 0) {
		return [];
	}

	const clipper = new ClipperLib.Clipper();
	clipper.AddPaths(toClipperPaths(subjectPolygons), ClipperLib.PolyType.ptSubject, true);

	if (clipPolygons.length > 0) {
		clipper.AddPaths(toClipperPaths(clipPolygons), ClipperLib.PolyType.ptClip, true);
	}

	const solution = new ClipperLib.Paths();
	clipper.Execute(clipType, solution, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

	return fromClipperPaths(solution);
};

const toClipperPaths = (polygons: ReadonlyArray<SkeletonPolygon>): ClipperPoint[][] =>
	polygons.map((polygon) => polygon.vertices.map(toClipperPoint));

const fromClipperPaths = (paths: ReadonlyArray<ReadonlyArray<ClipperPoint>>): SkeletonPolygon[] =>
	paths.filter((path) => path.length >= 3).map((path) => ({ vertices: path.map(fromClipperPoint) }));

const toClipperPoint = (point: SkeletonPoint): ClipperPoint => ({
	X: scaleValue(point.x),
	Y: scaleValue(point.y),
});

const fromClipperPoint = (point: ClipperPoint): SkeletonPoint => ({
	x: unscaleValue(point.X),
	y: unscaleValue(point.Y),
});

const scaleValue = (value: number): number => Math.round(value * CLIPPER_SCALE);

const unscaleValue = (value: number): number => value / CLIPPER_SCALE;
