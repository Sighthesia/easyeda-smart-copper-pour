import type { SmartCopperPourCornerStyle } from '../application/smart-copper-pour-contract';
import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonPolygon } from './skeleton-types';

const FULL_TURN_RADIANS = Math.PI * 2;
const ELLIPSE_SEGMENTS = 24;

export interface BuildPadNodeOutlineOptions {
	cornerStyle?: SmartCopperPourCornerStyle;
}

export const buildPadNodeOutline = (node: PadNode, options: BuildPadNodeOutlineOptions = {}): SkeletonPolygon => {
	const width = node.width ?? node.effectiveRadius * 2;
	const height = node.height ?? node.effectiveRadius * 2;

	if (node.outlineShape === 'rect') {
		return buildRectOutline(node.center, width, height, options.cornerStyle);
	}

	return {
		vertices: createEllipseVertices(node.center, width / 2, height / 2),
	};
};

const buildRectOutline = (
	center: SkeletonPoint,
	width: number,
	height: number,
	cornerStyle: SmartCopperPourCornerStyle | undefined,
): SkeletonPolygon => {
	const bevelRadius = Math.min(width, height) / 2;

	switch (cornerStyle) {
		case 'bevel45':
			return {
				vertices: createBeveledRectVertices(center, width, height, bevelRadius),
			};
		case 'round':
			return {
				vertices: createRoundedRectVertices(center, width, height, bevelRadius),
			};
		case 'rightAngle':
		default:
			return {
				vertices: createRightAngleRectVertices(center, width, height),
			};
	}
};

const createRightAngleRectVertices = (center: SkeletonPoint, width: number, height: number): SkeletonPoint[] => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	return [
		{ x: center.x - halfWidth, y: center.y - halfHeight },
		{ x: center.x + halfWidth, y: center.y - halfHeight },
		{ x: center.x + halfWidth, y: center.y + halfHeight },
		{ x: center.x - halfWidth, y: center.y + halfHeight },
	];
};

const createBeveledRectVertices = (center: SkeletonPoint, width: number, height: number, bevelRadius: number): SkeletonPoint[] => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	const inset = Math.min(bevelRadius, halfWidth, halfHeight);
	return [
		{ x: center.x - halfWidth + inset, y: center.y - halfHeight },
		{ x: center.x + halfWidth - inset, y: center.y - halfHeight },
		{ x: center.x + halfWidth, y: center.y - halfHeight + inset },
		{ x: center.x + halfWidth, y: center.y + halfHeight - inset },
		{ x: center.x + halfWidth - inset, y: center.y + halfHeight },
		{ x: center.x - halfWidth + inset, y: center.y + halfHeight },
		{ x: center.x - halfWidth, y: center.y + halfHeight - inset },
		{ x: center.x - halfWidth, y: center.y - halfHeight + inset },
	];
};

const createRoundedRectVertices = (center: SkeletonPoint, width: number, height: number, radius: number): SkeletonPoint[] => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	const clampedRadius = Math.min(radius, halfWidth, halfHeight);
	const cornerCenters: ReadonlyArray<SkeletonPoint> = [
		{ x: center.x + halfWidth - clampedRadius, y: center.y - halfHeight + clampedRadius },
		{ x: center.x + halfWidth - clampedRadius, y: center.y + halfHeight - clampedRadius },
		{ x: center.x - halfWidth + clampedRadius, y: center.y + halfHeight - clampedRadius },
		{ x: center.x - halfWidth + clampedRadius, y: center.y - halfHeight + clampedRadius },
	];
	const startAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
	const vertices: SkeletonPoint[] = [];

	for (let cornerIndex = 0; cornerIndex < cornerCenters.length; cornerIndex += 1) {
		const cornerCenter = cornerCenters[cornerIndex];
		const startAngle = startAngles[cornerIndex];
		for (let stepIndex = 0; stepIndex < ELLIPSE_SEGMENTS / 4; stepIndex += 1) {
			const angle = startAngle + (stepIndex / (ELLIPSE_SEGMENTS / 4 - 1)) * (Math.PI / 2);
			vertices.push({
				x: cornerCenter.x + Math.cos(angle) * clampedRadius,
				y: cornerCenter.y + Math.sin(angle) * clampedRadius,
			});
		}
	}

	return vertices;
};

const createEllipseVertices = (center: SkeletonPoint, radiusX: number, radiusY: number): SkeletonPoint[] => {
	const vertices: SkeletonPoint[] = [];
	for (let index = 0; index < ELLIPSE_SEGMENTS; index += 1) {
		const angle = (index / ELLIPSE_SEGMENTS) * FULL_TURN_RADIANS;
		vertices.push({
			x: center.x + Math.cos(angle) * radiusX,
			y: center.y + Math.sin(angle) * radiusY,
		});
	}

	return vertices;
};
