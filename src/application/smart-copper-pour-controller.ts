import { optimizeSkeletonClearance } from '../domain/clearance-optimizer';
import { resolveBaseCopperWidth } from '../domain/copper-width';
import { planDaisyChainBackbone } from '../domain/daisy-chain-planner';
import { planOrthogonalTreeBackbone } from '../domain/orthogonal-tree-planner';
import type { PadNode } from '../domain/pad-node';
import type { SkeletonObstacle, SkeletonSegment } from '../domain/skeleton-types';
import { planStarBackbone } from '../domain/star-backbone-planner';
import { planTreeBackbone } from '../domain/tree-backbone-planner';
import { createSmartCopperPourSelectionSummaryFromPrimitives } from '../infrastructure/lceda/selection-inspector';
import type {
	SmartCopperPourApplyRequest,
	SmartCopperPourApplyResult,
	SmartCopperPourClearPreviewResult,
	SmartCopperPourInspectSelectionRequest,
	SmartCopperPourPreviewRequest,
	SmartCopperPourPreviewResult,
	SmartCopperPourSelectionSummary,
} from './smart-copper-pour-contract';

/**
 * Reads and normalizes the current PCB selection.
 *
 * @public
 */
export interface SmartCopperPourSelectionInspector {
	inspectSelection: () => Promise<SmartCopperPourSelectionSummary>;
}

export interface SmartCopperPourInspectedSelection {
	normalizedNodes: ReadonlyArray<PadNode>;
	netName: string | null;
	layerName: string | null;
}

/**
 * Builds and clears preview artifacts.
 *
 * @public
 */
export interface SmartCopperPourPreviewGateway {
	preview: (request: SmartCopperPourPreviewRequest) => Promise<SmartCopperPourPreviewResult>;
	clearPreview: () => Promise<SmartCopperPourClearPreviewResult>;
}

/**
 * Applies the final copper result.
 *
 * @public
 */
export interface SmartCopperPourApplyGateway {
	apply: (request: SmartCopperPourApplyGatewayRequest) => Promise<SmartCopperPourApplyResult>;
}

export type SmartCopperPourApplyGatewayRequest = SmartCopperPourApplyRequest & {
	previewToken?: string | null;
};

export interface SmartCopperPourObstacleResolverInput {
	layerName: string | null;
	netName: string | null;
}

export interface SmartCopperPourObstacleResolver {
	resolveObstacles: (input: SmartCopperPourObstacleResolverInput) => Promise<ReadonlyArray<SkeletonObstacle>>;
}

export type SmartCopperPourPreviewOptimizationRequest = SmartCopperPourPreviewRequest & {
	padNodes?: ReadonlyArray<PadNode>;
	obstacleSnapshot?: {
		obstacles: ReadonlyArray<SkeletonObstacle>;
	};
};

/**
 * Controller dependencies for smart copper orchestration.
 *
 * @public
 */
export interface SmartCopperPourControllerDependencies {
	selectionInspector: SmartCopperPourSelectionInspector;
	previewGateway: SmartCopperPourPreviewGateway;
	applyGateway: SmartCopperPourApplyGateway;
	obstacleResolver?: SmartCopperPourObstacleResolver;
}

type SmartCopperPourValidationErrorCode =
	| 'invalid-width'
	| 'invalid-keepout-margin'
	| 'invalid-max-width'
	| 'invalid-width-step'
	| 'invalid-obstacle-margin';

class SmartCopperPourValidationError extends Error {
	public constructor(
		public readonly code: SmartCopperPourValidationErrorCode,
		message: string,
	) {
		super(message);
		this.name = 'SmartCopperPourValidationError';
	}
}

/**
 * Builds controller dependencies from already-bound collaborators.
 *
 * @public
 */
export const createSmartCopperPourControllerDependencies = (
	dependencies: SmartCopperPourControllerDependencies,
): SmartCopperPourControllerDependencies => dependencies;

/**
 * Application controller for smart copper commands.
 *
 * @public
 */
export class SmartCopperPourController {
	private latestPreviewToken: string | null = null;

	public constructor(private readonly dependencies: SmartCopperPourControllerDependencies) {}

	public inspectSelection(request?: SmartCopperPourInspectSelectionRequest): Promise<SmartCopperPourSelectionSummary> {
		if (request?.selectionPrimitives !== undefined) {
			return Promise.resolve(createSmartCopperPourSelectionSummaryFromPrimitives(request.selectionPrimitives));
		}

		return this.dependencies.selectionInspector.inspectSelection();
	}

	public async preview(request: SmartCopperPourPreviewRequest): Promise<SmartCopperPourPreviewResult> {
		validateSmartCopperPourRequest(request);
		this.latestPreviewToken = null;
		const result = await this.dependencies.previewGateway.preview(await this.optimizePreviewRequest(request));
		this.latestPreviewToken = result.previewToken;
		return result;
	}

	public async apply(request: SmartCopperPourApplyRequest): Promise<SmartCopperPourApplyResult> {
		validateSmartCopperPourRequest(request);
		const appliedPreviewToken = this.latestPreviewToken;
		const result = await this.dependencies.applyGateway.apply({
			...request,
			previewToken: appliedPreviewToken,
		});

		if (result.applied && appliedPreviewToken !== null && appliedPreviewToken === this.latestPreviewToken) {
			this.latestPreviewToken = null;
		}

		return result;
	}

