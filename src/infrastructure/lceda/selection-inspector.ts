import type {
	SmartCopperPourSelectedPrimitive,
	SmartCopperPourSelectionSummary,
	SmartCopperPourViaLayerSpan,
} from '../../application/smart-copper-pour-contract';
import { type SmartCopperPourSelectionInspector, createSmartCopperPourSelectionSummary } from '../../application/smart-copper-pour-controller';
import { toLcedaLayerName } from './layer-name';
import { normalizeLcedaSelectionPrimitives } from './selection-expander';
import { type LcedaSelectablePrimitive, resolveSelectionSummaryNodes } from './selection-resolver';
import { isLcedaPadPrimitive } from './selection-shapes';

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
	layerSpan: SmartCopperPourViaLayerSpan;
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

export interface LcedaSelectionRuntime {
	pcb_SelectControl?: {
		getAllSelectedPrimitives?: () => Promise<unknown>;
	};
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
		return createSmartCopperPourSelectionSummaryFromPrimitives(await reader.readSelectedPrimitives());
	},
});

export const createSmartCopperPourSelectionSummaryFromPrimitives = (
	selectedPrimitives: readonly SmartCopperPourSelectedPrimitive[],
): SmartCopperPourSelectionSummary => {
	const normalizedPrimitives = normalizeSelectedPrimitives(selectedPrimitives);
	const normalizedNodes = resolveSelectionSummaryNodes(normalizedPrimitives);
	return createSmartCopperPourSelectionSummary({
		normalizedNodes,
		netName: normalizedNodes[0]?.net ?? null,
		layerName: normalizedNodes[0]?.layer ?? null,
	});
};

export const normalizeSelectedSnapshotPrimitives = (
	selectedPrimitives: readonly SmartCopperPourSelectedPrimitive[],
): readonly LcedaSelectablePrimitive[] => {
	return normalizeSelectedPrimitives(selectedPrimitives);
};

export const createLcedaSelectedPrimitivesReader = (
	runtime: LcedaSelectionRuntime = eda as unknown as LcedaSelectionRuntime,
): LcedaSelectedPrimitivesReader => ({
	readSelectedPrimitives: async (): Promise<readonly LcedaInspectedSelectablePrimitive[]> => {
		const primitives = await readRuntimeSelectedPrimitives(runtime);
		return normalizeLcedaSelectionPrimitives(primitives).filter(isRuntimePrimitive).map(toSelectablePrimitive);
	},
});

const readRuntimeSelectedPrimitives = async (runtime: LcedaSelectionRuntime): Promise<readonly IPCB_Primitive[]> => {
	const selectionControl = runtime.pcb_SelectControl;
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
		layer: toLcedaLayerName(primitive.getState_Layer()),
		x: primitive.getState_X(),
		y: primitive.getState_Y(),
		width,
		height,
		padRadius: width !== null && height !== null ? Math.max(width, height) / 2 : null,
		holeRadius,
	};
};

const normalizeSelectedPrimitives = (primitives: readonly unknown[]): readonly LcedaSelectablePrimitive[] => {
	const normalizedPrimitives: LcedaSelectablePrimitive[] = [];
	const seenIds = new Set<string>();

	for (const primitive of normalizeLcedaSelectionPrimitives(primitives)) {
		const normalizedPrimitive = normalizePrimitive(primitive);
		if (normalizedPrimitive !== null && !seenIds.has(normalizedPrimitive.id)) {
			seenIds.add(normalizedPrimitive.id);
			normalizedPrimitives.push(normalizedPrimitive);
		}
	}

	return normalizedPrimitives;
};

const normalizePrimitive = (primitive: unknown): LcedaSelectablePrimitive | null => {
	if (primitive === null || typeof primitive !== 'object') {
		return null;
	}

	if (hasRuntimePrimitiveShape(primitive)) {
		return toSelectablePrimitive(primitive as IPCB_Primitive);
	}

	if (isInspectedSelectablePrimitive(primitive)) {
		return primitive;
	}

	return null;
};

const isInspectedSelectablePrimitive = (primitive: unknown): primitive is LcedaSelectablePrimitive => {
	if (primitive === null || typeof primitive !== 'object') {
		return false;
	}

	const candidate = primitive as Partial<LcedaSelectablePrimitive> & { type?: string };
	return (
		typeof candidate.id === 'string' &&
		(candidate.type === 'PAD' || candidate.type === 'VIA' || candidate.type === 'VIA_UNSUPPORTED' || candidate.type === 'OTHER')
	);
};

const hasRuntimePrimitiveShape = (primitive: unknown): primitive is IPCB_Primitive => {
	if (primitive === null || typeof primitive !== 'object') {
		return false;
	}

	const candidate = primitive as Partial<IPCB_Primitive>;
	return typeof candidate.getState_PrimitiveId === 'function';
};

const isRuntimePrimitive = (primitive: unknown): primitive is IPCB_Primitive => {
	return hasRuntimePrimitiveShape(primitive);
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
		toLcedaLayerName(candidate.getState_StartLayer()) !== null &&
		toLcedaLayerName(candidate.getState_EndLayer()) !== null
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
		toLcedaLayerName(primitive.getState_StartLayer()) === null ||
		toLcedaLayerName(primitive.getState_EndLayer()) === null
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

const toLayerSpan = (startLayer: unknown, endLayer: unknown): SmartCopperPourViaLayerSpan => {
	return {
		startLayer: toLcedaLayerName(startLayer) ?? '',
		endLayer: toLcedaLayerName(endLayer) ?? '',
	};
};

const hasFiniteCoordinate = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};
