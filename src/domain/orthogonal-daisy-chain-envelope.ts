import type { SmartCopperPourPreviewRequest } from '../application/smart-copper-pour-contract';
import { unionSkeletonPolygons } from '../infrastructure/geometry/polygon-boolean';
import type { PadNode } from './pad-node';
import { buildPadNodeOutline } from './pad-node-outline';
import type { SkeletonPoint, SkeletonPolygon, SkeletonSegment } from './skeleton-types';

export interface OrthogonalDaisyChainEnvelopeHelpers {
	buildNodeCoveragePolygons: (padNodes: ReadonlyArray<PadNode>, request: SmartCopperPourPreviewRequest) => ReadonlyArray<SkeletonPolygon>;
	projectNodeBoundaryPoint: (padNode: PadNode, targetPoint: SkeletonPoint) => SkeletonPoint;
	resolveNodeConnectionWidth: (padNode: PadNode, direction: SkeletonPoint, additionalWidth: number) => number;
	resolveSkeletonSegments: (padNodes: ReadonlyArray<PadNode>, request: SmartCopperPourPreviewRequest) => ReadonlyArray<SkeletonSegment>;
	normalizeVector: (vector: SkeletonPoint) => SkeletonPoint | undefined;
}

interface OrthogonalDaisyChainBranchProfile {
	polygon: SkeletonPolygon;
	junctionPoint: SkeletonPoint;
	localWidth: number;
}

export const shouldUseOrthogonalDaisyChainRightAngleNodeEnvelope = (
	padNodes: ReadonlyArray<PadNode>,
	request: SmartCopperPourPreviewRequest,
): boolean => {
	return (
		request.topologyMode === 'daisyChain' &&
		request.orthogonalRouting !== false &&
		request.useNodeSizeAsBaseWidth !== false &&
		request.cornerStyle === 'rightAngle' &&
		hasMeaningfulNodeWidthVariation(padNodes, request.width)
	);
};

export const buildOrthogonalDaisyChainRightAngleNodeEnvelope = (
	padNodes: ReadonlyArray<PadNode>,
	request: SmartCopperPourPreviewRequest,
	width: number,
	helpers: OrthogonalDaisyChainEnvelopeHelpers,
): ReadonlyArray<SkeletonPolygon> => {
	const skeletonSegments = helpers.resolveSkeletonSegments(padNodes, request);
	const trunkSegment = skeletonSegments.find((segment) => segment.role === 'trunk');
	if (trunkSegment === undefined) {
		return helpers.buildNodeCoveragePolygons(padNodes, request);
	}

	const nodesByCenter = new Map<string, PadNode>();
	for (const padNode of padNodes) {
		nodesByCenter.set(toPointKey(padNode.center), padNode);
	}

	const branchProfiles = skeletonSegments
		.filter((segment) => segment.role !== 'trunk')
		.flatMap((segment) => buildBranchProfile(segment, nodesByCenter, request.width, helpers));
	const basePolygons = [...buildTrunkSlabs(trunkSegment, branchProfiles, width), ...branchProfiles.map((profile) => profile.polygon)];
	const unionBasePolygons = unionSkeletonPolygons(basePolygons);
	const uncoveredNodeCoveragePolygons = filterUncoveredNodeCoveragePolygons(
		unionBasePolygons,
		helpers.buildNodeCoveragePolygons(padNodes, request),
	);
	return unionSkeletonPolygons([...unionBasePolygons, ...uncoveredNodeCoveragePolygons]);
};

const hasMeaningfulNodeWidthVariation = (padNodes: ReadonlyArray<PadNode>, additionalWidth: number): boolean => {
	if (padNodes.length < 2) {
		return false;
	}

	const hasRotatedOrElongatedRectNode = padNodes.some((padNode) => {
		if (padNode.outlineShape !== 'rect') {
			return false;
		}

		const width = padNode.width ?? padNode.effectiveRadius * 2;
		const height = padNode.height ?? padNode.effectiveRadius * 2;
		const normalizedRotation = (padNode.rotation ?? 0) % 180;
		return Math.abs(width - height) > 0.001 && Math.abs(normalizedRotation) > 0.001;
	});
	if (!hasRotatedOrElongatedRectNode) {
		return false;
	}

	const widths = padNodes.map((padNode) => {
		const width = padNode.width ?? padNode.effectiveRadius * 2;
		const height = padNode.height ?? padNode.effectiveRadius * 2;
		return Math.max(width, height) + additionalWidth;
	});

	return Math.max(...widths) - Math.min(...widths) > 0.001;
};