	public async clearPreview(): Promise<SmartCopperPourClearPreviewResult> {
		const result = await this.dependencies.previewGateway.clearPreview();
		if (result.cleared) {
			this.latestPreviewToken = null;
		}

		return result;
	}

	private async optimizePreviewRequest(request: SmartCopperPourPreviewRequest): Promise<SmartCopperPourPreviewRequest> {
		const optimizationRequest = request as SmartCopperPourPreviewOptimizationRequest;
		const skeleton = resolveOptimizationSkeleton(optimizationRequest);
		if (!request.autoExpand || skeleton === undefined) {
			return request;
		}

		const obstacles = optimizationRequest.obstacleSnapshot?.obstacles ?? (await this.resolveObstacles());

		const optimized = optimizeSkeletonClearance({
			segments: skeleton.segments,
			obstacles,
			baseWidth: request.width + resolveBaseCopperWidth(optimizationRequest.padNodes ?? [], request),
			maxWidth: (request.maxWidth ?? request.width) + resolveBaseCopperWidth(optimizationRequest.padNodes ?? [], request),
			widthStep: request.widthStep ?? 1,
			keepoutMargin: request.keepoutMargin,
			obstacleMargin: request.obstacleMargin,
		});
		const baseWidth = resolveBaseCopperWidth(optimizationRequest.padNodes ?? [], request);

		return {
			...request,
			width: Math.max(optimized.width - baseWidth, 0.01),
		};
	}

	private async resolveObstacles() {
		if (this.dependencies.obstacleResolver === undefined) {
			return [];
		}

		const selection = await this.dependencies.selectionInspector.inspectSelection();
		return this.dependencies.obstacleResolver.resolveObstacles({
			layerName: selection.layerName,
			netName: selection.netName,
		});
	}
}

const validateSmartCopperPourRequest = (request: SmartCopperPourPreviewRequest | SmartCopperPourApplyRequest): void => {
	if (request.width <= 0) {
		throw new SmartCopperPourValidationError('invalid-width', 'Width must be greater than 0.');
	}

	if (request.keepoutMargin < 0) {
		throw new SmartCopperPourValidationError('invalid-keepout-margin', 'Keepout margin must be 0 or greater.');
	}

	if (request.maxWidth !== undefined && request.maxWidth < request.width) {
		throw new SmartCopperPourValidationError('invalid-max-width', 'Max width must be greater than or equal to width.');
	}

	if (request.widthStep !== undefined && request.widthStep <= 0) {
		throw new SmartCopperPourValidationError('invalid-width-step', 'Width step must be greater than 0.');
	}

	if (request.obstacleMargin !== undefined && request.obstacleMargin < 0) {
		throw new SmartCopperPourValidationError('invalid-obstacle-margin', 'Obstacle margin must be 0 or greater.');
	}
};

/**
 * Creates compile-safe placeholder dependencies until LCEDA integrations land.
 *
 * @public
 */
export const createSmartCopperPourPlaceholderDependencies = (): SmartCopperPourControllerDependencies => ({
	selectionInspector: {
		inspectSelection: async (): Promise<SmartCopperPourSelectionSummary> => ({
			connectionCount: 0,
			netName: null,
			layerName: null,
			selectionFingerprint: '[]',
		}),
	},
	previewGateway: {
		preview: async (): Promise<SmartCopperPourPreviewResult> => ({
			previewToken: null,
		}),
		clearPreview: async (): Promise<SmartCopperPourClearPreviewResult> => ({
			cleared: true,
		}),
	},
	applyGateway: {
		apply: async (): Promise<SmartCopperPourApplyResult> => ({
			applied: false,
		}),
	},
});

const resolveOptimizationSkeleton = (
	request: SmartCopperPourPreviewOptimizationRequest,
): { segments: ReadonlyArray<SkeletonSegment> } | undefined => {
	if (request.padNodes === undefined) {
		return undefined;
	}

	if (request.topologyMode === 'tree') {
		const plan =
			request.orthogonalRouting === false
				? planTreeBackbone(request.padNodes, { trunkBias: request.trunkBias })
				: { segments: planOrthogonalTreeBackbone(request.padNodes, { trunkBias: request.trunkBias }).segments };
		return { segments: plan.segments };
	}

	if (request.topologyMode === 'star') {
		return { segments: planStarBackbone(request.padNodes, { trunkBias: request.trunkBias }).segments };
	}

	return {
		segments:
			request.orthogonalRouting === false
				? planTreeBackbone(request.padNodes, { trunkBias: request.trunkBias }).segments
				: planDaisyChainBackbone(request.padNodes, { trunkBias: request.trunkBias }).segments,
	};
};

export const createSmartCopperPourSelectionSummary = (selection: SmartCopperPourInspectedSelection): SmartCopperPourSelectionSummary => ({
	connectionCount: selection.normalizedNodes.length,
	netName: selection.netName,
	layerName: selection.layerName,
	selectionFingerprint: createSelectionFingerprint(selection.normalizedNodes),
});

export const createSelectionFingerprint = (normalizedNodes: ReadonlyArray<PadNode>): string => {
	return JSON.stringify(
		[...normalizedNodes]
			.map((node) => ({
				center: {
					x: node.center.x,
					y: node.center.y,
				},
				effectiveRadius: node.effectiveRadius,
				id: node.id,
				layer: node.layer,
				net: node.net,
			}))
			.sort((leftNode, rightNode) => {
				return JSON.stringify(leftNode).localeCompare(JSON.stringify(rightNode));
			}),
	);
};
