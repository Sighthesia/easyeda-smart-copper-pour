import type { PadNode } from '../../domain/pad-node';
import { toLcedaLayerId } from './layer-name';

/**
 * Minimal LCEDA primitive shape consumed by the selection resolver.
 *
 * @public
 */
export interface LcedaSelectablePrimitive {
	id: string;
	type: string;
	net?: string | null;
	layer?: string | null;
	layerSpan?: LcedaViaLayerSpan | null;
	x?: number;
	y?: number;
	rotation?: number | null;
	padShape?: string | null;
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
}

export interface LcedaViaLayerSpan {
	startLayer: string;
	endLayer: string;
}

interface ResolveSelectedPadNodesOptions {
	allowViaOnlySelection?: boolean;
	minimumNodeCount?: number;
}

/**
 * Minimal normalized LCEDA pad shape.
 *
 * @public
 */
export interface LcedaPadLike extends LcedaSelectablePrimitive {
	type: 'PAD';
	x: number;
	y: number;
}

interface LcedaViaLike extends LcedaSelectablePrimitive {
	type: 'VIA';
	x: number;
	y: number;
	layerSpan: LcedaViaLayerSpan;
}

interface LcedaRadiusBearingPrimitive extends LcedaSelectablePrimitive {
	id: string;
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
}

interface LcedaUnsupportedViaLike extends LcedaSelectablePrimitive {
	type: 'VIA_UNSUPPORTED';
	x: number;
	y: number;
}

/**
 * User-facing error raised when the current selection cannot be normalized.
 *
 * @public
 */
export class SelectionResolutionError extends Error {
	public constructor(
		public readonly code:
			| 'selection-empty'
			| 'selection-too-small'
			| 'selection-mixed-net'
			| 'selection-mixed-layer'
			| 'selection-net-missing'
			| 'selection-layer-missing'
			| 'selection-layer-unsupported'
			| 'selection-via-layer-invalid'
			| 'selection-via-unsupported'
			| 'selection-pad-invalid',
		message: string,
	) {
		super(message);
		this.name = 'SelectionResolutionError';
	}
}

