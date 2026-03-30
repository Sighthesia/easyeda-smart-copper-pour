import ClipperLib from 'clipper-lib';

import type { SmartCopperPourCornerStyle } from '../../application/smart-copper-pour-contract';
import type { SkeletonPoint, SkeletonPolygon, SkeletonSegment } from '../../domain/skeleton-types';
import { unionSkeletonPolygons } from './polygon-boolean';

interface ClipperPoint {
	X: number;
	Y: number;
}

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

export interface BuildClosedPolygonOffsetPolygonsOptions {
	polygon: SkeletonPolygon;
	width: number;
	cornerStyle?: SmartCopperPourCornerStyle;
}

export interface BuildCornerStyledUnionPolygonsOptions {
	polygons: ReadonlyArray<SkeletonPolygon>;
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

	const cornerStyle = options.cornerStyle ?? 'bevel45';
	const strokedPolygons = buildStrokePaths(options.segments).flatMap((path) => strokePath(path, strokeRadius, cornerStyle));

	return unionSkeletonPolygons(strokedPolygons);
};

export const buildClosedPolygonOffsetPolygons = (options: BuildClosedPolygonOffsetPolygonsOptions): SkeletonPolygon[] => {
	const strokeRadius = options.width / 2;
	if (options.polygon.vertices.length < 3 || strokeRadius <= 0) {
		return [];
	}

	const offset = new ClipperLib.ClipperOffset();
	offset.AddPath(
		options.polygon.vertices.map(toClipperPoint),
		resolveJoinType(options.cornerStyle ?? 'bevel45'),
		ClipperLib.EndType.etClosedPolygon,
	);

	const solution = new ClipperLib.Paths();
	offset.Execute(solution, scaleValue(strokeRadius));

	return unionSkeletonPolygons(
		solution
			.filter((path: ReadonlyArray<ClipperPoint>) => path.length >= 3)
			.map((path: ReadonlyArray<ClipperPoint>) => ({
				vertices: path.map(fromClipperPoint),
			})),
	);
};

export const buildCornerStyledUnionPolygons = (options: BuildCornerStyledUnionPolygonsOptions): SkeletonPolygon[] => {
	const strokeRadius = options.width / 2;
	const polygons = unionSkeletonPolygons(options.polygons);
	const cornerStyle = options.cornerStyle ?? 'bevel45';
	if (polygons.length === 0 || cornerStyle === 'rightAngle') {
		return polygons;
	}

	if (cornerStyle === 'bevel45' && polygons.every(hasOnlyAxisAlignedEdges)) {
		return unionSkeletonPolygons(polygons.map(bevelClosedPolygonCorners));
	}

	if (strokeRadius <= 0) {
		return cornerStyle === 'bevel45' ? unionSkeletonPolygons(polygons.map(bevelClosedPolygonCorners)) : polygons;
	}

	const closedPolygons = offsetClosedPolygons(polygons, strokeRadius, cornerStyle);
	if (closedPolygons.length === 0) {
		return polygons;
	}

	const restoredPolygons = offsetClosedPolygons(closedPolygons, -strokeRadius, cornerStyle);
	if (restoredPolygons.length === 0) {
		return polygons;
	}

	const normalizedPolygons = unionSkeletonPolygons(restoredPolygons);
	return cornerStyle === 'bevel45' ? unionSkeletonPolygons(normalizedPolygons.map(bevelClosedPolygonCorners)) : normalizedPolygons;
};

const strokePath = (path: ReadonlyArray<SkeletonPoint>, strokeRadius: number, cornerStyle: SmartCopperPourCornerStyle): SkeletonPolygon[] => {
	if (path.length < 2) {
		return [];
	}

	const offset = new ClipperLib.ClipperOffset();
	offset.AddPath(path.map(toClipperPoint), resolveJoinType(cornerStyle), resolveEndType());

	const solution = new ClipperLib.Paths();
	offset.Execute(solution, scaleValue(strokeRadius));

	return solution
		.filter((path: ReadonlyArray<ClipperPoint>) => path.length >= 3)
		.map((path: ReadonlyArray<ClipperPoint>) => ({
			vertices: path.map(fromClipperPoint),
		}));
};

