import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonSegment } from './skeleton-types';
import { TopologyMode } from './topology-mode';

export interface DaisyChainBackbonePlan {
	mode: TopologyMode.DaisyChain;
	segments: SkeletonSegment[];
}

export interface DaisyChainOptions {
	trunkStart: SkeletonPoint;
	trunkEnd: SkeletonPoint;
}

export const planDaisyChainBackbone = (
	pads: ReadonlyArray<PadNode>,
	options: DaisyChainOptions,
): DaisyChainBackbonePlan => {
	if (pads.length === 0 || isSamePoint(options.trunkStart, options.trunkEnd)) {
		return { mode: TopologyMode.DaisyChain, segments: [] };
	}

	const orderedPads = [...pads]
		.map((pad) => ({ pad, projection: projectPointToSegment(pad.center, options.trunkStart, options.trunkEnd) }))
		.sort((left, right) => {
			if (left.projection.distance !== right.projection.distance) {
				return left.projection.distance - right.projection.distance;
			}

			return left.pad.id.localeCompare(right.pad.id);
		});

	return {
		mode: TopologyMode.DaisyChain,
		segments: [
			{
				start: { ...options.trunkStart },
				end: { ...options.trunkEnd },
				role: 'trunk',
			},
			...orderedPads
				.filter(({ pad, projection }) => !isSamePoint(pad.center, projection.point))
				.map(({ pad, projection }) => ({
					start: projection.point,
					end: { ...pad.center },
					role: 'branch' as const,
				})),
		],
	};
};

const projectPointToSegment = (point: SkeletonPoint, start: SkeletonPoint, end: SkeletonPoint) => {
	const deltaX = end.x - start.x;
	const deltaY = end.y - start.y;
	const lengthSquared = deltaX * deltaX + deltaY * deltaY;

	if (lengthSquared === 0) {
		return {
			distance: 0,
			point: { ...start },
		};
	}

	const t = clamp(((point.x - start.x) * deltaX + (point.y - start.y) * deltaY) / lengthSquared, 0, 1);
	return {
		distance: t,
		point: {
			x: start.x + deltaX * t,
			y: start.y + deltaY * t,
		},
	};
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

const isSamePoint = (left: SkeletonPoint, right: SkeletonPoint): boolean => left.x === right.x && left.y === right.y;
