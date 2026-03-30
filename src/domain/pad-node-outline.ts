import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonPolygon } from './skeleton-types';

const FULL_TURN_RADIANS = Math.PI * 2;
const ELLIPSE_SEGMENTS = 24;

export const buildPadNodeOutline = (node: PadNode): SkeletonPolygon => {
	const width = node.width ?? node.effectiveRadius * 2;
	const height = node.height ?? node.effectiveRadius * 2;

	if (node.outlineShape === 'rect') {
		const halfWidth = width / 2;
		const halfHeight = height / 2;
		return {
			vertices: [
				{ x: node.center.x - halfWidth, y: node.center.y - halfHeight },
				{ x: node.center.x + halfWidth, y: node.center.y - halfHeight },
				{ x: node.center.x + halfWidth, y: node.center.y + halfHeight },
				{ x: node.center.x - halfWidth, y: node.center.y + halfHeight },
			],
		};
	}

	return {
		vertices: createEllipseVertices(node.center, width / 2, height / 2),
	};
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
