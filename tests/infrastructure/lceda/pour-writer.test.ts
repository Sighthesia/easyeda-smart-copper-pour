import { describe, expect, test, vi } from 'vitest';

import type { SkeletonPolygon } from '../../../src/domain/skeleton-types';
import {
	type LcedaPourObjectRef,
	type LcedaPourObjectStore,
	type LcedaPreviewObjectRef,
	type LcedaStoredObjectRef,
	createLcedaPourWriter,
} from '../../../src/infrastructure/lceda/pour-writer';

const createPolygon = (): SkeletonPolygon => ({
	vertices: [
		{ x: 0, y: 0 },
		{ x: 10, y: 0 },
		{ x: 10, y: 6 },
		{ x: 0, y: 6 },
	],
});

const createObjectStore = (): LcedaPourObjectStore => ({
	createPreviewRegion: vi.fn(async ({ polygonIndex }) => ({ kind: 'region' as const, primitiveId: `preview-${polygonIndex}` })),
	createPour: vi.fn(async ({ polygonIndex }) => ({ kind: 'pour' as const, primitiveId: `pour-${polygonIndex}` })),
	deleteObject: vi.fn(async () => undefined),
});

const createPreviewRef = (primitiveId: string): LcedaPreviewObjectRef => ({ kind: 'region', primitiveId });
const createPourRef = (primitiveId: string): LcedaPourObjectRef => ({ kind: 'pour', primitiveId });