const buildBranchProfile = (
	segment: SkeletonSegment,
	nodesByCenter: ReadonlyMap<string, PadNode>,
	additionalWidth: number,
	helpers: OrthogonalDaisyChainEnvelopeHelpers,
): ReadonlyArray<OrthogonalDaisyChainBranchProfile> => {
	const startNode = nodesByCenter.get(toPointKey(segment.start));
	const endNode = nodesByCenter.get(toPointKey(segment.end));
	const node = startNode ?? endNode;
	if (node === undefined) {
		return [];
	}

	const junctionPoint = startNode !== undefined ? segment.end : segment.start;
	const direction = helpers.normalizeVector({ x: junctionPoint.x - node.center.x, y: junctionPoint.y - node.center.y });
	if (direction === undefined) {
		return [];
	}

	const connectionPoint = helpers.projectNodeBoundaryPoint(node, junctionPoint);
	const localWidth = helpers.resolveNodeConnectionWidth(node, direction, additionalWidth);
	return [
		{
			junctionPoint,
			localWidth,
			polygon: buildAxisAlignedRectPolygon(connectionPoint, junctionPoint, localWidth / 2),
		},
	];
};

const buildTrunkSlabs = (
	trunkSegment: SkeletonSegment,
	branchProfiles: ReadonlyArray<OrthogonalDaisyChainBranchProfile>,
	defaultWidth: number,
): ReadonlyArray<SkeletonPolygon> => {
	if (branchProfiles.length === 0) {
		return [buildAxisAlignedRectPolygon(trunkSegment.start, trunkSegment.end, defaultWidth / 2)];
	}

	if (Math.abs(trunkSegment.start.y - trunkSegment.end.y) <= 0.001) {
		return buildHorizontalTrunkSlabs(trunkSegment, branchProfiles);
	}

	return buildVerticalTrunkSlabs(trunkSegment, branchProfiles);
};

const buildHorizontalTrunkSlabs = (
	trunkSegment: SkeletonSegment,
	branchProfiles: ReadonlyArray<OrthogonalDaisyChainBranchProfile>,
): ReadonlyArray<SkeletonPolygon> => {
	const horizontalProfiles = [...branchProfiles].sort((left, right) => left.junctionPoint.x - right.junctionPoint.x);
	const slabs: SkeletonPolygon[] = [];
	for (let index = 0; index < horizontalProfiles.length; index += 1) {
		const currentProfile = horizontalProfiles[index];
		const currentHalfWidth = currentProfile.localWidth / 2;
		const currentStartX = currentProfile.junctionPoint.x - currentHalfWidth;
		const currentEndX = currentProfile.junctionPoint.x + currentHalfWidth;
		slabs.push(
			buildAxisAlignedRectPolygon({ x: currentStartX, y: trunkSegment.start.y }, { x: currentEndX, y: trunkSegment.end.y }, currentHalfWidth),
		);

		const nextProfile = horizontalProfiles[index + 1];
		if (nextProfile === undefined) {
			continue;
		}

		const nextHalfWidth = nextProfile.localWidth / 2;
		const startX = currentEndX;
		const endX = nextProfile.junctionPoint.x - nextHalfWidth;
		if (endX - startX <= 0.001) {
			continue;
		}

		slabs.push(
			buildAxisAlignedRectPolygon(
				{ x: startX, y: trunkSegment.start.y },
				{ x: endX, y: trunkSegment.end.y },
				Math.max(currentHalfWidth, nextHalfWidth),
			),
		);
	}

	return slabs;
};

const buildVerticalTrunkSlabs = (
	trunkSegment: SkeletonSegment,
	branchProfiles: ReadonlyArray<OrthogonalDaisyChainBranchProfile>,
): ReadonlyArray<SkeletonPolygon> => {
	const verticalProfiles = [...branchProfiles].sort((left, right) => left.junctionPoint.y - right.junctionPoint.y);
	const slabs: SkeletonPolygon[] = [];
	for (let index = 0; index < verticalProfiles.length; index += 1) {
		const currentProfile = verticalProfiles[index];
		const currentHalfWidth = currentProfile.localWidth / 2;
		const currentStartY = currentProfile.junctionPoint.y - currentHalfWidth;
		const currentEndY = currentProfile.junctionPoint.y + currentHalfWidth;
		slabs.push(
			buildAxisAlignedRectPolygon({ x: trunkSegment.start.x, y: currentStartY }, { x: trunkSegment.end.x, y: currentEndY }, currentHalfWidth),
		);

		const nextProfile = verticalProfiles[index + 1];
		if (nextProfile === undefined) {
			continue;
		}

		const nextHalfWidth = nextProfile.localWidth / 2;
		const startY = currentEndY;
		const endY = nextProfile.junctionPoint.y - nextHalfWidth;
		if (endY - startY <= 0.001) {
			continue;
		}

		slabs.push(
			buildAxisAlignedRectPolygon(
				{ x: trunkSegment.start.x, y: startY },
				{ x: trunkSegment.end.x, y: endY },
				Math.max(currentHalfWidth, nextHalfWidth),
			),
		);
	}

	return slabs;
};

