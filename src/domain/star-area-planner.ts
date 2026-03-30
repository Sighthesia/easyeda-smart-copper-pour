import type { SmartCopperPourStarAreaShape } from '../application/smart-copper-pour-contract';
import type { PadNode } from './pad-node';
import { buildPadNodeOutline } from './pad-node-outline';
import type { SkeletonPoint, SkeletonPolygon } from './skeleton-types';

export interface StarAreaPlan {
	outline: SkeletonPolygon;
}

export interface StarAreaPlanOptions {
	areaShape?: SmartCopperPourStarAreaShape;
	useNodeSizeAsBaseWidth?: boolean;
}

const MINIMUM_HALF_EXTENT = 0.001;

export const planStarArea = (pads: ReadonlyArray<PadNode>, options: StarAreaPlanOptions = {}): StarAreaPlan => {
	const uniquePoints =
		options.useNodeSizeAsBaseWidth === false
			? dedupePoints(pads.map((pad) => pad.center))
			: dedupePoints(pads.flatMap((pad) => buildPadNodeOutline(pad).vertices));
	const areaShape = options.areaShape ?? 'convexHull';
	const outline = areaShape === 'boundingBox' ? buildBoundingBox(uniquePoints) : buildConvexHull(uniquePoints);

	return { outline };
};

const dedupePoints = (points: ReadonlyArray<SkeletonPoint>): SkeletonPoint[] => {
	const seen = new Set<string>();
	return points.filter((point) => {
		const key = `${point.x},${point.y}`;
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
};

const buildBoundingBox = (points: ReadonlyArray<SkeletonPoint>): SkeletonPolygon => {
	if (points.length === 0) {
		return { vertices: [] };
	}

	const xValues = points.map((point) => point.x);
	const yValues = points.map((point) => point.y);
	let minX = Math.min(...xValues);
	let maxX = Math.max(...xValues);
	let minY = Math.min(...yValues);
	let maxY = Math.max(...yValues);

	if (minX === maxX) {
		minX -= MINIMUM_HALF_EXTENT;
		maxX += MINIMUM_HALF_EXTENT;
	}

	if (minY === maxY) {
		minY -= MINIMUM_HALF_EXTENT;
		maxY += MINIMUM_HALF_EXTENT;
	}

	return {
		vertices: [
			{ x: minX, y: minY },
			{ x: maxX, y: minY },
			{ x: maxX, y: maxY },
			{ x: minX, y: maxY },
		],
	};
};

const buildConvexHull = (points: ReadonlyArray<SkeletonPoint>): SkeletonPolygon => {
	if (points.length < 3) {
		return buildBoundingBox(points);
	}

	const sortedPoints = [...points].sort((left, right) => (left.x === right.x ? left.y - right.y : left.x - right.x));
	const lower = buildHullHalf(sortedPoints);
	const upper = buildHullHalf([...sortedPoints].reverse());
	const hull = [...lower.slice(0, -1), ...upper.slice(0, -1)];

	if (hull.length < 3) {
		return buildBoundingBox(points);
	}

	return { vertices: hull };
};

const buildHullHalf = (points: ReadonlyArray<SkeletonPoint>): SkeletonPoint[] => {
	const hull: SkeletonPoint[] = [];
	for (const point of points) {
		while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) {
			hull.pop();
		}
		hull.push(point);
	}
	return hull;
};

const cross = (origin: SkeletonPoint, left: SkeletonPoint, right: SkeletonPoint): number => {
	return (left.x - origin.x) * (right.y - origin.y) - (left.y - origin.y) * (right.x - origin.x);
};