const bevelClosedPolygonCorners = (polygon: SkeletonPolygon): SkeletonPolygon => {
	if (polygon.vertices.length < 3) {
		return polygon;
	}

	const beveledVertices: SkeletonPoint[] = [];
	for (let index = 0; index < polygon.vertices.length; index += 1) {
		const previousVertex = polygon.vertices[(index - 1 + polygon.vertices.length) % polygon.vertices.length];
		const currentVertex = polygon.vertices[index];
		const nextVertex = polygon.vertices[(index + 1) % polygon.vertices.length];

		if (!isAxisAlignedCorner(previousVertex, currentVertex, nextVertex)) {
			beveledVertices.push(currentVertex);
			continue;
		}

		const previousLength = measureSegmentLength(previousVertex, currentVertex);
		const nextLength = measureSegmentLength(currentVertex, nextVertex);
		const inset = Math.min(previousLength, nextLength) / 2;
		if (inset <= 0) {
			beveledVertices.push(currentVertex);
			continue;
		}

		beveledVertices.push(moveToward(currentVertex, previousVertex, inset));
		beveledVertices.push(moveToward(currentVertex, nextVertex, inset));
	}

	return {
		vertices: dedupeSequentialPoints(beveledVertices),
	};
};

const hasOnlyAxisAlignedEdges = (polygon: SkeletonPolygon): boolean => {
	for (let index = 0; index < polygon.vertices.length; index += 1) {
		const start = polygon.vertices[index];
		const end = polygon.vertices[(index + 1) % polygon.vertices.length];
		const deltaX = end.x - start.x;
		const deltaY = end.y - start.y;
		if (!isApproximatelyZero(deltaX) && !isApproximatelyZero(deltaY)) {
			return false;
		}
	}

	return true;
};

const offsetClosedPolygons = (
	polygons: ReadonlyArray<SkeletonPolygon>,
	delta: number,
	cornerStyle: SmartCopperPourCornerStyle,
): SkeletonPolygon[] => {
	const offset = new ClipperLib.ClipperOffset();
	for (const polygon of polygons) {
		if (polygon.vertices.length < 3) {
			continue;
		}

		offset.AddPath(polygon.vertices.map(toClipperPoint), resolveJoinType(cornerStyle), ClipperLib.EndType.etClosedPolygon);
	}

	const solution = new ClipperLib.Paths();
	offset.Execute(solution, scaleValue(delta));
	return solution
		.filter((path: ReadonlyArray<ClipperPoint>) => path.length >= 3)
		.map((path: ReadonlyArray<ClipperPoint>) => ({
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

const isAxisAlignedCorner = (previousVertex: SkeletonPoint, currentVertex: SkeletonPoint, nextVertex: SkeletonPoint): boolean => {
	const previousDeltaX = currentVertex.x - previousVertex.x;
	const previousDeltaY = currentVertex.y - previousVertex.y;
	const nextDeltaX = nextVertex.x - currentVertex.x;
	const nextDeltaY = nextVertex.y - currentVertex.y;
	const previousHorizontal = isApproximatelyZero(previousDeltaY) && !isApproximatelyZero(previousDeltaX);
	const previousVertical = isApproximatelyZero(previousDeltaX) && !isApproximatelyZero(previousDeltaY);
	const nextHorizontal = isApproximatelyZero(nextDeltaY) && !isApproximatelyZero(nextDeltaX);
	const nextVertical = isApproximatelyZero(nextDeltaX) && !isApproximatelyZero(nextDeltaY);

	return (previousHorizontal && nextVertical) || (previousVertical && nextHorizontal);
};

const measureSegmentLength = (start: SkeletonPoint, end: SkeletonPoint): number => Math.hypot(end.x - start.x, end.y - start.y);

const moveToward = (start: SkeletonPoint, end: SkeletonPoint, distance: number): SkeletonPoint => {
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	const length = Math.hypot(deltaX, deltaY);
	if (length === 0) {
		return start;
	}

	return {
		x: start.x + (deltaX / length) * distance,
		y: start.y + (deltaY / length) * distance,
	};
};

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
		case 'rightAngle':
			return ClipperLib.JoinType.jtMiter;
		case 'bevel45':
			return ClipperLib.JoinType.jtSquare;
		case 'round':
		default:
			return ClipperLib.JoinType.jtRound;
	}
};

const resolveEndType = (): number => {
	return ClipperLib.EndType.etOpenSquare;
};

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

const isApproximatelyZero = (value: number): boolean => Math.abs(value) < 0.001;
