import type { SmartCopperPourPreviewRequest } from '../application/smart-copper-pour-contract';
import type { PadNode } from './pad-node';

export const resolveBaseCopperWidth = (
	padNodes: ReadonlyArray<PadNode>,
	request: Pick<SmartCopperPourPreviewRequest, 'useNodeSizeAsBaseWidth'>,
): number => {
	if (request.useNodeSizeAsBaseWidth === false || padNodes.length === 0) {
		return 0;
	}

	return Math.max(
		...padNodes.map((padNode) => {
			const width = padNode.width ?? padNode.effectiveRadius * 2;
			const height = padNode.height ?? padNode.effectiveRadius * 2;
			return Math.max(width, height);
		}),
	);
};

export const resolveFinalCopperWidth = (
	padNodes: ReadonlyArray<PadNode>,
	request: Pick<SmartCopperPourPreviewRequest, 'useNodeSizeAsBaseWidth' | 'width'>,
): number => {
	return resolveBaseCopperWidth(padNodes, request) + request.width;
};
