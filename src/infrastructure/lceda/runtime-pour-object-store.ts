import type { SkeletonPolygon } from '../../domain/skeleton-types';
import { isSupportedLcedaCopperLayerId } from './layer-name';
import type { LcedaPourObjectInput, LcedaPourObjectRef, LcedaPourObjectStore, LcedaPreviewObjectRef, LcedaStoredObjectRef } from './pour-writer';

interface LcedaRegionPrimitive {
	getState_PrimitiveId?: () => string;
	primitiveId?: string;
}

type LcedaPourPrimitive = LcedaRegionPrimitive;

interface RuntimeLcedaStoreApi {
	pcb_MathPolygon: {
		createPolygon: (polygon: TPCB_PolygonSourceArray) => IPCB_Polygon | undefined;
	};
	pcb_PrimitiveRegion: {
		create: (layer: TPCB_LayersOfRegion, complexPolygon: IPCB_Polygon) => Promise<LcedaRegionPrimitive | undefined>;
		delete: (primitiveIds: Array<string>) => Promise<boolean>;
	};
	pcb_PrimitivePour: {
		create: (net: string, layer: TPCB_LayersOfCopper, complexPolygon: IPCB_Polygon) => Promise<LcedaPourPrimitive | undefined>;
		delete: (primitiveIds: Array<string>) => Promise<boolean>;
	};
}

const getLcedaApi = (): RuntimeLcedaStoreApi => eda as RuntimeLcedaStoreApi;

export const encodeSkeletonPolygonToPolygonSourceArray = (polygon: SkeletonPolygon): TPCB_PolygonSourceArray | undefined => {
	if (polygon.vertices.length < 3) {
		return undefined;
	}

	const source: TPCB_PolygonSourceArray = [polygon.vertices[0].x, polygon.vertices[0].y];
	for (const vertex of polygon.vertices.slice(1)) {
		source.push('L', vertex.x, vertex.y);
	}

	source.push('L', polygon.vertices[0].x, polygon.vertices[0].y);
	return source;
};

export const createRuntimeLcedaPolygon = (polygon: SkeletonPolygon): IPCB_Polygon | undefined =>
	(() => {
		const encodedPolygon = encodeSkeletonPolygonToPolygonSourceArray(polygon);
		return encodedPolygon === undefined ? undefined : getLcedaApi().pcb_MathPolygon.createPolygon(encodedPolygon);
	})();

const toStoredObjectRef = <K extends 'region' | 'pour'>(
	kind: K,
	primitive: LcedaRegionPrimitive | LcedaPourPrimitive,
): LcedaStoredObjectRef<K> | undefined => {
	const primitiveId = primitive.getState_PrimitiveId?.() ?? primitive.primitiveId;
	if (typeof primitiveId !== 'string' || primitiveId.length === 0 || primitiveId !== primitiveId.trim()) {
		return undefined;
	}

	return { kind, primitiveId };
};

const requireStoredObjectRef = <K extends 'region' | 'pour'>(
	kind: K,
	primitive: LcedaRegionPrimitive | LcedaPourPrimitive,
	failureMessage: string,
): LcedaStoredObjectRef<K> => {
	const objectRef = toStoredObjectRef(kind, primitive);
	if (objectRef === undefined) {
		throw new Error(failureMessage);
	}

	return objectRef;
};

const createRuntimeStoredObject = async <K extends 'region' | 'pour'>(options: {
	kind: K;
	failureMessage: string;
	create: () => Promise<LcedaRegionPrimitive | LcedaPourPrimitive | undefined>;
}): Promise<LcedaStoredObjectRef<K> | undefined> => {
	const primitive = await options.create();
	if (primitive === undefined) {
		return undefined;
	}

	return requireStoredObjectRef(options.kind, primitive, options.failureMessage);
};

const requireSupportedCopperLayerInput = (input: LcedaPourObjectInput): void => {
	if (!isSupportedLcedaCopperLayerId(input.layerId)) {
		throw new Error(`Unsupported copper layer: ${input.layerName} (${input.layerId})`);
	}
};

export const createRuntimePreviewRegion = async (input: LcedaPourObjectInput): Promise<LcedaPreviewObjectRef | undefined> => {
	requireSupportedCopperLayerInput(input);

	const complexPolygon = createRuntimeLcedaPolygon(input.polygon);
	if (complexPolygon === undefined) {
		return undefined;
	}

	return createRuntimeStoredObject({
		kind: 'region',
		failureMessage: 'Preview region primitive id was not created.',
		create: () => getLcedaApi().pcb_PrimitiveRegion.create(input.layerId as TPCB_LayersOfRegion, complexPolygon),
	});
};

export const createRuntimeFinalPour = async (input: LcedaPourObjectInput): Promise<LcedaPourObjectRef | undefined> => {
	requireSupportedCopperLayerInput(input);

	const complexPolygon = createRuntimeLcedaPolygon(input.polygon);
	if (complexPolygon === undefined) {
		return undefined;
	}

	return createRuntimeStoredObject({
		kind: 'pour',
		failureMessage: 'Final pour primitive id was not created.',
		create: () => getLcedaApi().pcb_PrimitivePour.create(input.netName, input.layerId as TPCB_LayersOfCopper, complexPolygon),
	});
};

export const deleteRuntimeLcedaObject = async (objectRef: LcedaStoredObjectRef): Promise<void> => {
	switch (objectRef.kind) {
		case 'region':
			if ((await getLcedaApi().pcb_PrimitiveRegion.delete([objectRef.primitiveId])) === false) {
				throw new Error('Failed to delete LCEDA region primitive.');
			}
			return;
		case 'pour':
			if ((await getLcedaApi().pcb_PrimitivePour.delete([objectRef.primitiveId])) === false) {
				throw new Error('Failed to delete LCEDA pour primitive.');
			}
			return;
		default:
			throw new Error('Unsupported LCEDA object kind.');
	}
};

export const createRuntimeLcedaPourObjectStore = (): LcedaPourObjectStore => ({
	createPreviewRegion: async (input) => {
		const preview = await createRuntimePreviewRegion(input);
		if (preview === undefined) {
			throw new Error('Failed to create preview region.');
		}

		return preview;
	},
	createPour: async (input) => {
		const pour = await createRuntimeFinalPour(input);
		if (pour === undefined) {
			throw new Error('Failed to create final pour.');
		}

		return pour;
	},
	deleteObject: deleteRuntimeLcedaObject,
});
