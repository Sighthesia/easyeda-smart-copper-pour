import type { SmartCopperPourSelectionSummary } from '../../application/smart-copper-pour-contract';
import type { SmartCopperPourSelectionInspector } from '../../application/smart-copper-pour-controller';

import { resolveSelectedPadNodes, type LcedaSelectablePrimitive } from './selection-resolver';

/**
 * Reads the current raw selection from LCEDA.
 *
 * @public
 */
export interface LcedaSelectedPrimitivesReader {
	readSelectedPrimitives(): Promise<readonly LcedaSelectablePrimitive[]>;
}

interface LcedaPadPrimitiveShape {
	getState_PrimitiveId(): string;
	getState_X(): number;
	getState_Y(): number;
	getState_Layer(): unknown;
	getState_Net(): string | undefined;
	getState_Pad(): [unknown, number, number] | [unknown, number, number, number] | [unknown, unknown] | undefined;
	getState_Hole(): [unknown, number, number] | null;
}

export const createSmartCopperPourSelectionInspector = (
	reader: LcedaSelectedPrimitivesReader,
): SmartCopperPourSelectionInspector => ({
	inspectSelection: async (): Promise<SmartCopperPourSelectionSummary> => {
		const padNodes = resolveSelectedPadNodes(await reader.readSelectedPrimitives());
		return {
			padCount: padNodes.length,
			netName: padNodes[0]?.net ?? null,
			layerName: padNodes[0]?.layer ?? null,
		};
	},
});

export const createLcedaSelectedPrimitivesReader = (): LcedaSelectedPrimitivesReader => ({
	readSelectedPrimitives: async (): Promise<readonly LcedaSelectablePrimitive[]> => {
		const primitives = await eda.pcb_SelectControl.getAllSelectedPrimitives();
		return primitives.map(toSelectablePrimitive);
	},
});

const toSelectablePrimitive = (primitive: IPCB_Primitive): LcedaSelectablePrimitive => {
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

const toLayerName = (layer: unknown): string | null => {
	if (layer === null || layer === undefined) {
		return null;
	}

	return String(layer);
};
