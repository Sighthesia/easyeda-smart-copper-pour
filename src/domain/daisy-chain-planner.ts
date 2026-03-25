import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonSegment } from './skeleton-types';
import { TopologyMode } from './topology-mode';

export type DaisyChainBackboneTrunkBias = 'neutral' | 'horizontal' | 'vertical';

export interface DaisyChainBackbonePlan {
	mode: TopologyMode.DaisyChain;
	segments: SkeletonSegment[];
}

export interface DaisyChainManualOptions {
	trunkMode: 'manual';
	trunkStart: SkeletonPoint;
	trunkEnd: SkeletonPoint;
}

export interface DaisyChainAutoOptions {
	trunkMode: 'auto';
	trunkBias?: DaisyChainBackboneTrunkBias;
}

export type DaisyChainOptions = DaisyChainManualOptions | DaisyChainAutoOptions;

export const planDaisyChainBackbone = (
	pads: ReadonlyArray<PadNode>,
	options: DaisyChainOptions,
): DaisyChainBackbonePlan => {
	const trunk = resolveTrunkEndpoints(pads, options);
	if (pads.length === 0 || isSamePoint(trunk.start, trunk.end)) {
		return { mode: TopologyMode.DaisyChain, segments: [] };
	}

	const orderedPads = [...pads]
		.map((pad) => ({ pad, projection: projectPointToSegment(pad.center, trunk.start, trunk.end) }))
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
				start: { ...trunk.start },
				end: { ...trunk.end },
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

const resolveTrunkEndpoints = (
	pads: ReadonlyArray<PadNode>,
	options: DaisyChainOptions,
): { start: SkeletonPoint; end: SkeletonPoint } => {
	if (options.trunkMode === 'manual') {
		return {
			start: options.trunkStart,
			end: options.trunkEnd,
		};
	}

	return buildAutoTrunkEndpoints(pads, options.trunkBias ?? 'neutral');
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
