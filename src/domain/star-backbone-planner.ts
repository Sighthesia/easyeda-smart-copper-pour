import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonSegment } from './skeleton-types';
import { TopologyMode } from './topology-mode';

/**
 * Deterministic star skeleton produced from selected pads.
 *
 * @public
 */
export interface StarBackbonePlan {
	mode: TopologyMode.Star;
	hub: SkeletonPoint;
	segments: SkeletonSegment[];
}

/**
 * Optional star planner settings.
 *
 * @public
 */
export interface StarBackboneOptions {
	hubPadId?: string;
}

/**
 * Plans a centroid-based star backbone.
 *
 * @param pads
 * - Normalized pads that should fan out from one hub.
 *
 * @returns
 * - Deterministic star backbone with centroid hub.
 *
 * @public
 */
export const planStarBackbone = (pads: ReadonlyArray<PadNode>, options: StarBackboneOptions = {}): StarBackbonePlan => {
	const sortedPads = [...pads].sort((left, right) => left.id.localeCompare(right.id));
	const hub = resolveHub(sortedPads, options);
	const segments =
		sortedPads.length < 2
			? []
			: sortedPads
					.filter((pad) => pad.center.x !== hub.x || pad.center.y !== hub.y)
					.map((pad) => ({
						start: { ...hub },
						end: { ...pad.center },
						role: 'branch' as const,
					}));

	return {
		mode: TopologyMode.Star,
		hub,
		segments,
	};
};

const resolveHub = (pads: ReadonlyArray<PadNode>, options: StarBackboneOptions): SkeletonPoint => {
	if (options.hubPadId !== undefined) {
		const hubPad = pads.find((pad) => pad.id === options.hubPadId);
		if (hubPad !== undefined) {
			return { ...hubPad.center };
		}
	}

	return computeCentroid(pads);
};

const computeCentroid = (pads: ReadonlyArray<PadNode>): SkeletonPoint => {
	if (pads.length === 0) {
		return { x: 0, y: 0 };
	}

	const totals = pads.reduce(
		(accumulator, pad) => ({
			x: accumulator.x + pad.center.x,
			y: accumulator.y + pad.center.y,
		}),
		{ x: 0, y: 0 },
	);

	return {
		x: totals.x / pads.length,
		y: totals.y / pads.length,
	};
};
