import type { SmartCopperPourSelectionSummary } from '../../application/smart-copper-pour-contract';
import { createSmartCopperPourSelectionSummary, type SmartCopperPourSelectionInspector } from '../../application/smart-copper-pour-controller';
import { type LcedaSelectablePrimitive, type LcedaViaLayerSpan, resolveSelectedPadNodes } from './selection-resolver';

interface LcedaPadSelectablePrimitive extends LcedaSelectablePrimitive {
	type: 'PAD';
	net: string | null;
	layer: string | null;
	x: number;
	y: number;
	width: number | null;
	height: number | null;
	padRadius: number | null;
	holeRadius: number | null;
}

interface LcedaViaSelectablePrimitive extends LcedaSelectablePrimitive {
	type: 'VIA';
	net: string | null;
	x: number;
	y: number;
	layerSpan: LcedaViaLayerSpan;
	padRadius: number | null;
}

interface LcedaUnsupportedViaSelectablePrimitive extends LcedaSelectablePrimitive {
	type: 'VIA_UNSUPPORTED';
	net: string | null;
	x: number;
	y: number;
}

interface LcedaOtherSelectablePrimitive extends LcedaSelectablePrimitive {
	type: 'OTHER';
}

export type LcedaInspectedSelectablePrimitive =
	| LcedaPadSelectablePrimitive
	| LcedaViaSelectablePrimitive
	| LcedaUnsupportedViaSelectablePrimitive
	| LcedaOtherSelectablePrimitive;

/**
 * Reads the current raw selection from LCEDA.
 *
 * @public
 */
export interface LcedaSelectedPrimitivesReader {
	readSelectedPrimitives: () => Promise<readonly LcedaInspectedSelectablePrimitive[]>;
}

interface LcedaPadPrimitiveShape {
	getState_PrimitiveId: () => string;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Layer: () => unknown;
	getState_Net: () => string | undefined;
	getState_Pad: () => [unknown, number, number] | [unknown, number, number, number] | [unknown, unknown] | undefined;
	getState_Hole: () => [unknown, number, number] | null;
}

interface LcedaViaPrimitiveShape {
	getState_PrimitiveId: () => string;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Net: () => string | undefined;
	getState_StartLayer: () => unknown;
	getState_EndLayer: () => unknown;
	getState_Diameter?: () => unknown;
}

export const createSmartCopperPourSelectionInspector = (reader: LcedaSelectedPrimitivesReader): SmartCopperPourSelectionInspector => ({
	inspectSelection: async (): Promise<SmartCopperPourSelectionSummary> => {
		const selectedPrimitives = await reader.readSelectedPrimitives();
		const normalizedNodes = resolveSelectedPadNodes(selectedPrimitives);
		return createSmartCopperPourSelectionSummary({
			normalizedNodes,
			netName: normalizedNodes[0]?.net ?? null,
			layerName: normalizedNodes[0]?.layer ?? null,
		});
	},
});

export const createLcedaSelectedPrimitivesReader = (): LcedaSelectedPrimitivesReader => ({
	readSelectedPrimitives: async (): Promise<readonly LcedaInspectedSelectablePrimitive[]> => {
		const primitives = await readRuntimeSelectedPrimitives();
		return primitives.map(toSelectablePrimitive);
	},
});

const readRuntimeSelectedPrimitives = async (): Promise<readonly IPCB_Primitive[]> => {
	const selectionControl = (eda as { pcb_SelectControl?: { getAllSelectedPrimitives?: () => Promise<unknown> } } | undefined)?.pcb_SelectControl;
	if (selectionControl === undefined || typeof selectionControl.getAllSelectedPrimitives !== 'function') {
		throw new Error('LCEDA selected primitives API is unavailable.');
	}

	const primitives = await selectionControl.getAllSelectedPrimitives();
	if (!Array.isArray(primitives)) {
		throw new Error('LCEDA selected primitives API returned an unusable result.');
	}

	return primitives as readonly IPCB_Primitive[];
};

