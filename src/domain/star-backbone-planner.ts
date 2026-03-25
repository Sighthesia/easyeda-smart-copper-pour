import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonSegment } from './skeleton-types';
import { TOPOLOGY_BIAS_NEAR_TIE_THRESHOLD } from './topology-bias-threshold';
import { TopologyMode } from './topology-mode';

export type StarBackboneTrunkBias = 'neutral' | 'horizontal' | 'vertical';

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
	trunkBias?: StarBackboneTrunkBias;
}

/**
 * Plans a deterministic star backbone anchored on a selected pad.
 *
 * @param pads
 * - Normalized pads that should fan out from one hub.
 *
 * @returns
 * - Deterministic star backbone with a selected-pad hub.
 *
 * @public
 */
export const planStarBackbone = (pads: ReadonlyArray<PadNode>, options: StarBackboneOptions = {}): StarBackbonePlan => {
	const sortedPads = [...pads].sort((left, right) => left.id.localeCompare(right.id));
	const hubPad = resolveHubPad(sortedPads, options);
	const hub = hubPad === undefined ? { x: 0, y: 0 } : { ...hubPad.center };
	const segments =
		sortedPads.length < 2
			? []
			: sortedPads
					.filter((pad) => pad.id !== hubPad?.id)
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

const resolveHubPad = (pads: ReadonlyArray<PadNode>, options: StarBackboneOptions): PadNode | undefined => {
	if (pads.length === 0) {
		return undefined;
	}

	if (options.hubPadId !== undefined) {
		const hubPad = pads.find((pad) => pad.id === options.hubPadId);
		if (hubPad !== undefined) {
			return hubPad;
		}

		throw new Error(`Star hub pad not found: ${options.hubPadId}`);
	}

	return selectHubPad(pads, options.trunkBias ?? 'neutral');
};

interface HubCandidate {
	pad: PadNode;
	totalDistance: number;
	biasPenalty: number;
}

const selectHubPad = (pads: ReadonlyArray<PadNode>, trunkBias: StarBackboneTrunkBias): PadNode =>
	[...pads].map((pad) => buildHubCandidate(pad, pads, trunkBias)).sort(compareHubCandidates)[0].pad;

const buildHubCandidate = (hubPad: PadNode, pads: ReadonlyArray<PadNode>, trunkBias: StarBackboneTrunkBias): HubCandidate => {
	const totals = pads.reduce(
		(accumulator, pad) => {
			if (pad.id === hubPad.id) {
				return accumulator;
			}

			const deltaX = Math.abs(hubPad.center.x - pad.center.x);
			const deltaY = Math.abs(hubPad.center.y - pad.center.y);

			return {
				totalDistance: accumulator.totalDistance + Math.hypot(deltaX, deltaY),
				biasPenalty: accumulator.biasPenalty + measureBiasPenalty(deltaX, deltaY, trunkBias),
			};
		},
		{ totalDistance: 0, biasPenalty: 0 },
	);

	return {
		pad: hubPad,
		totalDistance: totals.totalDistance,
		biasPenalty: totals.biasPenalty,
	};
};

const compareHubCandidates = (left: HubCandidate, right: HubCandidate): number => {
	const distanceDelta = left.totalDistance - right.totalDistance;
	if (distanceDelta !== 0 && Math.abs(distanceDelta) > TOPOLOGY_BIAS_NEAR_TIE_THRESHOLD) {
		return distanceDelta;
	}

	if (left.biasPenalty !== right.biasPenalty) {
		return left.biasPenalty - right.biasPenalty;
	}

	if (distanceDelta !== 0) {
		return distanceDelta;
	}

	return left.pad.id.localeCompare(right.pad.id);
};

const measureBiasPenalty = (deltaX: number, deltaY: number, trunkBias: StarBackboneTrunkBias): number => {
	if (trunkBias === 'horizontal') {
		return deltaY;
	}

	if (trunkBias === 'vertical') {
		return deltaX;
	}

	return 0;
};
