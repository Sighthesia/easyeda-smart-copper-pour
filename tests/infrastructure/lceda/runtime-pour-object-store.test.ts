import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { SkeletonPolygon } from '../../../src/domain/skeleton-types';
import {
	createRuntimeFinalPour,
	createRuntimeLcedaPolygon,
	createRuntimeLcedaPourObjectStore,
	createRuntimePreviewRegion,
	deleteRuntimeLcedaObject,
	encodeSkeletonPolygonToPolygonSourceArray,
} from '../../../src/infrastructure/lceda/runtime-pour-object-store';

const createTrianglePolygon = (): SkeletonPolygon => ({
	vertices: [
		{ x: 0, y: 0 },
		{ x: 10, y: 0 },
		{ x: 0, y: 6 },
	],
});

const createRectanglePolygon = (): SkeletonPolygon => ({
	vertices: [
		{ x: 0, y: 0 },
		{ x: 10, y: 0 },
		{ x: 10, y: 6 },
		{ x: 0, y: 6 },
	],
});

const createLcedaApi = () => {
	const createPolygon = vi.fn();
	const regionCreate = vi.fn();
	const regionDelete = vi.fn();
	const pourCreate = vi.fn();
	const pourDelete = vi.fn();

	vi.stubGlobal('eda', {
		pcb_MathPolygon: {
			createPolygon,
		},
		pcb_PrimitiveRegion: {
			create: regionCreate,
			delete: regionDelete,
		},
		pcb_PrimitivePour: {
			create: pourCreate,
			delete: pourDelete,
		},
	});

	return { createPolygon, regionCreate, regionDelete, pourCreate, pourDelete };
};