const toSelectablePrimitive = (primitive: IPCB_Primitive): LcedaInspectedSelectablePrimitive => {
	if (isSupportedLcedaViaPrimitive(primitive)) {
		const diameter = typeof primitive.getState_Diameter === 'function' ? primitive.getState_Diameter() : null;
		return {
			id: primitive.getState_PrimitiveId(),
			type: 'VIA',
			net: primitive.getState_Net() ?? null,
			x: primitive.getState_X(),
			y: primitive.getState_Y(),
			layerSpan: toLayerSpan(primitive.getState_StartLayer(), primitive.getState_EndLayer()),
			padRadius: typeof diameter === 'number' && Number.isFinite(diameter) && diameter > 0 ? diameter / 2 : null,
		};
	}

	if (isUnsupportedLcedaViaPrimitive(primitive)) {
		return {
			id: primitive.getState_PrimitiveId(),
			type: 'VIA_UNSUPPORTED',
			net: primitive.getState_Net() ?? null,
			x: primitive.getState_X(),
			y: primitive.getState_Y(),
		};
	}

	if (!isLcedaPadPrimitive(primitive)) {
		return {
			id: primitive.getState_PrimitiveId(),
			type: 'OTHER',
		};
	}

	const padShape = primitive.getState_Pad();
	const holeShape = primitive.getState_Hole();
	const width = Array.isArray(padShape) && typeof padShape[1] === 'number' ? padShape[1] : null;
	const height = Array.isArray(padShape) && typeof padShape[2] === 'number' ? padShape[2] : width;
	const holeRadius = Array.isArray(holeShape) && typeof holeShape[1] === 'number' ? holeShape[1] / 2 : null;

	return {
		id: primitive.getState_PrimitiveId(),
		type: 'PAD',
		net: primitive.getState_Net() ?? null,
		layer: toLayerName(primitive.getState_Layer()),
		x: primitive.getState_X(),
		y: primitive.getState_Y(),
		width,
		height,
		padRadius: width !== null && height !== null ? Math.max(width, height) / 2 : null,
		holeRadius,
	};
};

const isLcedaPadPrimitive = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaPadPrimitiveShape => {
	const candidate = primitive as Partial<LcedaPadPrimitiveShape>;
	return (
		typeof candidate.getState_Pad === 'function' &&
		typeof candidate.getState_Hole === 'function' &&
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function' &&
		typeof candidate.getState_Layer === 'function'
	);
};

const isSupportedLcedaViaPrimitive = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	const candidate = primitive as Partial<LcedaViaPrimitiveShape>;
	return (
		typeof candidate.getState_StartLayer === 'function' &&
		typeof candidate.getState_EndLayer === 'function' &&
		typeof candidate.getState_Diameter === 'function' &&
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function' &&
		hasFiniteCoordinate(candidate.getState_X()) &&
		hasFiniteCoordinate(candidate.getState_Y()) &&
		toLayerName(candidate.getState_StartLayer()) !== null &&
		toLayerName(candidate.getState_EndLayer()) !== null
	);
};

const isUnsupportedLcedaViaPrimitive = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	if (isSupportedLcedaViaPrimitive(primitive) || isLcedaPadPrimitive(primitive)) {
		return false;
	}

	if (!hasLcedaViaPrimitiveSignature(primitive)) {
		return false;
	}

	return (
		typeof primitive.getState_Diameter !== 'function' ||
		!hasFiniteCoordinate(primitive.getState_X()) ||
		!hasFiniteCoordinate(primitive.getState_Y()) ||
		toLayerName(primitive.getState_StartLayer()) === null ||
		toLayerName(primitive.getState_EndLayer()) === null
	);
};

const hasLcedaViaPrimitiveSignature = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	const candidate = primitive as Partial<LcedaViaPrimitiveShape>;
	return (
		typeof candidate.getState_StartLayer === 'function' &&
		typeof candidate.getState_EndLayer === 'function' &&
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function'
	);
};

const toLayerName = (layer: unknown): string | null => {
	if (typeof layer !== 'string') {
		return null;
	}

	const layerName = layer.trim();
	return layerName.length > 0 ? layerName : null;
};

const toLayerSpan = (startLayer: unknown, endLayer: unknown): LcedaViaLayerSpan => {
	return {
		startLayer: toLayerName(startLayer) ?? '',
		endLayer: toLayerName(endLayer) ?? '',
	};
};

const hasFiniteCoordinate = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};