// eslint-disable-next-line complexity
export const resolveSelectedPadNodes = (primitives: readonly LcedaSelectablePrimitive[], options: ResolveSelectedPadNodesOptions = {}): PadNode[] => {
	const minimumNodeCount = options.minimumNodeCount ?? 2;
	const allowViaOnlySelection = options.allowViaOnlySelection ?? false;

	if (primitives.length === 0) {
		throw new SelectionResolutionError('selection-empty', '最少选择两个焊盘才可进行铺铜');
	}

	const normalizedNodes: PadNode[] = [];
	let net: string | null = null;
	let layer: string | null = null;
	let padCount = 0;
	let sawSelectableVia = false;
	const pendingViaPrimitives: LcedaSelectablePrimitive[] = [];

	for (const primitive of primitives) {
		if (isPadSelection(primitive)) {
			if (!isPadLike(primitive)) {
				throw new SelectionResolutionError('selection-pad-invalid', `Pad ${primitive.id} is missing supported metadata.`);
			}

			const currentNet = requireValue(primitive.net, 'selection-net-missing', 'Selected pads must belong to a named net.');
			const currentLayer = requireValue(primitive.layer, 'selection-layer-missing', 'Selected pads must be on a named layer.');
			requireSupportedLayerName(currentLayer, primitive.id);
			if (net === null) {
				net = currentNet;
				layer = currentLayer;
				if (pendingViaPrimitives.length > 0) {
					finalizePendingVias(pendingViaPrimitives, currentLayer, normalizedNodes, net, (value) => {
						net = value;
					});
				}
			} else {
				if (currentNet !== net) {
					throw new SelectionResolutionError('selection-mixed-net', 'Selected pads must share the same net.');
				}

				if (currentLayer !== layer) {
					throw new SelectionResolutionError('selection-mixed-layer', 'Selected pads must be on the same layer.');
				}
			}

			normalizedNodes.push({
				id: primitive.id,
				net: currentNet,
				layer: currentLayer,
				center: {
					x: primitive.x,
					y: primitive.y,
				},
				effectiveRadius: resolveEffectiveRadius(primitive),
				width: resolvePrimitiveWidth(primitive),
				height: resolvePrimitiveHeight(primitive),
				rotation: resolvePrimitiveRotation(primitive),
				outlineShape: resolvePadOutlineShape(primitive),
			});
			padCount += 1;
			continue;
		}

		if (isViaSelection(primitive)) {
			sawSelectableVia = true;
			if (layer === null) {
				pendingViaPrimitives.push(primitive);
				continue;
			}

			if (!isViaLike(primitive)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported metadata.`);
			}

			const currentNet = requireValue(primitive.net, 'selection-net-missing', 'Selected pads must belong to a named net.');
			if (net === null) {
				net = currentNet;
			} else if (currentNet !== net) {
				throw new SelectionResolutionError('selection-mixed-net', 'Selected pads must share the same net.');
			}

			if (!isSupportedLayerName(primitive.layerSpan.startLayer) || !isSupportedLayerName(primitive.layerSpan.endLayer)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} uses unsupported layer span metadata.`);
			}

			if (!doesViaSpanLayer(primitive.layerSpan, layer)) {
				throw new SelectionResolutionError(
					'selection-via-layer-invalid',
					`Via ${primitive.id} does not span the resolved target layer ${layer}.`,
				);
			}

			normalizedNodes.push({
				id: primitive.id,
				net: currentNet,
				layer,
				center: {
					x: primitive.x,
					y: primitive.y,
				},
				effectiveRadius: resolveViaEffectiveRadius(primitive),
				width: resolvePrimitiveWidth(primitive),
				height: resolvePrimitiveHeight(primitive),
				outlineShape: 'ellipse',
			});
			continue;
		}

		if (isUnsupportedViaSelection(primitive)) {
			sawSelectableVia = true;
			if (layer === null) {
				pendingViaPrimitives.push(primitive);
				continue;
			}

			if (!isUnsupportedViaLike(primitive)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported metadata.`);
			}

			throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported layer span metadata.`);
		}
	}

	if (padCount === 0 && sawSelectableVia && !allowViaOnlySelection) {
		throw new SelectionResolutionError('selection-layer-missing', 'Select at least one pad on a named layer.');
	}

	if (padCount === 0) {
		if (!allowViaOnlySelection) {
			throw new SelectionResolutionError('selection-too-small', 'Select at least two pads on the same net.');
		}

		layer = resolveViaOnlyTargetLayer(pendingViaPrimitives);
	}

	if (pendingViaPrimitives.length > 0) {
		const targetLayer = requireValue(layer, 'selection-layer-missing', 'Selected pads must be on a named layer.');
		finalizePendingVias(pendingViaPrimitives, targetLayer, normalizedNodes, net, (value) => {
			net = value;
		});
	}

	requireValue(net, 'selection-net-missing', 'Selected pads must belong to a named net.');
	requireValue(layer, 'selection-layer-missing', 'Selected pads must be on a named layer.');

	if (normalizedNodes.length < minimumNodeCount) {
		throw new SelectionResolutionError('selection-too-small', 'Select at least two pads on the same net.');
	}

	return normalizedNodes;
};

