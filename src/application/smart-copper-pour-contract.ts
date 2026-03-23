import { TopologyMode } from '../domain/topology-mode';

export const SMART_COPPER_POUR_IFRAME_ID = 'smart-copper-pour';
export const SMART_COPPER_POUR_REQUEST_TOPIC = 'smart-copper-pour/request';
export const SMART_COPPER_POUR_RESPONSE_TOPIC = 'smart-copper-pour/response';

/**
 * Supported smart copper request commands.
 *
 * @public
 */
export type SmartCopperPourCommand = 'inspectSelection' | 'preview' | 'apply' | 'clearPreview';

/**
 * Supported topology modes.
 *
 * @public
 */
export type SmartCopperPourTopologyMode = TopologyMode;

const SMART_COPPER_POUR_TOPOLOGY_MODES = new Set<string>(Object.values(TopologyMode));

/**
 * Supported corner styles.
 *
 * @public
 */
export type SmartCopperPourCornerStyle = 'round' | 'miter' | 'bevel';
export type SmartCopperPourTrunkBias = 'neutral' | 'horizontal' | 'vertical';

export interface SmartCopperPourTrunkPoint {
	x: number;
	y: number;
}

/**
 * Normalized selection summary shown to the UI.
 *
 * @public
 */
export interface SmartCopperPourSelectionSummary {
	padCount: number;
	netName: string | null;
	layerName: string | null;
}

/**
 * Preview request payload.
 *
 * @public
 */
export interface SmartCopperPourRequestBase {
	width: number;
	keepoutMargin: number;
	cornerStyle?: SmartCopperPourCornerStyle;
	trunkBias?: SmartCopperPourTrunkBias;
	autoExpand?: boolean;
	maxWidth?: number;
	widthStep?: number;
	obstacleMargin?: number;
}

export interface SmartCopperPourTreeLikeRequest extends SmartCopperPourRequestBase {
	topologyMode: TopologyMode.Tree | TopologyMode.Star;
}

export interface SmartCopperPourDaisyChainRequest extends SmartCopperPourRequestBase {
	topologyMode: TopologyMode.DaisyChain;
	trunkStart: SmartCopperPourTrunkPoint;
	trunkEnd: SmartCopperPourTrunkPoint;
}

export type SmartCopperPourPreviewRequest = SmartCopperPourTreeLikeRequest | SmartCopperPourDaisyChainRequest;

/**
 * Apply request payload.
 *
 * @public
 */
export type SmartCopperPourApplyRequest = SmartCopperPourPreviewRequest;

/**
 * Preview result payload.
 *
 * @public
 */
export interface SmartCopperPourPreviewResult {
	previewToken: string | null;
}

/**
 * Apply result payload.
 *
 * @public
 */
export interface SmartCopperPourApplyResult {
	applied: boolean;
}

/**
 * Clear preview result payload.
 *
 * @public
 */
export interface SmartCopperPourClearPreviewResult {
	cleared: boolean;
}

/**
 * Error payload shared by controller and message bus.
 *
 * @public
 */
export interface SmartCopperPourErrorPayload {
	code: string;
	message: string;
	details?: string;
}

/**
 * Request envelope sent from the iframe.
 *
 * @public
 */
export type SmartCopperPourInspectSelectionMessage = {
	command: 'inspectSelection';
	payload?: undefined;
};

/**
 * Preview request envelope sent from the iframe.
 *
 * @public
 */
export type SmartCopperPourPreviewMessage = {
	command: 'preview';
	payload: SmartCopperPourPreviewRequest;
};

/**
 * Apply request envelope sent from the iframe.
 *
 * @public
 */
export type SmartCopperPourApplyMessage = {
	command: 'apply';
	payload: SmartCopperPourApplyRequest;
};

/**
 * Clear preview request envelope sent from the iframe.
 *
 * @public
 */
export type SmartCopperPourClearPreviewMessage = {
	command: 'clearPreview';
	payload?: undefined;
};

/**
 * Request envelope sent from the iframe.
 *
 * @public
 */
export type SmartCopperPourRequestMessage =
	| SmartCopperPourInspectSelectionMessage
	| SmartCopperPourPreviewMessage
	| SmartCopperPourApplyMessage
	| SmartCopperPourClearPreviewMessage;

/**
 * Request payload map keyed by command.
 *
 * @public
 */
export interface SmartCopperPourRequestPayloadByCommand {
	inspectSelection: undefined;
	preview: SmartCopperPourPreviewRequest;
	apply: SmartCopperPourApplyRequest;
	clearPreview: undefined;
}

/**
 * Response payload map keyed by command.
 *
 * @public
 */
export interface SmartCopperPourResponsePayloadByCommand {
	inspectSelection: SmartCopperPourSelectionSummary;
	preview: SmartCopperPourPreviewResult;
	apply: SmartCopperPourApplyResult;
	clearPreview: SmartCopperPourClearPreviewResult;
}

/**
 * Success response envelope sent to the iframe.
 *
 * @public
 */
export interface SmartCopperPourSuccessMessage<TCommand extends SmartCopperPourCommand> {
	ok: true;
	command: TCommand;
	payload: SmartCopperPourResponsePayloadByCommand[TCommand];
}

/**
 * Failure response envelope sent to the iframe.
 *
 * @public
 */
