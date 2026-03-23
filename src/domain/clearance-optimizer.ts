import type { SkeletonObstacle, SkeletonPoint, SkeletonSegment } from './skeleton-types';

/**
 * Inputs for clearance-aware width growth.
 *
 * @public
 */
export interface OptimizeSkeletonClearanceOptions {
	segments: ReadonlyArray<SkeletonSegment>;
	obstacles: ReadonlyArray<SkeletonObstacle>;
	baseWidth: number;
	maxWidth: number;
	widthStep: number;
	keepoutMargin: number;
	obstacleMargin?: number;
}

/**
 * Width chosen by the clearance optimizer.
 *
 * @public
 */
export interface ClearanceOptimizationResult {
	width: number;
	collided: boolean;
}

/**
 * Grows copper width until the next step would collide with an obstacle envelope.
 *
 * @param options
 * - Growth bounds, safety margins, centerline segments, and resolved obstacles.
 *
 * @returns
 * - The last safe width and whether growth hit a collision bound.
 *
 * @public
 */
export const optimizeSkeletonClearance = (
	options: OptimizeSkeletonClearanceOptions,
): ClearanceOptimizationResult => {
	const boundedBaseWidth = Math.max(options.baseWidth, 0);
	const boundedMaxWidth = Math.max(options.maxWidth, boundedBaseWidth);
	const boundedWidthStep = options.widthStep > 0 ? options.widthStep : boundedMaxWidth - boundedBaseWidth || 1;
	const clearanceMargin = Math.max(options.keepoutMargin, 0) + Math.max(options.obstacleMargin ?? 0, 0);

	let width = boundedBaseWidth;
	let lastSafeWidth = boundedBaseWidth;

	while (width <= boundedMaxWidth) {
		if (hasCollision(options.segments, options.obstacles, width / 2 + clearanceMargin)) {
			return {
				width: lastSafeWidth,
				collided: true,
			};
		}

		lastSafeWidth = width;
		width += boundedWidthStep;
	}

	return {
		width: lastSafeWidth,
		collided: false,
	};
};

const hasCollision = (
	segments: ReadonlyArray<SkeletonSegment>,
	obstacles: ReadonlyArray<SkeletonObstacle>,
	radius: number,
): boolean => {
	for (const segment of segments) {
		for (const obstacle of obstacles) {
			if (segmentCollidesWithPolygon(segment, obstacle.outline.vertices, radius)) {
				return true;
			}
		}
	}

	return false;
};

const segmentCollidesWithPolygon = (
	segment: SkeletonSegment,
	vertices: ReadonlyArray<SkeletonPoint>,
	radius: number,
): boolean => {
	if (vertices.length === 0) {
		return false;
	}

	if (isPointInPolygon(segment.start, vertices) || isPointInPolygon(segment.end, vertices)) {
		return true;
	}

	for (let index = 0; index < vertices.length; index += 1) {
		const start = vertices[index];
		const end = vertices[(index + 1) % vertices.length];
		if (segmentsIntersect(segment.start, segment.end, start, end)) {
			return true;
		}

		if (distanceBetweenSegments(segment.start, segment.end, start, end) <= radius) {
			return true;
		}
	}

	return false;
};

const distanceBetweenSegments = (
	segmentStart: SkeletonPoint,
	segmentEnd: SkeletonPoint,
	edgeStart: SkeletonPoint,
	edgeEnd: SkeletonPoint,
): number => {
	return Math.min(
		distancePointToSegment(segmentStart, edgeStart, edgeEnd),
		distancePointToSegment(segmentEnd, edgeStart, edgeEnd),
		distancePointToSegment(edgeStart, segmentStart, segmentEnd),
		distancePointToSegment(edgeEnd, segmentStart, segmentEnd),
	);
};

const distancePointToSegment = (point: SkeletonPoint, start: SkeletonPoint, end: SkeletonPoint): number => {
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	const lengthSquared = deltaX * deltaX + deltaY * deltaY;

	if (lengthSquared === 0) {
		return Math.hypot(point.x - start.x, point.y - start.y);
	}

	const projection = ((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared;
	const clampedProjection = Math.max(0, Math.min(1, projection));
	const closestX = start.x + deltaX * clampedProjection;
	const closestY = start.y + deltaY * clampedProjection;
	return Math.hypot(point.x - closestX, point.y - closestY);
};

const isPointInPolygon = (point: SkeletonPoint, vertices: ReadonlyArray<SkeletonPoint>): boolean => {
	let inside = false;

	for (let currentIndex = 0, previousIndex = vertices.length - 1; currentIndex < vertices.length; previousIndex = currentIndex++) {
		const currentVertex = vertices[currentIndex];
		const previousVertex = vertices[previousIndex];
		const crosses = (currentVertex.y > point.y) !== (previousVertex.y > point.y);

		if (
			crosses &&
			point.x <
				((previousVertex.x - currentVertex.x) * (point.y - currentVertex.y)) / (previousVertex.y - currentVertex.y) + currentVertex.x
		) {
			inside = !inside;
		}
	}

	return inside;
};

const segmentsIntersect = (
	firstStart: SkeletonPoint,
	firstEnd: SkeletonPoint,
	secondStart: SkeletonPoint,
	secondEnd: SkeletonPoint,
): boolean => {
	const firstOrientation = orientation(firstStart, firstEnd, secondStart);
	const secondOrientation = orientation(firstStart, firstEnd, secondEnd);
	const thirdOrientation = orientation(secondStart, secondEnd, firstStart);
	const fourthOrientation = orientation(secondStart, secondEnd, firstEnd);

	if (firstOrientation !== secondOrientation && thirdOrientation !== fourthOrientation) {
		return true;
	}

	return (
		(firstOrientation === 0 && isPointOnSegment(secondStart, firstStart, firstEnd)) ||
		(secondOrientation === 0 && isPointOnSegment(secondEnd, firstStart, firstEnd)) ||
		(thirdOrientation === 0 && isPointOnSegment(firstStart, secondStart, secondEnd)) ||
		(fourthOrientation === 0 && isPointOnSegment(firstEnd, secondStart, secondEnd))
	);
};

const orientation = (start: SkeletonPoint, middle: SkeletonPoint, end: SkeletonPoint): number => {
	const value = (middle.y - start.y) * (end.x - middle.x) - (middle.x - start.x) * (end.y - middle.y);
	if (Math.abs(value) < Number.EPSILON) {
		return 0;
	}

	return value > 0 ? 1 : 2;
};

const isPointOnSegment = (point: SkeletonPoint, start: SkeletonPoint, end: SkeletonPoint): boolean => {
	return (
		point.x <= Math.max(start.x, end.x) &&
		point.x >= Math.min(start.x, end.x) &&
		point.y <= Math.max(start.y, end.y) &&
		point.y >= Math.min(start.y, end.y)
	);
};
