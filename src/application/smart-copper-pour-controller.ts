import type {
	SmartCopperPourDaisyChainRequest,
	SmartCopperPourApplyRequest,
	SmartCopperPourApplyResult,
	SmartCopperPourClearPreviewResult,
	SmartCopperPourPreviewRequest,
	SmartCopperPourPreviewResult,
	SmartCopperPourSelectionSummary,
} from './smart-copper-pour-contract';
import type { PadNode } from '../domain/pad-node';
import { optimizeSkeletonClearance } from '../domain/clearance-optimizer';
import { planDaisyChainBackbone } from '../domain/daisy-chain-planner';
import { planStarBackbone } from '../domain/star-backbone-planner';
import type { SkeletonObstacle, SkeletonSegment } from '../domain/skeleton-types';
import { planTreeBackbone } from '../domain/tree-backbone-planner';

/**
 * Reads and normalizes the current PCB selection.
 *
 * @public
 */
export interface SmartCopperPourSelectionInspector {
	inspectSelection(): Promise<SmartCopperPourSelectionSummary>;
}

/**
 * Builds and clears preview artifacts.
 *
 * @public
 */
export interface SmartCopperPourPreviewGateway {
	preview(request: SmartCopperPourPreviewRequest): Promise<SmartCopperPourPreviewResult>;
	clearPreview(): Promise<SmartCopperPourClearPreviewResult>;
}

/**
 * Applies the final copper result.
 *
 * @public
 */
export interface SmartCopperPourApplyGateway {
	apply(request: SmartCopperPourApplyGatewayRequest): Promise<SmartCopperPourApplyResult>;
}

export type SmartCopperPourApplyGatewayRequest = SmartCopperPourApplyRequest & {
	previewToken?: string | null;
};

export interface SmartCopperPourObstacleResolverInput {
	layerName: string | null;
	netName: string | null;
}

export interface SmartCopperPourObstacleResolver {
	resolveObstacles(input: SmartCopperPourObstacleResolverInput): Promise<ReadonlyArray<SkeletonObstacle>>;
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
	| 'invalid-obstacle-margin'
	| 'missing-trunk-start'
	| 'missing-trunk-end'
	| 'invalid-trunk-start'
	| 'invalid-trunk-end';

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

	public inspectSelection(): Promise<SmartCopperPourSelectionSummary> {
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
			baseWidth: request.width,
			maxWidth: request.maxWidth ?? request.width,
			widthStep: request.widthStep ?? 1,
			keepoutMargin: request.keepoutMargin,
			obstacleMargin: request.obstacleMargin,
		});

		return {
			...request,
			width: optimized.width,
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

	if (request.topologyMode === 'daisyChain' && request.trunkStart === undefined) {
		throw new SmartCopperPourValidationError('missing-trunk-start', 'Daisy Chain mode requires a trunk start point.');
	}

	if (request.topologyMode === 'daisyChain' && request.trunkEnd === undefined) {
		throw new SmartCopperPourValidationError('missing-trunk-end', 'Daisy Chain mode requires a trunk end point.');
	}

	if (
		request.topologyMode === 'daisyChain' &&
		request.trunkStart !== undefined &&
		(!Number.isFinite(request.trunkStart.x) || !Number.isFinite(request.trunkStart.y))
	) {
		throw new SmartCopperPourValidationError('invalid-trunk-start', 'Daisy Chain mode requires a valid trunk start point.');
	}

	if (
		request.topologyMode === 'daisyChain' &&
		request.trunkEnd !== undefined &&
		(!Number.isFinite(request.trunkEnd.x) || !Number.isFinite(request.trunkEnd.y))
	) {
		throw new SmartCopperPourValidationError('invalid-trunk-end', 'Daisy Chain mode requires a valid trunk end point.');
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
			padCount: 0,
			netName: null,
			layerName: null,
		}),
	},
	previewGateway: {
		preview: async (_request: SmartCopperPourPreviewRequest): Promise<SmartCopperPourPreviewResult> => ({
			previewToken: null,
		}),
		clearPreview: async (): Promise<SmartCopperPourClearPreviewResult> => ({
			cleared: true,
		}),
	},
		applyGateway: {
			apply: async (_request: SmartCopperPourApplyGatewayRequest): Promise<SmartCopperPourApplyResult> => ({
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
		const plan = planTreeBackbone(request.padNodes, { trunkBias: request.trunkBias });
		return { segments: plan.segments };
	}

	if (request.topologyMode === 'star') {
		return { segments: planStarBackbone(request.padNodes).segments };
	}

	return {
		segments: planDaisyChainBackbone(request.padNodes, {
			trunkStart: (request as SmartCopperPourDaisyChainRequest).trunkStart,
			trunkEnd: (request as SmartCopperPourDaisyChainRequest).trunkEnd,
		}).segments,
	};
};
