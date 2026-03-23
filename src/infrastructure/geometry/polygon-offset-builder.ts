import type { SmartCopperPourCornerStyle } from '../../application/smart-copper-pour-contract';
import type { SkeletonPoint, SkeletonPolygon, SkeletonSegment } from '../../domain/skeleton-types';

import { unionSkeletonPolygons } from './polygon-boolean';

const ClipperLib = require('clipper-lib');

type ClipperPoint = {
	X: number;
	Y: number;
};

// FIXME: Revisit scaling if later tasks need finer-than-0.001 geometry precision.
const CLIPPER_SCALE = 1000;

/**
 * Geometry builder options for turning skeleton lines into copper polygons.
 *
 * @public
 */
export interface BuildSkeletonOffsetPolygonsOptions {
	segments: ReadonlyArray<SkeletonSegment>;
	width: number;
	cornerStyle?: SmartCopperPourCornerStyle;
}

/**
 * Strokes skeleton centerlines into one or more copper polygons.
 *
 * @param options
 * - Segment list, copper width, and optional corner style.
 *
 * @returns
 * - Normalized polygon shells ready for later keepout subtraction.
 *
 * @public
 */
export const buildSkeletonOffsetPolygons = (options: BuildSkeletonOffsetPolygonsOptions): SkeletonPolygon[] => {
	const strokeRadius = options.width / 2;

	if (options.segments.length === 0 || strokeRadius <= 0) {
		return [];
	}

	const cornerStyle = options.cornerStyle ?? 'round';
	const strokedPolygons = buildStrokePaths(options.segments).flatMap((path) => strokePath(path, strokeRadius, cornerStyle));

	return unionSkeletonPolygons(strokedPolygons);
};

const strokePath = (
	path: ReadonlyArray<SkeletonPoint>,
	strokeRadius: number,
	cornerStyle: SmartCopperPourCornerStyle,
): SkeletonPolygon[] => {
	if (path.length < 2) {
		return [];
	}

	const offset = new ClipperLib.ClipperOffset();
	offset.AddPath(path.map(toClipperPoint), resolveJoinType(cornerStyle), resolveEndType());

	const solution = new ClipperLib.Paths();
	offset.Execute(solution, scaleValue(strokeRadius));

	return solution.filter((path: ReadonlyArray<ClipperPoint>) => path.length >= 3).map((path: ReadonlyArray<ClipperPoint>) => ({
		vertices: path.map(fromClipperPoint),
	}));
};

const buildStrokePaths = (segments: ReadonlyArray<SkeletonSegment>): ReadonlyArray<ReadonlyArray<SkeletonPoint>> => {
	const normalizedSegments = segments.filter((segment) => !isZeroLengthSegment(segment));
	const adjacency = new Map<string, number[]>();
	const visited = new Set<number>();

	for (let index = 0; index < normalizedSegments.length; index += 1) {
		const segment = normalizedSegments[index];
		pushEdge(adjacency, toPointKey(segment.start), index);
		pushEdge(adjacency, toPointKey(segment.end), index);
	}

	const paths: SkeletonPoint[][] = [];
	for (const [pointKey, edgeIndexes] of adjacency.entries()) {
		if (edgeIndexes.length === 2) {
			continue;
		}

		for (const edgeIndex of edgeIndexes) {
			if (visited.has(edgeIndex)) {
				continue;
			}

			paths.push(tracePath(normalizedSegments, adjacency, visited, pointKey, edgeIndex));
		}
	}

	for (let index = 0; index < normalizedSegments.length; index += 1) {
		if (visited.has(index)) {
			continue;
		}

		const segment = normalizedSegments[index];
		paths.push(tracePath(normalizedSegments, adjacency, visited, toPointKey(segment.start), index));
	}

	return paths;
};

const tracePath = (
	segments: ReadonlyArray<SkeletonSegment>,
	adjacency: ReadonlyMap<string, number[]>,
	visited: Set<number>,
	startPointKey: string,
	startEdgeIndex: number,
): SkeletonPoint[] => {
	const path: SkeletonPoint[] = [];
	let currentPointKey = startPointKey;
	let currentEdgeIndex: number | undefined = startEdgeIndex;

	while (currentEdgeIndex !== undefined) {
		visited.add(currentEdgeIndex);
		const segment = segments[currentEdgeIndex];
		const startKey = toPointKey(segment.start);
		const endKey = toPointKey(segment.end);
		const nextPoint = startKey === currentPointKey ? segment.end : segment.start;

		if (path.length === 0) {
			path.push(startKey === currentPointKey ? segment.start : segment.end);
		}

		path.push(nextPoint);
		currentPointKey = toPointKey(nextPoint);

		const nextEdgeIndex = (adjacency.get(currentPointKey) ?? []).find((edgeIndex) => !visited.has(edgeIndex));
		currentEdgeIndex = nextEdgeIndex;
	}

	return dedupeSequentialPoints(path);
};

const dedupeSequentialPoints = (points: ReadonlyArray<SkeletonPoint>): SkeletonPoint[] => {
	const deduped: SkeletonPoint[] = [];

	for (const point of points) {
		const lastPoint = deduped[deduped.length - 1];
		if (lastPoint !== undefined && lastPoint.x === point.x && lastPoint.y === point.y) {
			continue;
		}

		deduped.push(point);
	}

	return deduped;
};

const isZeroLengthSegment = (segment: SkeletonSegment): boolean => segment.start.x === segment.end.x && segment.start.y === segment.end.y;

const pushEdge = (adjacency: Map<string, number[]>, pointKey: string, edgeIndex: number): void => {
	const edgeIndexes = adjacency.get(pointKey);
	if (edgeIndexes === undefined) {
		adjacency.set(pointKey, [edgeIndex]);
		return;
	}

	edgeIndexes.push(edgeIndex);
};

const toPointKey = (point: SkeletonPoint): string => `${point.x},${point.y}`;

const resolveJoinType = (cornerStyle: SmartCopperPourCornerStyle): number => {
	switch (cornerStyle) {
		case 'miter':
			return ClipperLib.JoinType.jtMiter;
		case 'bevel':
			return ClipperLib.JoinType.jtSquare;
		case 'round':
		default:
			return ClipperLib.JoinType.jtRound;
	}
};

const resolveEndType = (): number => ClipperLib.EndType.etOpenRound;

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