describe('createLcedaPourWriter', () => {
	test('creates preview regions and returns a preview token', async () => {
		const objectStore = createObjectStore();
		const writer = createLcedaPourWriter(objectStore);

		const result = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		expect(result.previewToken).toBe('preview-session-1');
		expect(objectStore.createPreviewRegion).toHaveBeenCalledWith({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygon: createPolygon(),
			polygonIndex: 0,
		});
	});

	test('rolls back partially created preview regions when preview creation fails', async () => {
		const objectStore = createObjectStore();
		objectStore.createPreviewRegion = vi
			.fn<(_: { polygonIndex: number }) => Promise<LcedaPreviewObjectRef>>()
			.mockResolvedValueOnce(createPreviewRef('preview-0'))
			.mockRejectedValueOnce(new Error('preview failed'));
		const writer = createLcedaPourWriter(objectStore);

		await expect(
			writer.writePreview({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon(), createPolygon()],
			}),
		).rejects.toThrow('preview failed');

		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('creates final pours and deletes preview objects on success', async () => {
		const objectStore = createObjectStore();
		const writer = createLcedaPourWriter(objectStore);
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		const result = await writer.applyFinal({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
			previewToken: preview.previewToken,
		});

		expect(result).toEqual({ applied: true });
		expect(objectStore.createPour).toHaveBeenCalledWith({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygon: createPolygon(),
			polygonIndex: 0,
		});
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('keeps the original failure when rollback delete also fails', async () => {
		const objectStore = createObjectStore();
		objectStore.createPreviewRegion = vi
			.fn<(_: { polygonIndex: number }) => Promise<LcedaPreviewObjectRef>>()
			.mockResolvedValueOnce(createPreviewRef('preview-0'))
			.mockRejectedValueOnce(new Error('preview failed'));
		objectStore.deleteObject = vi.fn<(_: LcedaStoredObjectRef) => Promise<void>>().mockRejectedValue(new Error('delete failed'));
		const writer = createLcedaPourWriter(objectStore);

		await expect(
			writer.writePreview({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon(), createPolygon()],
			}),
		).rejects.toThrow('preview failed');

		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('keeps the active preview when apply succeeds without a matching token', async () => {
		const objectStore = createObjectStore();
		const writer = createLcedaPourWriter(objectStore);
		await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		await writer.applyFinal({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
			previewToken: 'stale-preview-token',
		});

		expect(objectStore.deleteObject).not.toHaveBeenCalledWith(createPreviewRef('preview-0'));
		expect(objectStore.deleteObject).not.toHaveBeenCalledWith(createPreviewRef('preview-1'));

		await writer.clearPreview();
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('returns null preview token for empty preview polygons', async () => {
		const objectStore = createObjectStore();
		const writer = createLcedaPourWriter(objectStore);

		const result = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [],
		});

		expect(result).toEqual({ previewToken: null });
		expect(objectStore.createPreviewRegion).not.toHaveBeenCalled();
		expect(objectStore.deleteObject).not.toHaveBeenCalled();
	});

	test('clears preview state after successful apply with matching token', async () => {
		const objectStore = createObjectStore();
		const writer = createLcedaPourWriter(objectStore);
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		const result = await writer.applyFinal({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
			previewToken: preview.previewToken,
		});

		expect(result).toEqual({ applied: true });
		await writer.clearPreview();
		expect(objectStore.deleteObject).toHaveBeenCalledTimes(1);
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('rolls back created pours and keeps preview state when apply fails', async () => {
		const objectStore = createObjectStore();
		objectStore.createPour = vi
			.fn<(_: { polygonIndex: number }) => Promise<LcedaPourObjectRef>>()
			.mockResolvedValueOnce(createPourRef('pour-0'))
			.mockRejectedValueOnce(new Error('pour failed'));
		const writer = createLcedaPourWriter(objectStore);
		const polygons = [createPolygon(), createPolygon()];
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons,
		});

		await expect(
			writer.applyFinal({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons,
				previewToken: preview.previewToken,
			}),
		).rejects.toThrow('pour failed');

		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPourRef('pour-0'));
		await writer.clearPreview();
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-1'));
	});

	test('keeps the original pour failure when pour rollback delete also fails', async () => {
		const objectStore = createObjectStore();
		objectStore.createPour = vi
			.fn<(_: { polygonIndex: number }) => Promise<LcedaPourObjectRef>>()
			.mockResolvedValueOnce(createPourRef('pour-0'))
			.mockRejectedValueOnce(new Error('pour failed'));
		objectStore.deleteObject = vi.fn<(_: LcedaStoredObjectRef) => Promise<void>>().mockRejectedValue(new Error('delete failed'));
		const writer = createLcedaPourWriter(objectStore);

		await expect(
			writer.applyFinal({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon(), createPolygon()],
				previewToken: 'preview-session-1',
			}),
		).rejects.toThrow('pour failed');
	});

	test('keeps preview session recoverable when preview cleanup fails during apply', async () => {
		const objectStore = createObjectStore();
		objectStore.deleteObject = vi
			.fn<(_: LcedaStoredObjectRef) => Promise<void>>()
			.mockRejectedValueOnce(new Error('delete failed'))
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce(undefined);
		const writer = createLcedaPourWriter(objectStore);
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		await expect(
			writer.applyFinal({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon()],
				previewToken: preview.previewToken,
			}),
		).rejects.toThrow('delete failed');

		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPourRef('pour-0'));
		await writer.clearPreview();
		expect(objectStore.deleteObject).toHaveBeenCalledWith(createPreviewRef('preview-0'));
	});

	test('keeps only the remaining preview objects after partial cleanup failure', async () => {
		const objectStore = createObjectStore();
		objectStore.deleteObject = vi
			.fn<(_: LcedaStoredObjectRef) => Promise<void>>()
			.mockResolvedValueOnce(undefined)
			.mockRejectedValueOnce(new Error('delete failed'))
			.mockResolvedValueOnce(undefined);
		const writer = createLcedaPourWriter(objectStore);
		const polygons = [createPolygon(), createPolygon()];
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons,
		});

		await expect(
			writer.applyFinal({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon()],
				previewToken: preview.previewToken,
			}),
		).rejects.toThrow('delete failed');

		expect(objectStore.deleteObject).toHaveBeenNthCalledWith(1, createPreviewRef('preview-0'));
		expect(objectStore.deleteObject).toHaveBeenNthCalledWith(2, createPreviewRef('preview-1'));
		expect(objectStore.deleteObject).toHaveBeenNthCalledWith(3, createPourRef('pour-0'));

		await writer.clearPreview();
		expect(objectStore.deleteObject).toHaveBeenNthCalledWith(4, createPreviewRef('preview-1'));
		expect(objectStore.deleteObject).toHaveBeenCalledTimes(4);
	});

	test('keeps the original preview cleanup failure when pour rollback delete also fails', async () => {
		const objectStore = createObjectStore();
		objectStore.deleteObject = vi
			.fn<(_: LcedaStoredObjectRef) => Promise<void>>()
			.mockRejectedValueOnce(new Error('preview cleanup failed'))
			.mockRejectedValueOnce(new Error('pour rollback failed'));
		const writer = createLcedaPourWriter(objectStore);
		const preview = await writer.writePreview({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [createPolygon()],
		});

		await expect(
			writer.applyFinal({
				layerId: 1,
				layerName: 'TopLayer',
				netName: 'VCC',
				polygons: [createPolygon()],
				previewToken: preview.previewToken,
			}),
		).rejects.toThrow('preview cleanup failed');
	});
});
