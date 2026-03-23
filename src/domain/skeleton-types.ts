/**
 * Cartesian point used by skeleton planners.
 *
 * @public
 */
export interface SkeletonPoint {
	x: number;
	y: number;
}

/**
 * Supported semantic roles for skeleton segments.
 *
 * @public
 */
export type SkeletonSegmentRole = 'trunk' | 'branch';

/**
 * Centerline segment emitted by a topology planner.
 *
 * @public
 */
export interface SkeletonSegment {
	start: SkeletonPoint;
	end: SkeletonPoint;
	role: SkeletonSegmentRole;
}

/**
 * Ordered centerline path.
 *
 * @public
 */
export interface SkeletonPolyline {
	points: ReadonlyArray<SkeletonPoint>;
}

/**
 * Closed polygon footprint.
 *
 * @public
 */
export interface SkeletonPolygon {
	vertices: ReadonlyArray<SkeletonPoint>;
}

/**
 * Keepout obstacle represented in planner space.
 *
 * @public
 */
export interface SkeletonObstacle {
	outline: SkeletonPolygon;
}