export interface SmartCopperPourFailureMessage<TCommand extends SmartCopperPourCommand> {
	ok: false;
	command: TCommand;
	error: SmartCopperPourErrorPayload;
}

/**
 * Response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourInspectSelectionResponseMessage =
	| SmartCopperPourSuccessMessage<'inspectSelection'>
	| SmartCopperPourFailureMessage<'inspectSelection'>;

/**
 * Preview response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourPreviewResponseMessage =
	| SmartCopperPourSuccessMessage<'preview'>
	| SmartCopperPourFailureMessage<'preview'>;

/**
 * Apply response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourApplyResponseMessage =
	| SmartCopperPourSuccessMessage<'apply'>
	| SmartCopperPourFailureMessage<'apply'>;

/**
 * Clear preview response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourClearPreviewResponseMessage =
	| SmartCopperPourSuccessMessage<'clearPreview'>
	| SmartCopperPourFailureMessage<'clearPreview'>;

/**
 * Response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourResponseMessage =
	| SmartCopperPourInspectSelectionResponseMessage
	| SmartCopperPourPreviewResponseMessage
	| SmartCopperPourApplyResponseMessage
	| SmartCopperPourClearPreviewResponseMessage;

/**
 * Narrows an unknown message into a Smart Copper request envelope.
 *
 * @public
 */
export const isSmartCopperPourRequestMessage = (value: unknown): value is SmartCopperPourRequestMessage => {
	if (typeof value !== 'object' || value === null || !('command' in value)) {
		return false;
	}

	const request = value as { command?: unknown; payload?: unknown };

	switch (request.command) {
		case 'inspectSelection':
		case 'clearPreview':
			return request.payload === undefined;
		case 'preview':
			return isSmartCopperPourPreviewRequest(request.payload);
		case 'apply':
			return isSmartCopperPourApplyRequest(request.payload);
		default:
			return false;
	}
};

/**
 * Narrows an unknown message into a Smart Copper response envelope.
 *
 * @public
 */
export const isSmartCopperPourResponseMessage = (value: unknown): value is SmartCopperPourResponseMessage => {
	if (typeof value !== 'object' || value === null || !('command' in value) || !('ok' in value)) {
		return false;
	}

	const response = value as { command?: unknown; ok?: unknown; payload?: unknown; error?: unknown };
	if (
		response.command !== 'inspectSelection' &&
		response.command !== 'preview' &&
		response.command !== 'apply' &&
		response.command !== 'clearPreview'
	) {
		return false;
	}

	if (response.ok === true) {
		return 'payload' in response;
	}

	if (response.ok === false) {
		return isSmartCopperPourErrorPayload(response.error);
	}

	return false;
};

const isSmartCopperPourRequestBase = (value: unknown): value is SmartCopperPourRequestBase => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const request = value as Record<string, unknown>;
	return (
		typeof request.topologyMode === 'string' &&
		SMART_COPPER_POUR_TOPOLOGY_MODES.has(request.topologyMode) &&
		isFiniteNumber(request.width) &&
		isFiniteNumber(request.keepoutMargin) &&
		(request.autoExpand === undefined || typeof request.autoExpand === 'boolean') &&
		(request.maxWidth === undefined || isFiniteNumber(request.maxWidth)) &&
		(request.widthStep === undefined || isFiniteNumber(request.widthStep)) &&
		(request.obstacleMargin === undefined || isFiniteNumber(request.obstacleMargin)) &&
		(request.trunkBias === undefined ||
			request.trunkBias === 'neutral' ||
			request.trunkBias === 'horizontal' ||
			request.trunkBias === 'vertical') &&
		(request.cornerStyle === undefined ||
			request.cornerStyle === 'round' ||
			request.cornerStyle === 'miter' ||
			request.cornerStyle === 'bevel')
	);
};

const isSmartCopperPourApplyRequest = (value: unknown): value is SmartCopperPourApplyRequest => {
	if (!isSmartCopperPourPreviewRequest(value)) {
		return false;
	}

	const request = value as { previewToken?: unknown };
	return request.previewToken === undefined;
};

const isSmartCopperPourPreviewRequest = (value: unknown): value is SmartCopperPourPreviewRequest => {
	if (!isSmartCopperPourRequestBase(value)) {
		return false;
	}

	const request = value as { topologyMode?: unknown; trunkStart?: unknown; trunkEnd?: unknown };
	if (request.topologyMode === TopologyMode.DaisyChain) {
		return isTrunkPoint(request.trunkStart) && isTrunkPoint(request.trunkEnd);
	}

	return request.topologyMode === TopologyMode.Tree || request.topologyMode === TopologyMode.Star;
};

const isSmartCopperPourErrorPayload = (value: unknown): value is SmartCopperPourErrorPayload => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const error = value as { code?: unknown; message?: unknown; details?: unknown };
	return (
		typeof error.code === 'string' &&
		typeof error.message === 'string' &&
		(error.details === undefined || typeof error.details === 'string')
	);
};

const isTrunkPoint = (value: unknown): value is SmartCopperPourTrunkPoint => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const point = value as { x?: unknown; y?: unknown };
	return isFiniteNumber(point.x) && isFiniteNumber(point.y);
};

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
