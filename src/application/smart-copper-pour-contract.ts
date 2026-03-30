import { TopologyMode } from '../domain/topology-mode';

export const SMART_COPPER_POUR_IFRAME_ID = 'smart-copper-pour';
export const SMART_COPPER_POUR_REQUEST_TOPIC = 'smart-copper-pour/request';
export const SMART_COPPER_POUR_RESPONSE_TOPIC = 'smart-copper-pour/response';
export const SMART_COPPER_POUR_EVENT_TOPIC = 'smart-copper-pour/event';
export const SMART_COPPER_POUR_LOG_SCOPE = 'Smart Copper Pour';

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
export type SmartCopperPourCornerStyle = 'bevel45' | 'rightAngle' | 'round';
export type SmartCopperPourStarAreaShape = 'boundingBox' | 'convexHull';
export type SmartCopperPourTrunkBias = 'neutral' | 'horizontal' | 'vertical';

export interface SmartCopperPourMessageMeta {
	sequence?: number;
}

export interface SmartCopperPourViaLayerSpan {
	startLayer: string;
	endLayer: string;
}

export interface SmartCopperPourSelectedPadPrimitive {
	id: string;
	type: 'PAD';
	net: string | null;
	layer: string | null;
	x: number;
	y: number;
	padShape?: string | null;
	width: number | null;
	height: number | null;
	padRadius: number | null;
	holeRadius: number | null;
}

export interface SmartCopperPourSelectedViaPrimitive {
	id: string;
	type: 'VIA';
	net: string | null;
	x: number;
	y: number;
	layerSpan: SmartCopperPourViaLayerSpan;
	padRadius: number | null;
}

export interface SmartCopperPourSelectedUnsupportedViaPrimitive {
	id: string;
	type: 'VIA_UNSUPPORTED';
	net: string | null;
	x: number;
	y: number;
}

export interface SmartCopperPourSelectedOtherPrimitive {
	id: string;
	type: 'OTHER';
}

export type SmartCopperPourSelectedPrimitive =
	| SmartCopperPourSelectedPadPrimitive
	| SmartCopperPourSelectedViaPrimitive
	| SmartCopperPourSelectedUnsupportedViaPrimitive
	| SmartCopperPourSelectedOtherPrimitive;

export interface SmartCopperPourInspectSelectionRequest {
	selectionPrimitives?: readonly SmartCopperPourSelectedPrimitive[];
}

/**
 * Normalized selection summary shown to the UI.
 *
 * @public
 */
export interface SmartCopperPourSelectionSummary {
	connectionCount: number;
	netName: string | null;
	layerName: string | null;
	selectionFingerprint: string;
}

export interface SmartCopperPourSelectionChangedEventMessage {
	type: 'selectionChanged';
}

export type SmartCopperPourEventMessage = SmartCopperPourSelectionChangedEventMessage;

/**
 * Preview request payload.
 *
 * @public
 */
export interface SmartCopperPourRequestBase {
	width: number;
	keepoutMargin: number;
	cornerStyle?: SmartCopperPourCornerStyle;
	starAreaShape?: SmartCopperPourStarAreaShape;
	useNodeSizeAsBaseWidth?: boolean;
	orthogonalRouting?: boolean;
	trunkBias?: SmartCopperPourTrunkBias;
	autoExpand?: boolean;
	maxWidth?: number;
	widthStep?: number;
	obstacleMargin?: number;
	selectionPrimitives?: readonly SmartCopperPourSelectedPrimitive[];
}

export interface SmartCopperPourTreeLikeRequest extends SmartCopperPourRequestBase {
	topologyMode: TopologyMode.Tree | TopologyMode.Star;
}

