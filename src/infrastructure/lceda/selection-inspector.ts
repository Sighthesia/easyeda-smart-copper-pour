import type {
	SmartCopperPourSelectedPrimitive,
	SmartCopperPourSelectionSummary,
	SmartCopperPourViaLayerSpan,
} from '../../application/smart-copper-pour-contract';
import { type SmartCopperPourSelectionInspector, createSmartCopperPourSelectionSummary } from '../../application/smart-copper-pour-controller';
import { toLcedaLayerName } from './layer-name';
import { normalizeLcedaSelectionPrimitives } from './selection-expander';
import { type LcedaSelectablePrimitive, resolveSelectionSummaryNodes } from './selection-resolver';
import { type LcedaPadPrimitiveShape, type LcedaViaPrimitiveShape, isLcedaPadPrimitive, isLcedaViaPrimitiveCandidate } from './selection-shapes';

const THROUGH_VIA_TYPE = 0;
const BLIND_VIA_TYPE = 1;
const STITCHING_VIA_TYPE = 2;

interface LcedaPadSelectablePrimitive extends LcedaSelectablePrimitive {
	type: 'PAD';
	net: string | null;
	layer: string | null;
	x: number;
	y: number;
	rotation?: number | null;
	padShape?: string | null;
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
		return toViaSelectablePrimitive(primitive);
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

	return toPadSelectablePrimitive(primitive);
};

const toViaSelectablePrimitive = (primitive: IPCB_Primitive & LcedaViaPrimitiveShape): LcedaViaSelectablePrimitive => {
	const diameter = typeof primitive.getState_Diameter === 'function' ? primitive.getState_Diameter() : null;
	return {
		id: primitive.getState_PrimitiveId(),
		type: 'VIA',
		net: primitive.getState_Net() ?? null,
		x: primitive.getState_X(),
		y: primitive.getState_Y(),
		layerSpan: resolveRuntimeViaLayerSpan(primitive) ?? { startLayer: '', endLayer: '' },
		padRadius: typeof diameter === 'number' && Number.isFinite(diameter) && diameter > 0 ? diameter / 2 : null,
	};
};

const toPadSelectablePrimitive = (primitive: IPCB_Primitive & LcedaPadPrimitiveShape): LcedaPadSelectablePrimitive => {
	const padShape = primitive.getState_Pad();
	const holeShape = primitive.getState_Hole();
	const padShapeType = Array.isArray(padShape) && typeof padShape[0] === 'string' ? padShape[0] : null;
	const width = Array.isArray(padShape) && typeof padShape[1] === 'number' ? padShape[1] : null;
	const height = Array.isArray(padShape) && typeof padShape[2] === 'number' ? padShape[2] : width;
	const holeRadius = Array.isArray(holeShape) && typeof holeShape[1] === 'number' ? holeShape[1] / 2 : null;
	const rotation = typeof primitive.getState_Rotation === 'function' ? primitive.getState_Rotation() : null;

	return {
		id: primitive.getState_PrimitiveId(),
		type: 'PAD',
		net: primitive.getState_Net() ?? null,
		layer: toLcedaLayerName(primitive.getState_Layer()),
		x: primitive.getState_X(),
		y: primitive.getState_Y(),
		rotation: typeof rotation === 'number' && Number.isFinite(rotation) ? rotation : null,
		padShape: padShapeType,
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
	if (!isLcedaViaPrimitiveCandidate(primitive)) {
		return false;
	}

	return (
		typeof primitive.getState_Diameter === 'function' &&
		hasFiniteCoordinate(primitive.getState_X()) &&
		hasFiniteCoordinate(primitive.getState_Y()) &&
		resolveRuntimeViaLayerSpan(primitive) !== null
	);
};

const isUnsupportedLcedaViaPrimitive = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	if (isSupportedLcedaViaPrimitive(primitive) || isLcedaPadPrimitive(primitive) || !isLcedaViaPrimitiveCandidate(primitive)) {
		return false;
	}

	if (!hasLcedaViaPrimitiveSignature(primitive)) {
		return false;
	}

	return (
		typeof primitive.getState_Diameter !== 'function' ||
		!hasFiniteCoordinate(primitive.getState_X()) ||
		!hasFiniteCoordinate(primitive.getState_Y()) ||
		resolveRuntimeViaLayerSpan(primitive) === null
	);
};

const hasLcedaViaPrimitiveSignature = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	const candidate = primitive as Partial<LcedaViaPrimitiveShape>;
	return (
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function' &&
		(typeof candidate.getState_Diameter === 'function' ||
			typeof candidate.getState_ViaType === 'function' ||
			typeof candidate.getState_DesignRuleBlindViaName === 'function')
	);
};

const resolveRuntimeViaLayerSpan = (primitive: IPCB_Primitive & LcedaViaPrimitiveShape): SmartCopperPourViaLayerSpan | null => {
	const viaType = typeof primitive.getState_ViaType === 'function' ? primitive.getState_ViaType() : undefined;
	const blindViaRuleName = typeof primitive.getState_DesignRuleBlindViaName === 'function' ? primitive.getState_DesignRuleBlindViaName() : null;
	if (viaType === THROUGH_VIA_TYPE || viaType === STITCHING_VIA_TYPE) {
		return {
			startLayer: 'TopLayer',
			endLayer: 'BottomLayer',
		};
	}

	if (viaType === BLIND_VIA_TYPE || (typeof blindViaRuleName === 'string' && blindViaRuleName.trim().length > 0)) {
		return null;
	}

	if (blindViaRuleName === null || blindViaRuleName === undefined || blindViaRuleName === '') {
		return {
			startLayer: 'TopLayer',
			endLayer: 'BottomLayer',
		};
	}

	return null;
};

const hasFiniteCoordinate = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};