describe('runtime-pour-object-store', () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
	});

	test('encodes rectangle polygons as closed line commands', () => {
		expect(encodeSkeletonPolygonToPolygonSourceArray(createRectanglePolygon())).toEqual([0, 0, 'L', 10, 0, 'L', 10, 6, 'L', 0, 6, 'L', 0, 0]);
	});

	test('encodes triangle polygons as closed line commands', () => {
		expect(encodeSkeletonPolygonToPolygonSourceArray(createTrianglePolygon())).toEqual([0, 0, 'L', 10, 0, 'L', 0, 6, 'L', 0, 0]);
	});

	test('returns undefined when polygon creation fails', () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue(undefined);

		expect(createRuntimeLcedaPolygon(createRectanglePolygon())).toBeUndefined();
		expect(api.createPolygon).toHaveBeenCalledWith([0, 0, 'L', 10, 0, 'L', 10, 6, 'L', 0, 6, 'L', 0, 0]);
	});

	test('returns undefined when region creation fails', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue(undefined);

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).resolves.toBeUndefined();
	});

	test('rejects unsupported preview layer ids before calling EasyEDA region creation', async () => {
		const api = createLcedaApi();

		await expect(
			createRuntimePreviewRegion({
				layerId: 45,
				layerName: 'Inner31',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Unsupported copper layer: Inner31 (45)');

		expect(api.createPolygon).not.toHaveBeenCalled();
		expect(api.regionCreate).not.toHaveBeenCalled();
	});

	test('returns undefined when pour creation fails', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue(undefined);

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).resolves.toBeUndefined();
	});

	test('rejects unsupported pour layer ids before calling EasyEDA pour creation', async () => {
		const api = createLcedaApi();

		await expect(
			createRuntimeFinalPour({
				layerId: 45,
				layerName: 'Inner31',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Unsupported copper layer: Inner31 (45)');

		expect(api.createPolygon).not.toHaveBeenCalled();
		expect(api.pourCreate).not.toHaveBeenCalled();
	});

	test('creates preview regions with region refs', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({ primitiveId: 'region-1' });

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).resolves.toEqual({ kind: 'region', primitiveId: 'region-1' });
	});

	test('fails when preview region creation returns no usable primitive id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({});

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Preview region primitive id was not created.');
	});

	test('fails when preview region creation returns an empty primitive id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({ primitiveId: '' });

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Preview region primitive id was not created.');
	});

	test('fails when preview region primitive getter returns an empty id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({ getState_PrimitiveId: () => '' });

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Preview region primitive id was not created.');
	});

	test('fails when preview region primitive getter returns a whitespace id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({ getState_PrimitiveId: () => ' region-1 ' });

		await expect(
			createRuntimePreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Preview region primitive id was not created.');
	});

	test('creates final pours with pour refs', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue({ primitiveId: 'pour-1' });

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).resolves.toEqual({ kind: 'pour', primitiveId: 'pour-1' });
	});

	test('fails when final pour creation returns no usable primitive id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue({});

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Final pour primitive id was not created.');
	});

	test('fails when final pour creation returns an empty primitive id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue({ primitiveId: '' });

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Final pour primitive id was not created.');
	});

	test('fails when final pour primitive getter returns an empty id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue({ getState_PrimitiveId: () => '' });

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Final pour primitive id was not created.');
	});

	test('fails when final pour primitive getter returns a whitespace id', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.pourCreate.mockResolvedValue({ getState_PrimitiveId: () => ' pour-1 ' });

		await expect(
			createRuntimeFinalPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).rejects.toThrow('Final pour primitive id was not created.');
	});

	test('routes region deletes by primitive id', async () => {
		const api = createLcedaApi();
		api.regionDelete.mockResolvedValue(true);

		await deleteRuntimeLcedaObject({ kind: 'region', primitiveId: 'region-1' });

		expect(api.regionDelete).toHaveBeenCalledWith(['region-1']);
		expect(api.pourDelete).not.toHaveBeenCalled();
	});

	test('fails when region delete returns false', async () => {
		const api = createLcedaApi();
		api.regionDelete.mockResolvedValue(false);

		await expect(deleteRuntimeLcedaObject({ kind: 'region', primitiveId: 'region-1' })).rejects.toThrow(
			'Failed to delete LCEDA region primitive.',
		);
	});

	test('routes pour deletes by primitive id', async () => {
		const api = createLcedaApi();
		api.pourDelete.mockResolvedValue(true);

		await deleteRuntimeLcedaObject({ kind: 'pour', primitiveId: 'pour-1' });

		expect(api.pourDelete).toHaveBeenCalledWith(['pour-1']);
		expect(api.regionDelete).not.toHaveBeenCalled();
	});

	test('fails when pour delete returns false', async () => {
		const api = createLcedaApi();
		api.pourDelete.mockResolvedValue(false);

		await expect(deleteRuntimeLcedaObject({ kind: 'pour', primitiveId: 'pour-1' })).rejects.toThrow('Failed to delete LCEDA pour primitive.');
	});

	test('fails when delete receives an unknown object kind', async () => {
		const api = createLcedaApi();

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		await expect(deleteRuntimeLcedaObject({ kind: 'mystery', primitiveId: 'object-1' } as never)).rejects.toThrow(
			'Unsupported LCEDA object kind.',
		);
		expect(api.regionDelete).not.toHaveBeenCalled();
		expect(api.pourDelete).not.toHaveBeenCalled();
	});

	test('exposes a runtime object store with preview, pour, and delete operations', async () => {
		const api = createLcedaApi();
		api.createPolygon.mockReturnValue({ polygon: true });
		api.regionCreate.mockResolvedValue({ primitiveId: 'region-1' });
		api.pourCreate.mockResolvedValue({ primitiveId: 'pour-1' });
		api.regionDelete.mockResolvedValue(true);
		api.pourDelete.mockResolvedValue(true);

		const store = createRuntimeLcedaPourObjectStore();

		expect(
			await store.createPreviewRegion({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).toEqual({ kind: 'region', primitiveId: 'region-1' });

		expect(
			await store.createPour({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygon: createRectanglePolygon(),
				polygonIndex: 0,
			}),
		).toEqual({ kind: 'pour', primitiveId: 'pour-1' });

		await store.deleteObject({ kind: 'region', primitiveId: 'region-1' });
		await store.deleteObject({ kind: 'pour', primitiveId: 'pour-1' });

		expect(api.regionCreate).toHaveBeenCalledWith(1, { polygon: true });
		expect(api.pourCreate).toHaveBeenCalledWith('VCC', 1, { polygon: true });
		expect(api.regionDelete).toHaveBeenCalledWith(['region-1']);
		expect(api.pourDelete).toHaveBeenCalledWith(['pour-1']);
	});
});
