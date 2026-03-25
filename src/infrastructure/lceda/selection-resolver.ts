import type { PadNode } from '../../domain/pad-node';

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
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
}

export interface LcedaViaLayerSpan {
	startLayer: string;
	endLayer: string;
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
			| 'selection-via-layer-invalid'
			| 'selection-via-unsupported'
			| 'selection-pad-invalid',
		message: string,
	) {
		super(message);
		this.name = 'SelectionResolutionError';
	}
}

export const resolveSelectedPadNodes = (primitives: readonly LcedaSelectablePrimitive[]): PadNode[] => {
	if (primitives.length === 0) {
		throw new SelectionResolutionError('selection-empty', 'Select at least two pads before running Smart Copper Pour.');
	}

	const pads = primitives.filter(isPadLike);
	const selectedPads = primitives.filter(isPadSelection);
	const invalidPads = selectedPads.filter((primitive) => !isPadLike(primitive));
	const selectedVias = primitives.filter(isViaSelection);
	const vias = selectedVias.filter(isViaLike);
	const invalidVias = selectedVias.filter((primitive) => !isViaLike(primitive));
	const selectedUnsupportedVias = primitives.filter(isUnsupportedViaSelection);
	const unsupportedVias = selectedUnsupportedVias.filter(isUnsupportedViaLike);
	const invalidUnsupportedVias = selectedUnsupportedVias.filter((primitive) => !isUnsupportedViaLike(primitive));
	if (invalidPads.length > 0) {
		throw new SelectionResolutionError('selection-pad-invalid', `Pad ${invalidPads[0].id} is missing supported metadata.`);
	}

	if (pads.length === 0 && (selectedVias.length > 0 || unsupportedVias.length > 0)) {
		throw new SelectionResolutionError('selection-layer-missing', 'Select at least one pad on a named layer.');
	}

	if (invalidVias.length > 0) {
		throw new SelectionResolutionError('selection-via-unsupported', `Via ${invalidVias[0].id} is missing supported metadata.`);
	}

	if (invalidUnsupportedVias.length > 0) {
		throw new SelectionResolutionError('selection-via-unsupported', `Via ${invalidUnsupportedVias[0].id} is missing supported metadata.`);
	}

	if (unsupportedVias.length > 0) {
		throw new SelectionResolutionError('selection-via-unsupported', `Via ${unsupportedVias[0].id} is missing supported layer span metadata.`);
	}

	if (pads.length === 0) {
		throw new SelectionResolutionError('selection-too-small', 'Select at least two pads on the same net.');
	}

	const net = requireValue(pads[0].net, 'selection-net-missing', 'Selected pads must belong to a named net.');
	const layer = requireValue(pads[0].layer, 'selection-layer-missing', 'Selected pads must be on a named layer.');

	for (const pad of pads) {
		if (requireValue(pad.net, 'selection-net-missing', 'Selected pads must belong to a named net.') !== net) {
			throw new SelectionResolutionError('selection-mixed-net', 'Selected pads must share the same net.');
		}

		if (requireValue(pad.layer, 'selection-layer-missing', 'Selected pads must be on a named layer.') !== layer) {
			throw new SelectionResolutionError('selection-mixed-layer', 'Selected pads must be on the same layer.');
		}
	}

	const normalizedVias = vias.map((via) => {
		if (requireValue(via.net, 'selection-net-missing', 'Selected pads must belong to a named net.') !== net) {
			throw new SelectionResolutionError('selection-mixed-net', 'Selected pads must share the same net.');
		}

		if (!isSupportedLayerName(via.layerSpan.startLayer) || !isSupportedLayerName(via.layerSpan.endLayer)) {
			throw new SelectionResolutionError('selection-via-unsupported', `Via ${via.id} uses unsupported layer span metadata.`);
		}

		if (!doesViaSpanLayer(via.layerSpan, layer)) {
			throw new SelectionResolutionError('selection-via-layer-invalid', `Via ${via.id} does not span the resolved target layer ${layer}.`);
		}

		return {
			id: via.id,
			net,
			layer,
			center: {
				x: via.x,
				y: via.y,
			},
			effectiveRadius: resolveViaEffectiveRadius(via),
		};
	});

	const normalizedPads = pads.map((pad) => ({
		id: pad.id,
		net,
		layer,
		center: {
			x: pad.x,
			y: pad.y,
		},
		effectiveRadius: resolveEffectiveRadius(pad),
	}));

	const normalizedNodes = [...normalizedPads, ...normalizedVias];
	if (normalizedNodes.length < 2) {
		throw new SelectionResolutionError('selection-too-small', 'Select at least two pads on the same net.');
	}

	return normalizedNodes;
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

	return Number.parseInt(innerLayerMatch[1], 10);
};
