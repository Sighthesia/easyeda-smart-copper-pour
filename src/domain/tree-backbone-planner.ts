import type { PadNode } from './pad-node';
import type { SkeletonSegment } from './skeleton-types';
import { TOPOLOGY_BIAS_NEAR_TIE_THRESHOLD } from './topology-bias-threshold';
import { TopologyMode } from './topology-mode';

export type TreeBackboneTrunkBias = 'neutral' | 'horizontal' | 'vertical';

export interface TreeBackboneOptions {
	trunkBias?: TreeBackboneTrunkBias;
}

/**
 * Deterministic tree skeleton produced from selected pads.
 *
 * @public
 */
export interface TreeBackbonePlan {
	mode: TopologyMode.Tree;
	segments: SkeletonSegment[];
}

interface WeightedEdge {
	leftIndex: number;
	rightIndex: number;
	startId: string;
	endId: string;
	distance: number;
	biasPenalty: number;
}

/**
 * Plans a minimal tree backbone with stable tie-breaking.
 *
 * @param pads
 * - Normalized pads that should be connected.
 *
 * @returns
 * - Deterministic tree backbone segments.
 *
 * @public
 */
export const planTreeBackbone = (pads: ReadonlyArray<PadNode>, options: TreeBackboneOptions = {}): TreeBackbonePlan => {
	if (pads.length < 2) {
		return {
			mode: TopologyMode.Tree,
			segments: [],
		};
	}

	const sortedPads = [...pads].sort((left, right) => left.id.localeCompare(right.id));
	const edges = buildWeightedEdges(sortedPads, options.trunkBias ?? 'neutral');
	const parents = sortedPads.map((_pad, index) => index);
	const segments: SkeletonSegment[] = [];

	for (const edge of edges) {
		const leftRoot = findRoot(parents, edge.leftIndex);
		const rightRoot = findRoot(parents, edge.rightIndex);

		if (leftRoot === rightRoot) {
			continue;
		}

		parents[rightRoot] = leftRoot;
		segments.push({
			start: { ...sortedPads[edge.leftIndex].center },
			end: { ...sortedPads[edge.rightIndex].center },
			role: 'branch',
		});

		if (segments.length === sortedPads.length - 1) {
			break;
		}
	}

	return {
		mode: TopologyMode.Tree,
		segments,
	};
};

const buildWeightedEdges = (pads: ReadonlyArray<PadNode>, trunkBias: TreeBackboneTrunkBias): WeightedEdge[] => {
	const edges: WeightedEdge[] = [];

	for (let leftIndex = 0; leftIndex < pads.length - 1; leftIndex += 1) {
		for (let rightIndex = leftIndex + 1; rightIndex < pads.length; rightIndex += 1) {
			edges.push({
				leftIndex,
				rightIndex,
				startId: pads[leftIndex].id,
				endId: pads[rightIndex].id,
				...measureDistance(pads[leftIndex], pads[rightIndex], trunkBias),
			});
		}
	}

	return edges.sort(compareEdges);
};

const compareEdges = (left: WeightedEdge, right: WeightedEdge): number => {
	const distanceDelta = left.distance - right.distance;
	if (distanceDelta !== 0 && Math.abs(distanceDelta) > TOPOLOGY_BIAS_NEAR_TIE_THRESHOLD) {
		return distanceDelta;
	}

	if (left.biasPenalty !== right.biasPenalty) {
		return left.biasPenalty - right.biasPenalty;
	}

	if (distanceDelta !== 0) {
		return distanceDelta;
	}

	if (left.startId !== right.startId) {
		return left.startId.localeCompare(right.startId);
	}

	return left.endId.localeCompare(right.endId);
};

const measureDistance = (left: PadNode, right: PadNode, trunkBias: TreeBackboneTrunkBias): { distance: number; biasPenalty: number } => {
	const deltaX = Math.abs(left.center.x - right.center.x);
	const deltaY = Math.abs(left.center.y - right.center.y);
	const distance = Math.hypot(deltaX, deltaY);

	if (trunkBias === 'horizontal') {
		return {
			distance,
			biasPenalty: deltaY,
		};
	}

	if (trunkBias === 'vertical') {
		return {
			distance,
			biasPenalty: deltaX,
		};
	}

	return {
		distance,
		biasPenalty: 0,
	};
};

const findRoot = (parents: number[], index: number): number => {
	if (parents[index] === index) {
		return index;
	}

	parents[index] = findRoot(parents, parents[index]);
	return parents[index];
};
