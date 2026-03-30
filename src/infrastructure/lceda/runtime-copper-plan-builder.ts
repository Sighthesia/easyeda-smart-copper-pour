import type { SmartCopperPourPreviewRequest } from '../../application/smart-copper-pour-contract';
import { resolveFinalCopperWidth } from '../../domain/copper-width';
import { planDaisyChainBackbone } from '../../domain/daisy-chain-planner';
import { planOrthogonalTreeBackbone } from '../../domain/orthogonal-tree-planner';
import { buildPadNodeOutline } from '../../domain/pad-node-outline';
import type { SkeletonPolygon, SkeletonSegment } from '../../domain/skeleton-types';
import { planStarArea } from '../../domain/star-area-planner';
import { planStarBackbone } from '../../domain/star-backbone-planner';
import { planTreeBackbone } from '../../domain/tree-backbone-planner';
import { unionSkeletonPolygons } from '../geometry/polygon-boolean';
import { buildClosedPolygonOffsetPolygons, buildSkeletonOffsetPolygons } from '../geometry/polygon-offset-builder';
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
		const width = resolveFinalCopperWidth(padNodes, request);
		const polygons = resolveCopperPolygons(padNodes, request, width);
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
			return request.orthogonalRouting === false
				? planTreeBackbone(padNodes, { trunkBias: request.trunkBias }).segments
				: planOrthogonalTreeBackbone(padNodes, { trunkBias: request.trunkBias }).segments;
		case 'star':
			return planStarBackbone(padNodes, { trunkBias: request.trunkBias }).segments;
		case 'daisyChain':
			return request.orthogonalRouting === false
				? planTreeBackbone(padNodes, { trunkBias: request.trunkBias }).segments
				: planDaisyChainBackbone(padNodes, { trunkBias: request.trunkBias }).segments;
		default:
			throw new Error(`Unsupported topology mode: ${(request as { topologyMode: string }).topologyMode}`);
	}
};

const resolveCopperPolygons = (
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
	request: SmartCopperPourPreviewRequest,
	width: number,
): ReadonlyArray<SkeletonPolygon> => {
	if (request.topologyMode === 'star') {
		const outline = planStarArea(padNodes, {
			areaShape: request.starAreaShape,
			useNodeSizeAsBaseWidth: request.useNodeSizeAsBaseWidth,
		}).outline;
		const offsetWidth = request.useNodeSizeAsBaseWidth === false ? width : request.width;
		if (offsetWidth <= 0) {
			return unionSkeletonPolygons([outline]);
		}

		return buildClosedPolygonOffsetPolygons({
			polygon: outline,
			width: offsetWidth,
			cornerStyle: request.cornerStyle,
		});
	}

	const segmentPolygons = buildSkeletonOffsetPolygons({
		segments: resolveSkeletonSegments(padNodes, request),
		width,
		cornerStyle: request.cornerStyle,
	});
	if (request.useNodeSizeAsBaseWidth === false) {
		return segmentPolygons;
	}

	return unionSkeletonPolygons([
		...segmentPolygons,
		...padNodes.flatMap((padNode) => {
			const outline = buildPadNodeOutline(padNode);
			if (request.width <= 0) {
				return [outline];
			}

			return buildClosedPolygonOffsetPolygons({
				polygon: outline,
				width: request.width,
				cornerStyle: request.cornerStyle,
			});
		}),
	]);
};
