import type { SmartCopperPourPreviewRequest } from '../../application/smart-copper-pour-contract';
import { resolveFinalCopperWidth } from '../../domain/copper-width';
import { planDaisyChainBackbone } from '../../domain/daisy-chain-planner';
import { planOrthogonalTreeBackbone } from '../../domain/orthogonal-tree-planner';
import { buildPadNodeOutline, projectBoardDirectionToNodeLocal, rotateLocalPointToBoard } from '../../domain/pad-node-outline';
import type { SkeletonPoint, SkeletonPolygon, SkeletonSegment } from '../../domain/skeleton-types';
import { planStarArea } from '../../domain/star-area-planner';
import { planStarBackbone } from '../../domain/star-backbone-planner';
import { planTreeBackbone } from '../../domain/tree-backbone-planner';
import { unionSkeletonPolygons } from '../geometry/polygon-boolean';
import { buildClosedPolygonOffsetPolygons, buildCornerStyledUnionPolygons, buildSkeletonOffsetPolygons } from '../geometry/polygon-offset-builder';
import { isSupportedLcedaCopperLayerId, toLcedaLayerId } from './layer-name';
import { logSmartCopperPourOutput } from './runtime-log';
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

		logSmartCopperPourOutput(createOutputPayload(selectedPrimitives, padNodes, polygons, request, width, layerName, layerId));

		return {
			layerId,
			layerName,
			netName: padNodes[0].net,
			polygons,
		};
	},
});

