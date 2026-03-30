import { planOrthogonalTreeBackbone } from './orthogonal-tree-planner';
import type { PadNode } from './pad-node';
import { TopologyMode } from './topology-mode';

export type DaisyChainBackboneTrunkBias = 'neutral' | 'horizontal' | 'vertical';

export interface DaisyChainBackbonePlan {
	mode: TopologyMode.DaisyChain;
	segments: ReturnType<typeof planOrthogonalTreeBackbone>['segments'];
}

export interface DaisyChainOptions {
	trunkBias?: DaisyChainBackboneTrunkBias;
}

export const planDaisyChainBackbone = (pads: ReadonlyArray<PadNode>, options: DaisyChainOptions = {}): DaisyChainBackbonePlan => ({
	mode: TopologyMode.DaisyChain,
	segments: planOrthogonalTreeBackbone(pads, options).segments,
});