export const resolveSelectionSummaryNodes = (primitives: readonly LcedaSelectablePrimitive[]): PadNode[] => {
	const normalizedNodes: PadNode[] = [];

	for (const primitive of primitives) {
		if (isPadSelection(primitive)) {
			if (!isPadLike(primitive)) {
				throw new SelectionResolutionError('selection-pad-invalid', `Pad ${primitive.id} is missing supported metadata.`);
			}

			const currentNet = requireValue(primitive.net, 'selection-net-missing', 'Selected pads must belong to a named net.');
			const currentLayer = requireValue(primitive.layer, 'selection-layer-missing', 'Selected pads must be on a named layer.');
			requireSupportedLayerName(currentLayer, primitive.id);
			normalizedNodes.push({
				id: primitive.id,
				net: currentNet,
				layer: currentLayer,
				center: {
					x: primitive.x,
					y: primitive.y,
				},
				effectiveRadius: resolveEffectiveRadius(primitive),
				width: resolvePrimitiveWidth(primitive),
				height: resolvePrimitiveHeight(primitive),
				rotation: resolvePrimitiveRotation(primitive),
				outlineShape: resolvePadOutlineShape(primitive),
			});
			continue;
		}

		if (isViaSelection(primitive)) {
			if (!isViaLike(primitive)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported metadata.`);
			}

			const currentNet = requireValue(primitive.net, 'selection-net-missing', 'Selected pads must belong to a named net.');
			const currentLayer = resolveSummaryViaLayer(primitive.layerSpan);
			if (currentNet === null || currentLayer === null) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} uses unsupported layer span metadata.`);
			}

			normalizedNodes.push({
				id: primitive.id,
				net: currentNet,
				layer: currentLayer,
				center: {
					x: primitive.x,
					y: primitive.y,
				},
				effectiveRadius: resolveViaEffectiveRadius(primitive),
				width: resolvePrimitiveWidth(primitive),
				height: resolvePrimitiveHeight(primitive),
				outlineShape: 'ellipse',
			});
			continue;
		}

		if (isUnsupportedViaSelection(primitive)) {
			if (!isUnsupportedViaLike(primitive)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported metadata.`);
			}

			throw new SelectionResolutionError('selection-via-unsupported', `Via ${primitive.id} is missing supported layer span metadata.`);
		}
	}

	return normalizedNodes;
};

const resolveViaOnlyTargetLayer = (pendingViaPrimitives: readonly LcedaSelectablePrimitive[]): string | null => {
	for (const primitive of pendingViaPrimitives) {
		if (!isViaSelection(primitive) || !isViaLike(primitive)) {
			continue;
		}

		if (isSupportedLayerName(primitive.layerSpan.startLayer)) {
			return primitive.layerSpan.startLayer;
		}

		if (isSupportedLayerName(primitive.layerSpan.endLayer)) {
			return primitive.layerSpan.endLayer;
		}
	}

	return null;
};

const resolveSummaryViaLayer = (layerSpan: LcedaViaLayerSpan): string | null => {
	if (isSupportedLayerName(layerSpan.startLayer)) {
		return layerSpan.startLayer;
	}

	if (isSupportedLayerName(layerSpan.endLayer)) {
		return layerSpan.endLayer;
	}

	return null;
};

const finalizePendingVias = (
	pendingViaPrimitives: LcedaSelectablePrimitive[],
	targetLayer: string,
	normalizedNodes: PadNode[],
	net: string | null,
	onNetChange: (value: string) => void,
): void => {
	for (const pendingVia of pendingViaPrimitives) {
		if (isViaSelection(pendingVia)) {
			if (!isViaLike(pendingVia)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${pendingVia.id} is missing supported metadata.`);
			}

			const currentNet = requireValue(pendingVia.net, 'selection-net-missing', 'Selected pads must belong to a named net.');
			if (net !== null && currentNet !== net) {
				throw new SelectionResolutionError('selection-mixed-net', 'Selected pads must share the same net.');
			}

			onNetChange(currentNet);

			if (!isSupportedLayerName(pendingVia.layerSpan.startLayer) || !isSupportedLayerName(pendingVia.layerSpan.endLayer)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${pendingVia.id} uses unsupported layer span metadata.`);
			}

			if (!doesViaSpanLayer(pendingVia.layerSpan, targetLayer)) {
				throw new SelectionResolutionError(
					'selection-via-layer-invalid',
					`Via ${pendingVia.id} does not span the resolved target layer ${targetLayer}.`,
				);
			}

			normalizedNodes.push({
				id: pendingVia.id,
				net: currentNet,
				layer: targetLayer,
				center: {
					x: pendingVia.x,
					y: pendingVia.y,
				},
				effectiveRadius: resolveViaEffectiveRadius(pendingVia),
				width: resolvePrimitiveWidth(pendingVia),
				height: resolvePrimitiveHeight(pendingVia),
				outlineShape: 'ellipse',
			});
			continue;
		}

		if (isUnsupportedViaSelection(pendingVia)) {
			if (!isUnsupportedViaLike(pendingVia)) {
				throw new SelectionResolutionError('selection-via-unsupported', `Via ${pendingVia.id} is missing supported metadata.`);
			}

			throw new SelectionResolutionError('selection-via-unsupported', `Via ${pendingVia.id} uses unsupported layer span metadata.`);
		}
	}

	if (pendingViaPrimitives.length > 0) {
		pendingViaPrimitives.length = 0;
	}
};

const isPadLike = (primitive: LcedaSelectablePrimitive): primitive is LcedaPadLike => {
	return (
		primitive.type === 'PAD' &&
		typeof primitive.x === 'number' &&
		Number.isFinite(primitive.x) &&
		typeof primitive.y === 'number' &&
		Number.isFinite(primitive.y)
	);
};

const isPadSelection = (primitive: LcedaSelectablePrimitive): boolean => {
	return primitive.type === 'PAD';
};

const isViaLike = (primitive: LcedaSelectablePrimitive): primitive is LcedaViaLike => {
	return (
		primitive.type === 'VIA' &&
		typeof primitive.x === 'number' &&
		Number.isFinite(primitive.x) &&
		typeof primitive.y === 'number' &&
		Number.isFinite(primitive.y) &&
		isViaLayerSpan(primitive.layerSpan)
	);
};

const isViaSelection = (primitive: LcedaSelectablePrimitive): boolean => {
	return primitive.type === 'VIA';
};

const isUnsupportedViaLike = (primitive: LcedaSelectablePrimitive): primitive is LcedaUnsupportedViaLike => {
	return (
		primitive.type === 'VIA_UNSUPPORTED' &&
		typeof primitive.x === 'number' &&
		Number.isFinite(primitive.x) &&
		typeof primitive.y === 'number' &&
		Number.isFinite(primitive.y)
	);
};

const isUnsupportedViaSelection = (primitive: LcedaSelectablePrimitive): boolean => {
	return primitive.type === 'VIA_UNSUPPORTED';
};

const requireValue = (value: string | null | undefined, code: 'selection-net-missing' | 'selection-layer-missing', message: string): string => {
	if (typeof value !== 'string') {
		throw new SelectionResolutionError(code, message);
	}

	const normalizedValue = value.trim();
	if (normalizedValue.length === 0) {
		throw new SelectionResolutionError(code, message);
	}

	return normalizedValue;
};

const requireSupportedLayerName = (layerName: string, primitiveId: string): void => {
	if (!isSupportedLayerName(layerName)) {
		throw new SelectionResolutionError('selection-layer-unsupported', `Pad ${primitiveId} uses unsupported layer ${layerName}.`);
	}
};

const resolveEffectiveRadius = (pad: LcedaPadLike): number => {
	const effectiveRadius = resolveRadiusValue(pad);
	if (effectiveRadius <= 0) {
		throw new SelectionResolutionError('selection-pad-invalid', `Pad ${pad.id} is missing a usable radius.`);
	}

	return effectiveRadius;
};

const resolveViaEffectiveRadius = (via: LcedaViaLike): number => {
	const effectiveRadius = resolveRadiusValue(via);
	if (effectiveRadius <= 0) {
		throw new SelectionResolutionError('selection-via-unsupported', `Via ${via.id} is missing supported metadata.`);
	}

	return effectiveRadius;
};

const resolveRadiusValue = (primitive: LcedaRadiusBearingPrimitive): number => {
	if (typeof primitive.padRadius === 'number' && Number.isFinite(primitive.padRadius) && primitive.padRadius > 0) {
		return primitive.padRadius;
	}

	const halfWidth = typeof primitive.width === 'number' && Number.isFinite(primitive.width) ? primitive.width / 2 : 0;
	const halfHeight = typeof primitive.height === 'number' && Number.isFinite(primitive.height) ? primitive.height / 2 : 0;
	const holeRadius = typeof primitive.holeRadius === 'number' && Number.isFinite(primitive.holeRadius) ? primitive.holeRadius : 0;
	const effectiveRadius = Math.max(halfWidth, halfHeight, holeRadius);
	return effectiveRadius;
};

const resolvePrimitiveWidth = (primitive: LcedaSelectablePrimitive): number | undefined => {
	if (typeof primitive.width === 'number' && Number.isFinite(primitive.width) && primitive.width > 0) {
		return primitive.width;
	}

	if (typeof primitive.padRadius === 'number' && Number.isFinite(primitive.padRadius) && primitive.padRadius > 0) {
		return primitive.padRadius * 2;
	}

	return undefined;
};

const resolvePrimitiveHeight = (primitive: LcedaSelectablePrimitive): number | undefined => {
	if (typeof primitive.height === 'number' && Number.isFinite(primitive.height) && primitive.height > 0) {
		return primitive.height;
	}

	return resolvePrimitiveWidth(primitive);
};

const resolvePrimitiveRotation = (primitive: LcedaSelectablePrimitive): number | undefined => {
	if (typeof primitive.rotation === 'number' && Number.isFinite(primitive.rotation)) {
		return normalizeRotationDegrees(primitive.rotation);
	}

	return undefined;
};

const normalizeRotationDegrees = (rotation: number): number => {
	const normalizedRotation = rotation % 360;
	return normalizedRotation >= 0 ? normalizedRotation : normalizedRotation + 360;
};

const resolvePadOutlineShape = (primitive: LcedaSelectablePrimitive): 'ellipse' | 'rect' => {
	if (typeof primitive.padShape === 'string') {
		return ['ELLIPSE', 'ROUND', 'CIRCLE'].includes(primitive.padShape.toUpperCase()) ? 'ellipse' : 'rect';
	}

	return 'ellipse';
};

const doesViaSpanLayer = (layerSpan: LcedaViaLayerSpan, targetLayer: string): boolean => {
	const { startLayer, endLayer } = layerSpan;
	if (targetLayer === startLayer || targetLayer === endLayer) {
		return true;
	}

	const startLayerOrder = toLayerOrder(startLayer);
	const endLayerOrder = toLayerOrder(endLayer);
	const targetLayerOrder = toLayerOrder(targetLayer);
	if (startLayerOrder === null || endLayerOrder === null || targetLayerOrder === null) {
		return false;
	}

	const minimumLayerOrder = Math.min(startLayerOrder, endLayerOrder);
	const maximumLayerOrder = Math.max(startLayerOrder, endLayerOrder);
	return targetLayerOrder >= minimumLayerOrder && targetLayerOrder <= maximumLayerOrder;
};

const isViaLayerSpan = (layerSpan: LcedaSelectablePrimitive['layerSpan']): layerSpan is LcedaViaLayerSpan => {
	return (
		typeof layerSpan === 'object' &&
		layerSpan !== null &&
		typeof layerSpan.startLayer === 'string' &&
		layerSpan.startLayer.trim().length > 0 &&
		typeof layerSpan.endLayer === 'string' &&
		layerSpan.endLayer.trim().length > 0
	);
};

const isSupportedLayerName = (layerName: string): boolean => {
	return toLayerOrder(layerName) !== null;
};

const toLayerOrder = (layerName: string): number | null => {
	if (layerName === 'TopLayer') {
		return 0;
	}

	if (layerName === 'BottomLayer') {
		return Number.MAX_SAFE_INTEGER;
	}

	const innerLayerMatch = /^Inner(\d+)$/.exec(layerName);
	if (innerLayerMatch === null) {
		return null;
	}

	return toLcedaLayerId(`Inner${Number.parseInt(innerLayerMatch[1], 10)}`) === null ? null : Number.parseInt(innerLayerMatch[1], 10);
};
