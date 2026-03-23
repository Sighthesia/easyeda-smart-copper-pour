import type {
	SmartCopperPourApplyResult,
	SmartCopperPourClearPreviewResult,
	SmartCopperPourPreviewResult,
} from '../../application/smart-copper-pour-contract';
import type { SkeletonPolygon } from '../../domain/skeleton-types';

/**
 * Polygon write payload sent to the LCEDA object store.
 *
 * @public
 */
export interface LcedaPourObjectInput {
	layerName: string;
	netName: string;
	polygon: SkeletonPolygon;
	polygonIndex: number;
}

/**
 * Minimal object store needed by the writer.
 *
 * @public
 */
export interface LcedaPourObjectStore {
	createPreviewRegion(input: LcedaPourObjectInput): Promise<LcedaPreviewObjectRef>;
	createPour(input: LcedaPourObjectInput): Promise<LcedaPourObjectRef>;
	deleteObject(objectRef: LcedaStoredObjectRef): Promise<void>;
}

/**
 * Reference to a stored LCEDA object.
 *
 * @public
 */
export interface LcedaStoredObjectRef<K extends 'region' | 'pour' = 'region' | 'pour'> {
	kind: K;
	primitiveId: string;
}

/**
 * Reference to a stored preview region.
 *
 * @public
 */
export type LcedaPreviewObjectRef = LcedaStoredObjectRef<'region'>;

/**
 * Reference to a stored final pour.
 *
 * @public
 */
export type LcedaPourObjectRef = LcedaStoredObjectRef<'pour'>;

/**
 * Preview writer input.
 *
 * @public
 */
export interface LcedaPourWriterPreviewInput {
	layerName: string;
	netName: string;
	polygons: ReadonlyArray<SkeletonPolygon>;
}

/**
 * Final apply writer input.
 *
 * @public
 */
export interface LcedaPourWriterApplyInput extends LcedaPourWriterPreviewInput {
	previewToken?: string | null;
}

/**
 * Stateful writer used by runtime gateways.
 *
 * @public
 */
export interface LcedaPourWriter {
	writePreview(input: LcedaPourWriterPreviewInput): Promise<SmartCopperPourPreviewResult>;
	applyFinal(input: LcedaPourWriterApplyInput): Promise<SmartCopperPourApplyResult>;
	clearPreview(): Promise<SmartCopperPourClearPreviewResult>;
}

interface PreviewSession {
	token: string;
	objectRefs: LcedaStoredObjectRef[];
}

/**
 * Creates a rollback-safe preview/final writer.
 *
 * @param objectStore
 * - LCEDA object persistence adapter.
 *
 * @returns
 * - Writer that tracks preview state and rolls back partial final writes.
 *
 * @public
 */
	export const createLcedaPourWriter = (objectStore: LcedaPourObjectStore): LcedaPourWriter => {
		let previewSession: PreviewSession | undefined;
		let previewSequence = 0;

		const deleteObjects = async (objectRefs: ReadonlyArray<LcedaStoredObjectRef>): Promise<void> => {
			let firstError: unknown;

			for (const objectRef of objectRefs) {
				try {
					await objectStore.deleteObject(objectRef);
				} catch (error) {
					firstError ??= error;
				}
			}

			if (firstError !== undefined) {
				throw firstError;
			}
		};

		const deletePreviewObjects = async (session: PreviewSession): Promise<void> => {
			for (let index = 0; index < session.objectRefs.length; index += 1) {
				const objectRef = session.objectRefs[index];
				try {
					await objectStore.deleteObject(objectRef);
				} catch (error) {
					session.objectRefs = session.objectRefs.slice(index);
					throw error;
				}
			}

			session.objectRefs = [];
		};

		const clearPreviewSession = async (): Promise<void> => {
			if (previewSession === undefined) {
				return;
			}

			await deletePreviewObjects(previewSession);
			previewSession = undefined;
		};

	return {
		writePreview: async (input: LcedaPourWriterPreviewInput): Promise<SmartCopperPourPreviewResult> => {
			await clearPreviewSession();

			if (input.polygons.length === 0) {
				return { previewToken: null };
			}

			const previewObjectRefs: LcedaStoredObjectRef[] = [];
			try {
				for (const [polygonIndex, polygon] of input.polygons.entries()) {
					previewObjectRefs.push(
						await objectStore.createPreviewRegion({
							layerName: input.layerName,
							netName: input.netName,
							polygon,
							polygonIndex,
						}),
					);
				}
			} catch (error) {
				try {
					await deleteObjects(previewObjectRefs);
				} catch {
					// Ignore rollback cleanup failures here so the original write error remains visible.
				}
				throw error;
			}

			previewSequence += 1;
			previewSession = {
				token: `preview-session-${previewSequence}`,
				objectRefs: previewObjectRefs,
			};

			return { previewToken: previewSession.token };
		},
		applyFinal: async (input: LcedaPourWriterApplyInput): Promise<SmartCopperPourApplyResult> => {
			if (input.polygons.length === 0) {
				return { applied: false };
			}

			const createdPourRefs: LcedaStoredObjectRef[] = [];
			try {
				for (const [polygonIndex, polygon] of input.polygons.entries()) {
					createdPourRefs.push(
						await objectStore.createPour({
							layerName: input.layerName,
							netName: input.netName,
							polygon,
							polygonIndex,
						}),
					);
				}
			} catch (error) {
				try {
					await deleteObjects(createdPourRefs);
				} catch {
					// Ignore rollback cleanup failures here so the original pour error remains visible.
				}
				throw error;
			}

			const matchingPreviewSession =
				previewSession !== undefined && input.previewToken !== undefined && input.previewToken === previewSession.token
					? previewSession
					: undefined;
			if (matchingPreviewSession !== undefined) {
				try {
					await deletePreviewObjects(matchingPreviewSession);
					previewSession = undefined;
				} catch (error) {
					try {
						await deleteObjects(createdPourRefs);
					} catch {
						// Ignore rollback cleanup failures here so the original preview cleanup error remains visible.
					}
					throw error;
				}
			}

			return { applied: true };
		},
		clearPreview: async (): Promise<SmartCopperPourClearPreviewResult> => {
			await clearPreviewSession();
			return { cleared: true };
		},
	};
};