const createOutputPayload = (
	selectedPrimitives: ReadonlyArray<ReturnType<typeof normalizeSelectedSnapshotPrimitives>[number]>,
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
	polygons: ReadonlyArray<SkeletonPolygon>,
	request: SmartCopperPourPreviewRequest,
	finalWidth: number,
	layerName: string,
	layerId: number,
): Record<string, unknown> => ({
	action: 'buildWriterInput',
	topologyMode: request.topologyMode,
	layerName,
	layerId,
	finalWidth,
	selectedPads: selectedPrimitives
		.filter((primitive) => primitive.type === 'PAD')
		.map((primitive) => ({
			id: primitive.id,
			net: primitive.net ?? null,
			layer: primitive.layer ?? null,
			center: { x: primitive.x, y: primitive.y },
			width: primitive.width ?? null,
			height: primitive.height ?? null,
			rotation: primitive.rotation ?? 0,
			padShape: primitive.padShape ?? null,
		})),
	nodesForPlanning: padNodes.map((node) => ({
		id: node.id,
		net: node.net,
		layer: node.layer,
		center: { x: node.center.x, y: node.center.y },
		width: node.width ?? node.effectiveRadius * 2,
		height: node.height ?? node.effectiveRadius * 2,
		rotation: node.rotation ?? 0,
		outlineShape: node.outlineShape ?? 'ellipse',
		effectiveRadius: node.effectiveRadius,
		outlineVertices: buildPadNodeOutline(node).vertices.map((vertex) => ({ x: vertex.x, y: vertex.y })),
	})),
	generatedCopperAreaNodes: polygons.map((polygon, polygonIndex) => ({
		polygonIndex,
		vertices: polygon.vertices.map((vertex) => ({ x: vertex.x, y: vertex.y })),
	})),
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

	const transitionGeometry = createPadTransitionGeometry(resolveSkeletonSegments(padNodes, request), padNodes, request, width);
	const segmentPolygons = buildSkeletonOffsetPolygons({
		segments: transitionGeometry.segments,
		width,
		cornerStyle: request.cornerStyle,
	});
	if (request.useNodeSizeAsBaseWidth === false) {
		return buildCornerStyledUnionPolygons({
			polygons: segmentPolygons,
			width,
			cornerStyle: request.cornerStyle,
		});
	}

	const nodeCoveragePolygons = buildNodeCoveragePolygons(padNodes, request);
	const polygons = unionSkeletonPolygons([...segmentPolygons, ...transitionGeometry.transitionPolygons, ...nodeCoveragePolygons]);

	const styledPolygons = buildCornerStyledUnionPolygons({
		polygons,
		width,
		cornerStyle: request.cornerStyle,
	});

	return unionSkeletonPolygons([...styledPolygons, ...nodeCoveragePolygons]);
};

const buildNodeCoveragePolygons = (
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
	request: SmartCopperPourPreviewRequest,
): ReadonlyArray<SkeletonPolygon> => {
	return padNodes.flatMap((padNode) => {
		const outline = buildPadNodeOutline(padNode);
		if (request.width <= 0) {
			return [outline];
		}

		return buildClosedPolygonOffsetPolygons({
			polygon: outline,
			width: request.width,
			cornerStyle: request.cornerStyle,
		});
	});
};

const createPadTransitionGeometry = (
	segments: ReadonlyArray<SkeletonSegment>,
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
	request: SmartCopperPourPreviewRequest,
	width: number,
): { segments: ReadonlyArray<SkeletonSegment>; transitionPolygons: ReadonlyArray<SkeletonPolygon> } => {
	const trimmedSegments = trimSegmentsToNodeBoundaries(segments, padNodes);
	if (request.useNodeSizeAsBaseWidth === false || request.cornerStyle !== 'bevel45') {
		return {
			segments: trimmedSegments,
			transitionPolygons: [],
		};
	}

	const nodesByCenter = new Map<string, (typeof padNodes)[number]>();
	for (const padNode of padNodes) {
		nodesByCenter.set(toPointKey(padNode.center), padNode);
	}

	const adjustedSegments: SkeletonSegment[] = [];
	const transitionPolygons: SkeletonPolygon[] = [];
	for (const segment of trimmedSegments) {
		const preparedStart = prepareSegmentEndpointTransition(segment.start, segment.end, nodesByCenter, request, width);
		const preparedEnd = prepareSegmentEndpointTransition(segment.end, segment.start, nodesByCenter, request, width);
		adjustedSegments.push({
			...segment,
			start: preparedStart.segmentPoint,
			end: preparedEnd.segmentPoint,
		});
		if (preparedStart.transitionPolygon !== undefined) {
			transitionPolygons.push(preparedStart.transitionPolygon);
		}
		if (preparedEnd.transitionPolygon !== undefined) {
			transitionPolygons.push(preparedEnd.transitionPolygon);
		}
	}

	return {
		segments: adjustedSegments.filter((segment) => segment.start.x !== segment.end.x || segment.start.y !== segment.end.y),
		transitionPolygons,
	};
};

const prepareSegmentEndpointTransition = (
	endpoint: SkeletonPoint,
	otherPoint: SkeletonPoint,
	nodesByCenter: ReadonlyMap<string, ReturnType<typeof resolveSelectedPadNodes>[number]>,
	request: SmartCopperPourPreviewRequest,
	width: number,
): { segmentPoint: SkeletonPoint; transitionPolygon?: SkeletonPolygon } => {
	const node = nodesByCenter.get(toPointKey(endpoint));
	if (node === undefined) {
		return { segmentPoint: endpoint };
	}

	const connectionPoint = projectNodeBoundaryPoint(node, otherPoint);
	const direction = normalizeVector({ x: otherPoint.x - endpoint.x, y: otherPoint.y - endpoint.y });
	if (direction === undefined) {
		return { segmentPoint: connectionPoint };
	}

	const localWidth = resolveNodeConnectionWidth(node, direction, request.width);
	if (localWidth >= width - 0.001) {
		return { segmentPoint: connectionPoint };
	}

	const transitionLength = (width - localWidth) / 2;
	if (transitionLength <= 0.001) {
		return { segmentPoint: connectionPoint };
	}

	const segmentPoint = {
		x: connectionPoint.x + direction.x * transitionLength,
		y: connectionPoint.y + direction.y * transitionLength,
	};

	return {
		segmentPoint,
		transitionPolygon: buildTransitionPolygon(connectionPoint, segmentPoint, localWidth, width, direction),
	};
};

const resolveNodeConnectionWidth = (
	node: ReturnType<typeof resolveSelectedPadNodes>[number],
	direction: { x: number; y: number },
	additionalWidth: number,
): number => {
	const padWidth = node.width ?? node.effectiveRadius * 2;
	const padHeight = node.height ?? node.effectiveRadius * 2;
	if (node.outlineShape !== 'rect') {
		return Math.max(padWidth, padHeight) + additionalWidth;
	}

	const localDirection = projectBoardDirectionToNodeLocal(direction, node.rotation);
	const localPerpendicular = {
		x: -localDirection.y,
		y: localDirection.x,
	};
	const directionLength = Math.hypot(localPerpendicular.x, localPerpendicular.y);
	if (directionLength <= 0.001) {
		return Math.max(padWidth, padHeight) + additionalWidth;
	}

	const unitPerpendicular = {
		x: localPerpendicular.x / directionLength,
		y: localPerpendicular.y / directionLength,
	};
	const halfWidth = padWidth / 2;
	const halfHeight = padHeight / 2;
	const lateralHalfSpan = Math.abs(unitPerpendicular.x) * halfWidth + Math.abs(unitPerpendicular.y) * halfHeight;
	return lateralHalfSpan * 2 + additionalWidth;
};

const buildTransitionPolygon = (
	startPoint: SkeletonPoint,
	endPoint: SkeletonPoint,
	startWidth: number,
	endWidth: number,
	direction: { x: number; y: number },
): SkeletonPolygon => {
	const perpendicular = {
		x: -direction.y,
		y: direction.x,
	};
	const startOffsetX = perpendicular.x * (startWidth / 2);
	const startOffsetY = perpendicular.y * (startWidth / 2);
	const endOffsetX = perpendicular.x * (endWidth / 2);
	const endOffsetY = perpendicular.y * (endWidth / 2);

	return {
		vertices: [
			{ x: startPoint.x + startOffsetX, y: startPoint.y + startOffsetY },
			{ x: endPoint.x + endOffsetX, y: endPoint.y + endOffsetY },
			{ x: endPoint.x - endOffsetX, y: endPoint.y - endOffsetY },
			{ x: startPoint.x - startOffsetX, y: startPoint.y - startOffsetY },
		],
	};
};

const normalizeVector = (vector: { x: number; y: number }): { x: number; y: number } | undefined => {
	const length = Math.hypot(vector.x, vector.y);
	if (length <= 0.001) {
		return undefined;
	}

	return {
		x: vector.x / length,
		y: vector.y / length,
	};
};

const trimSegmentsToNodeBoundaries = (
	segments: ReadonlyArray<SkeletonSegment>,
	padNodes: ReturnType<typeof resolveSelectedPadNodes>,
): ReadonlyArray<SkeletonSegment> => {
	const nodesByCenter = new Map<string, (typeof padNodes)[number]>();
	for (const padNode of padNodes) {
		nodesByCenter.set(toPointKey(padNode.center), padNode);
	}

	return segments
		.map((segment) => {
			const startNode = nodesByCenter.get(toPointKey(segment.start));
			const endNode = nodesByCenter.get(toPointKey(segment.end));
			const trimmedStart = startNode === undefined ? segment.start : projectNodeBoundaryPoint(startNode, segment.end);
			const trimmedEnd = endNode === undefined ? segment.end : projectNodeBoundaryPoint(endNode, segment.start);
			return {
				...segment,
				start: trimmedStart,
				end: trimmedEnd,
			};
		})
		.filter((segment) => segment.start.x !== segment.end.x || segment.start.y !== segment.end.y);
};

const projectNodeBoundaryPoint = (
	padNode: ReturnType<typeof resolveSelectedPadNodes>[number],
	targetPoint: { x: number; y: number },
): { x: number; y: number } => {
	const deltaX = targetPoint.x - padNode.center.x;
	const deltaY = targetPoint.y - padNode.center.y;
	const length = Math.hypot(deltaX, deltaY);
	if (length === 0) {
		return padNode.center;
	}

	const unitX = deltaX / length;
	const unitY = deltaY / length;
	const radiusX = (padNode.width ?? padNode.effectiveRadius * 2) / 2;
	const radiusY = (padNode.height ?? padNode.effectiveRadius * 2) / 2;
	const localDirection = projectBoardDirectionToNodeLocal({ x: unitX, y: unitY }, padNode.rotation);
	const distance =
		padNode.outlineShape === 'rect'
			? Math.min(
					localDirection.x === 0 ? Number.POSITIVE_INFINITY : radiusX / Math.abs(localDirection.x),
					localDirection.y === 0 ? Number.POSITIVE_INFINITY : radiusY / Math.abs(localDirection.y),
				)
			: 1 /
				Math.sqrt((localDirection.x * localDirection.x) / (radiusX * radiusX) + (localDirection.y * localDirection.y) / (radiusY * radiusY));

	return rotateLocalPointToBoard(padNode.center, { x: localDirection.x * distance, y: localDirection.y * distance }, padNode.rotation);
};

const toPointKey = (point: { x: number; y: number }): string => `${point.x},${point.y}`;