export interface SmartCopperPourDaisyChainRequest extends SmartCopperPourRequestBase {
	topologyMode: TopologyMode.DaisyChain;
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
export interface SmartCopperPourInspectSelectionMessage {
	command: 'inspectSelection';
	meta?: SmartCopperPourMessageMeta;
	payload?: SmartCopperPourInspectSelectionRequest;
}

/**
 * Preview request envelope sent from the iframe.
 *
 * @public
 */
export interface SmartCopperPourPreviewMessage {
	command: 'preview';
	meta?: SmartCopperPourMessageMeta;
	payload: SmartCopperPourPreviewRequest;
}

/**
 * Apply request envelope sent from the iframe.
 *
 * @public
 */
export interface SmartCopperPourApplyMessage {
	command: 'apply';
	meta?: SmartCopperPourMessageMeta;
	payload: SmartCopperPourApplyRequest;
}

/**
 * Clear preview request envelope sent from the iframe.
 *
 * @public
 */
export interface SmartCopperPourClearPreviewMessage {
	command: 'clearPreview';
	meta?: SmartCopperPourMessageMeta;
	payload?: undefined;
}

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
	inspectSelection: SmartCopperPourInspectSelectionRequest | undefined;
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
	meta?: SmartCopperPourMessageMeta;
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
	meta?: SmartCopperPourMessageMeta;
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
export type SmartCopperPourPreviewResponseMessage = SmartCopperPourSuccessMessage<'preview'> | SmartCopperPourFailureMessage<'preview'>;

/**
 * Apply response envelope sent to the iframe.
 *
 * @public
 */
export type SmartCopperPourApplyResponseMessage = SmartCopperPourSuccessMessage<'apply'> | SmartCopperPourFailureMessage<'apply'>;

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
	if (!isOptionalSmartCopperPourMessageMeta((value as { meta?: unknown }).meta)) {
		return false;
	}

	switch (request.command) {
		case 'inspectSelection':
			return request.payload === undefined || isSmartCopperPourInspectSelectionRequest(request.payload);
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

	const response = value as { command?: unknown; ok?: unknown; payload?: unknown; error?: unknown; meta?: unknown };
	if (!isOptionalSmartCopperPourMessageMeta(response.meta)) {
		return false;
	}

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

export const isSmartCopperPourEventMessage = (value: unknown): value is SmartCopperPourEventMessage => {
	if (typeof value !== 'object' || value === null || !('type' in value)) {
		return false;
	}

	return (value as { type?: unknown }).type === 'selectionChanged';
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
		isOptionalBoolean(request.autoExpand) &&
		isOptionalFiniteNumber(request.maxWidth) &&
		isOptionalFiniteNumber(request.widthStep) &&
		isOptionalFiniteNumber(request.obstacleMargin) &&
		isOptionalSelectedPrimitiveArray(request.selectionPrimitives) &&
		isSmartCopperPourStarAreaShape(request.starAreaShape) &&
		isOptionalBoolean(request.useNodeSizeAsBaseWidth) &&
		isOptionalBoolean(request.orthogonalRouting) &&
		isSmartCopperPourTrunkBias(request.trunkBias) &&
		isSmartCopperPourCornerStyle(request.cornerStyle)
	);
};

const isSmartCopperPourInspectSelectionRequest = (value: unknown): value is SmartCopperPourInspectSelectionRequest => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const request = value as { selectionPrimitives?: unknown };
	return request.selectionPrimitives === undefined || isSmartCopperPourSelectedPrimitiveArray(request.selectionPrimitives);
};

const isSmartCopperPourSelectedPrimitiveArray = (value: unknown): value is readonly SmartCopperPourSelectedPrimitive[] => {
	return Array.isArray(value) && value.every(isSmartCopperPourSelectedPrimitive);
};

const isSmartCopperPourSelectedPrimitive = (value: unknown): value is SmartCopperPourSelectedPrimitive => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const primitive = value as {
		id?: unknown;
		type?: unknown;
		net?: unknown;
		layer?: unknown;
		x?: unknown;
		y?: unknown;
		padShape?: unknown;
		width?: unknown;
		height?: unknown;
		padRadius?: unknown;
		holeRadius?: unknown;
		layerSpan?: unknown;
	};
	if (typeof primitive.id !== 'string') {
		return false;
	}

	switch (primitive.type) {
		case 'PAD':
			return isSmartCopperPourSelectedPadPrimitive(primitive);
		case 'VIA':
			return isSmartCopperPourSelectedViaPrimitive(primitive);
		case 'VIA_UNSUPPORTED':
			return isSmartCopperPourSelectedUnsupportedViaPrimitive(primitive);
		case 'OTHER':
			return true;
		default:
			return false;
	}
};

