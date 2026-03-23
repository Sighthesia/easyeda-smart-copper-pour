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
	x?: number;
	y?: number;
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
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
	if (pads.length < 2) {
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

	return pads.map((pad) => ({
		id: pad.id,
		net,
		layer,
		center: {
			x: pad.x,
			y: pad.y,
		},
		effectiveRadius: resolveEffectiveRadius(pad),
	}));
};

const isPadLike = (primitive: LcedaSelectablePrimitive): primitive is LcedaPadLike => {
	return primitive.type === 'PAD' && typeof primitive.x === 'number' && Number.isFinite(primitive.x) && typeof primitive.y === 'number' && Number.isFinite(primitive.y);
};

const requireValue = (
	value: string | null | undefined,
	code: 'selection-net-missing' | 'selection-layer-missing',
	message: string,
): string => {
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
	if (typeof pad.padRadius === 'number' && Number.isFinite(pad.padRadius) && pad.padRadius > 0) {
		return pad.padRadius;
	}

	const halfWidth = typeof pad.width === 'number' && Number.isFinite(pad.width) ? pad.width / 2 : 0;
	const halfHeight = typeof pad.height === 'number' && Number.isFinite(pad.height) ? pad.height / 2 : 0;
	const holeRadius = typeof pad.holeRadius === 'number' && Number.isFinite(pad.holeRadius) ? pad.holeRadius : 0;
	const effectiveRadius = Math.max(halfWidth, halfHeight, holeRadius);
	if (effectiveRadius <= 0) {
		throw new SelectionResolutionError('selection-pad-invalid', `Pad ${pad.id} is missing a usable radius.`);
	}

	return effectiveRadius;
};