const filterUncoveredNodeCoveragePolygons = (
	basePolygons: ReadonlyArray<SkeletonPolygon>,
	nodeCoveragePolygons: ReadonlyArray<SkeletonPolygon>,
): ReadonlyArray<SkeletonPolygon> => {
	return nodeCoveragePolygons.filter((polygon) => polygon.vertices.some((vertex) => !isPointInsideOrOnPolygonBoundary(vertex, basePolygons)));
};

const isPointInsideOrOnPolygonBoundary = (point: SkeletonPoint, polygons: ReadonlyArray<SkeletonPolygon>): boolean => {
	return polygons.some((polygon) => isPointOnPolygonBoundary(point, polygon) || isPointInsidePolygon(point, polygon));
};

const isPointOnPolygonBoundary = (point: SkeletonPoint, polygon: SkeletonPolygon): boolean => {
	for (let index = 0; index < polygon.vertices.length; index += 1) {
		const start = polygon.vertices[index];
		const end = polygon.vertices[(index + 1) % polygon.vertices.length];
		if (isPointOnSegment(point, start, end)) {
			return true;
		}
	}

	return false;
};

const isPointOnSegment = (point: SkeletonPoint, start: SkeletonPoint, end: SkeletonPoint, epsilon = 0.001): boolean => {
	const cross = (point.y - start.y) * (end.x - start.x) - (point.x - start.x) * (end.y - start.y);
	if (Math.abs(cross) > epsilon) {
		return false;
	}

	const dot = (point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y);
	if (dot < -epsilon) {
		return false;
	}

	const squaredLength = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
	return dot - squaredLength <= epsilon;
};

const isPointInsidePolygon = (point: SkeletonPoint, polygon: SkeletonPolygon): boolean => {
	let inside = false;
	for (let index = 0, previousIndex = polygon.vertices.length - 1; index < polygon.vertices.length; previousIndex = index, index += 1) {
		const currentVertex = polygon.vertices[index];
		const previousVertex = polygon.vertices[previousIndex];
		const intersects =
			currentVertex.y > point.y !== previousVertex.y > point.y &&
			point.x < ((previousVertex.x - currentVertex.x) * (point.y - currentVertex.y)) / (previousVertex.y - currentVertex.y) + currentVertex.x;
		if (intersects) {
			inside = !inside;
		}
	}

	return inside;
};

const buildAxisAlignedRectPolygon = (startPoint: SkeletonPoint, endPoint: SkeletonPoint, halfWidth: number): SkeletonPolygon => {
	const direction = normalizeVector({ x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y });
	if (direction === undefined) {
		return {
			vertices: [
				{ x: startPoint.x - halfWidth, y: startPoint.y - halfWidth },
				{ x: startPoint.x + halfWidth, y: startPoint.y - halfWidth },
				{ x: startPoint.x + halfWidth, y: startPoint.y + halfWidth },
				{ x: startPoint.x - halfWidth, y: startPoint.y + halfWidth },
			],
		};
	}

	const perpendicular = {
		x: -direction.y,
		y: direction.x,
	};
	const offsetX = perpendicular.x * halfWidth;
	const offsetY = perpendicular.y * halfWidth;
	return {
		vertices: [
			{ x: startPoint.x + offsetX, y: startPoint.y + offsetY },
			{ x: endPoint.x + offsetX, y: endPoint.y + offsetY },
			{ x: endPoint.x - offsetX, y: endPoint.y - offsetY },
			{ x: startPoint.x - offsetX, y: startPoint.y - offsetY },
		],
	};
};

const toPointKey = (point: SkeletonPoint): string => `${point.x},${point.y}`;

const normalizeVector = (vector: SkeletonPoint): SkeletonPoint | undefined => {
	const length = Math.hypot(vector.x, vector.y);
	if (length <= 0.001) {
		return undefined;
	}

	return {
		x: vector.x / length,
		y: vector.y / length,
	};
};

export const buildNodeOutlinePolygon = (padNode: PadNode): SkeletonPolygon => buildPadNodeOutline(padNode);