const isSmartCopperPourSelectedPadPrimitive = (primitive: {
	net?: unknown;
	layer?: unknown;
	x?: unknown;
	y?: unknown;
	padShape?: unknown;
	width?: unknown;
	height?: unknown;
	padRadius?: unknown;
	holeRadius?: unknown;
}): boolean => {
	return (
		isNullableString(primitive.net) &&
		isNullableString(primitive.layer) &&
		isFiniteNumber(primitive.x) &&
		isFiniteNumber(primitive.y) &&
		isNullableString(primitive.padShape) &&
		isNullableFiniteNumber(primitive.width) &&
		isNullableFiniteNumber(primitive.height) &&
		isNullableFiniteNumber(primitive.padRadius) &&
		isNullableFiniteNumber(primitive.holeRadius)
	);
};

const isSmartCopperPourSelectedViaPrimitive = (primitive: {
	net?: unknown;
	x?: unknown;
	y?: unknown;
	padRadius?: unknown;
	layerSpan?: unknown;
}): boolean => {
	return (
		isNullableString(primitive.net) &&
		isFiniteNumber(primitive.x) &&
		isFiniteNumber(primitive.y) &&
		isNullableFiniteNumber(primitive.padRadius) &&
		isSmartCopperPourViaLayerSpan(primitive.layerSpan)
	);
};

const isSmartCopperPourSelectedUnsupportedViaPrimitive = (primitive: { net?: unknown; x?: unknown; y?: unknown }): boolean => {
	return isNullableString(primitive.net) && isFiniteNumber(primitive.x) && isFiniteNumber(primitive.y);
};

const isSmartCopperPourViaLayerSpan = (value: unknown): value is SmartCopperPourViaLayerSpan => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const layerSpan = value as { startLayer?: unknown; endLayer?: unknown };
	return typeof layerSpan.startLayer === 'string' && typeof layerSpan.endLayer === 'string';
};

const isSmartCopperPourTrunkBias = (value: unknown): value is SmartCopperPourTrunkBias | undefined => {
	return value === undefined || value === 'neutral' || value === 'horizontal' || value === 'vertical';
};

const isSmartCopperPourStarAreaShape = (value: unknown): value is SmartCopperPourStarAreaShape | undefined => {
	return value === undefined || value === 'boundingBox' || value === 'convexHull';
};

const isSmartCopperPourCornerStyle = (value: unknown): value is SmartCopperPourCornerStyle | undefined => {
	return value === undefined || value === 'round' || value === 'rightAngle' || value === 'bevel45';
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

	const request = value as {
		topologyMode?: unknown;
		trunkMode?: unknown;
		trunkStart?: unknown;
		trunkEnd?: unknown;
		starAreaShape?: unknown;
	};
	if (request.trunkMode !== undefined || request.trunkStart !== undefined || request.trunkEnd !== undefined) {
		return false;
	}

	if (request.topologyMode === TopologyMode.Tree) {
		return request.starAreaShape === undefined;
	}

	if (request.topologyMode === TopologyMode.Star) {
		return isSmartCopperPourStarAreaShape(request.starAreaShape);
	}

	return request.topologyMode === TopologyMode.DaisyChain && request.starAreaShape === undefined;
};

const isOptionalSmartCopperPourMessageMeta = (value: unknown): value is SmartCopperPourMessageMeta | undefined => {
	return value === undefined || isSmartCopperPourMessageMeta(value);
};

const isSmartCopperPourMessageMeta = (value: unknown): value is SmartCopperPourMessageMeta => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const meta = value as { sequence?: unknown };
	return meta.sequence === undefined || isFiniteNumber(meta.sequence);
};

const isSmartCopperPourErrorPayload = (value: unknown): value is SmartCopperPourErrorPayload => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const error = value as { code?: unknown; message?: unknown; details?: unknown };
	return typeof error.code === 'string' && typeof error.message === 'string' && (error.details === undefined || typeof error.details === 'string');
};

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isOptionalFiniteNumber = (value: unknown): value is number | undefined => value === undefined || isFiniteNumber(value);

const isOptionalBoolean = (value: unknown): value is boolean | undefined => value === undefined || typeof value === 'boolean';

const isOptionalSelectedPrimitiveArray = (value: unknown): value is readonly SmartCopperPourSelectedPrimitive[] | undefined => {
	return value === undefined || isSmartCopperPourSelectedPrimitiveArray(value);
};

const isNullableFiniteNumber = (value: unknown): value is number | null => value === null || isFiniteNumber(value);

const isNullableString = (value: unknown): value is string | null => value === null || typeof value === 'string';
