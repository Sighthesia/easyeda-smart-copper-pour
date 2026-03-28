import type { SmartCopperPourPreviewRequest } from '../../application/smart-copper-pour-contract';
import { planDaisyChainBackbone } from '../../domain/daisy-chain-planner';
import type { SkeletonPolygon, SkeletonSegment } from '../../domain/skeleton-types';
import { planStarBackbone } from '../../domain/star-backbone-planner';
import { planTreeBackbone } from '../../domain/tree-backbone-planner';
import { buildSkeletonOffsetPolygons } from '../geometry/polygon-offset-builder';
import { isSupportedLcedaCopperLayerId, toLcedaLayerId } from './layer-name';
import { type LcedaSelectedPrimitivesReader, createLcedaSelectedPrimitivesReader, normalizeSelectedSnapshotPrimitives } from './selection-inspector';
import { resolveSelectedPadNodes } from './selection-resolver';

/**
 * Writer-ready copper plan built from the current LCEDA selection.
 *
 * @public
 */
export interface RuntimeCopperWriterInput {
	layerId: number;
	layerName: string;
	netName: string;
	polygons: readonly SkeletonPolygon[];
}

/**
 * Builds runtime copper writer input from LCEDA selection and request data.
 *
 * @public
 */
export interface RuntimeCopperPlanBuilder {
	buildWriterInput: (request: SmartCopperPourPreviewRequest) => Promise<RuntimeCopperWriterInput>;
}

export const createRuntimeCopperPlanBuilder = (
	reader: LcedaSelectedPrimitivesReader = createLcedaSelectedPrimitivesReader(),
): RuntimeCopperPlanBuilder => ({
	buildWriterInput: async (request: SmartCopperPourPreviewRequest): Promise<RuntimeCopperWriterInput> => {
		const selectedPrimitives =
			request.selectionPrimitives !== undefined
				? normalizeSelectedSnapshotPrimitives(request.selectionPrimitives)
				: await reader.readSelectedPrimitives();
		const padNodes = resolveSelectedPadNodes(selectedPrimitives);
		const segments = resolveSkeletonSegments(padNodes, request);
		const polygons = buildSkeletonOffsetPolygons({
			segments,
			width: request.width,
			cornerStyle: request.cornerStyle,
		});
		const layerName = padNodes[0].layer;
		const layerId = toLcedaLayerId(layerName);
		if (layerId === null || !isSupportedLcedaCopperLayerId(layerId)) {
			throw new Error(`Unsupported copper layer: ${layerName}`);
		}

		return {
			layerId,
			layerName,
			netName: padNodes[0].net,
			polygons,
		};
	},
});

const resolveSkeletonSegments = (
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
	request: SmartCopperPourPreviewRequest,
): ReadonlyArray<SkeletonSegment> => {
	switch (request.topologyMode) {
		case 'tree':
			return planTreeBackbone(padNodes, { trunkBias: request.trunkBias }).segments;
		case 'star':
			return planStarBackbone(padNodes, { trunkBias: request.trunkBias }).segments;
		case 'daisyChain':
			if (request.trunkMode !== 'manual' && request.trunkMode !== 'auto') {
				throw new Error('Daisy Chain mode requires trunkMode to be either manual or auto.');
			}

			if (request.trunkMode === 'manual') {
				validateManualTrunkPoint(request.trunkStart, 'start');
				validateManualTrunkPoint(request.trunkEnd, 'end');
			}

			return request.trunkMode === 'manual'
				? planDaisyChainBackbone(padNodes, {
						trunkMode: 'manual',
						trunkStart: request.trunkStart,
						trunkEnd: request.trunkEnd,
					}).segments
				: planDaisyChainBackbone(padNodes, {
						trunkMode: 'auto',
						trunkBias: request.trunkBias,
					}).segments;
		default:
			throw new Error(`Unsupported topology mode: ${(request as { topologyMode: string }).topologyMode}`);
	}
};

const validateManualTrunkPoint = (point: { x: number; y: number } | undefined, endpoint: 'start' | 'end'): void => {
	if (point === undefined || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
		throw new Error(`Daisy Chain mode requires a valid trunk ${endpoint} point.`);
	}
};
