import type { DaisyChainBackboneTrunkBias } from './daisy-chain-planner';
import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonSegment } from './skeleton-types';

export interface OrthogonalTreeBackbonePlan {
	segments: SkeletonSegment[];
}

export interface OrthogonalTreeBackboneOptions {
	trunkBias?: DaisyChainBackboneTrunkBias;
}

export const planOrthogonalTreeBackbone = (pads: ReadonlyArray<PadNode>, options: OrthogonalTreeBackboneOptions = {}): OrthogonalTreeBackbonePlan => {
	if (pads.length < 2) {
		return { segments: [] };
	}

	const trunk = buildAutoTrunkEndpoints(pads, options.trunkBias ?? 'neutral');
	if (isSamePoint(trunk.start, trunk.end)) {
		return { segments: [] };
	}

	const orderedPads = [...pads]
		.map((pad) => ({ pad, projection: projectPointToSegment(pad.center, trunk.start, trunk.end) }))
		.sort((left, right) => {
			if (left.projection.distance !== right.projection.distance) {
				return left.projection.distance - right.projection.distance;
			}

			return left.pad.id.localeCompare(right.pad.id);
		});

	const branchSegments = orderedPads.flatMap(({ pad, projection }) => {
		if (isSamePoint(pad.center, projection.point)) {
			return [];
		}

		return [
			{
				start: projection.point,
				end: { ...pad.center },
				role: 'branch' as const,
			},
		];
	});

	return {
		segments: [
			{
				start: trunk.start,
				end: trunk.end,
				role: 'trunk' as const,
			},
			...branchSegments,
		],
	};
};

const buildAutoTrunkEndpoints = (
	pads: ReadonlyArray<PadNode>,
	trunkBias: DaisyChainBackboneTrunkBias,
): { start: SkeletonPoint; end: SkeletonPoint } => {
	const preferredAxis = resolveAutoTrunkAxis(pads, trunkBias);
	if (preferredAxis === 'x') {
		const xValues = pads.map((pad) => pad.center.x);
		const yAverage = average(pads.map((pad) => pad.center.y));
		return {
			start: { x: Math.min(...xValues), y: yAverage },
			end: { x: Math.max(...xValues), y: yAverage },
		};
	}

	const yValues = pads.map((pad) => pad.center.y);
	const xAverage = average(pads.map((pad) => pad.center.x));
	return {
		start: { x: xAverage, y: Math.min(...yValues) },
		end: { x: xAverage, y: Math.max(...yValues) },
	};
};

const resolveAutoTrunkAxis = (pads: ReadonlyArray<PadNode>, trunkBias: DaisyChainBackboneTrunkBias): 'x' | 'y' => {
	if (trunkBias === 'horizontal') {
		return 'x';
	}

	if (trunkBias === 'vertical') {
		return 'y';
	}

	const xSpread = calculateSpread(pads.map((pad) => pad.center.x));
	const ySpread = calculateSpread(pads.map((pad) => pad.center.y));
	return xSpread >= ySpread ? 'x' : 'y';
};

const calculateSpread = (values: ReadonlyArray<number>): number => Math.max(...values) - Math.min(...values);

const average = (values: ReadonlyArray<number>): number => values.reduce((sum, value) => sum + value, 0) / values.length;

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
