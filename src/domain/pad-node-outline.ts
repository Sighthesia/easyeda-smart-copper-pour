import type { SmartCopperPourCornerStyle } from '../application/smart-copper-pour-contract';
import type { PadNode } from './pad-node';
import type { SkeletonPoint, SkeletonPolygon } from './skeleton-types';

const FULL_TURN_RADIANS = Math.PI * 2;
const ELLIPSE_SEGMENTS = 24;
const DEGREES_TO_RADIANS = Math.PI / 180;

export interface BuildPadNodeOutlineOptions {
	cornerStyle?: SmartCopperPourCornerStyle;
}

export const buildPadNodeOutline = (node: PadNode): SkeletonPolygon => {
	const width = node.width ?? node.effectiveRadius * 2;
	const height = node.height ?? node.effectiveRadius * 2;
	const rotationRadians = toRotationRadians(node.rotation);

	if (node.outlineShape === 'rect') {
		return {
			vertices: createRightAngleRectVertices(node.center, width, height, rotationRadians),
		};
	}

	return {
		vertices: createEllipseVertices(node.center, width / 2, height / 2, rotationRadians),
	};
};

export const rotateLocalPointToBoard = (center: SkeletonPoint, point: SkeletonPoint, rotationDegrees = 0): SkeletonPoint => {
	return rotateLocalPointToBoardRadians(center, point, toRotationRadians(rotationDegrees));
};

export const projectBoardDirectionToNodeLocal = (direction: SkeletonPoint, rotationDegrees = 0): SkeletonPoint => {
	const rotationRadians = toRotationRadians(rotationDegrees);
	const cosRotation = Math.cos(rotationRadians);
	const sinRotation = Math.sin(rotationRadians);
	return {
		x: direction.x * cosRotation + direction.y * sinRotation,
		y: -direction.x * sinRotation + direction.y * cosRotation,
	};
};

const createRightAngleRectVertices = (center: SkeletonPoint, width: number, height: number, rotationRadians: number): SkeletonPoint[] => {
	const halfWidth = width / 2;
	const halfHeight = height / 2;
	return [
		rotateLocalPointToBoardRadians(center, { x: -halfWidth, y: -halfHeight }, rotationRadians),
		rotateLocalPointToBoardRadians(center, { x: halfWidth, y: -halfHeight }, rotationRadians),
		rotateLocalPointToBoardRadians(center, { x: halfWidth, y: halfHeight }, rotationRadians),
		rotateLocalPointToBoardRadians(center, { x: -halfWidth, y: halfHeight }, rotationRadians),
	];
};

const createEllipseVertices = (center: SkeletonPoint, radiusX: number, radiusY: number, rotationRadians: number): SkeletonPoint[] => {
	const vertices: SkeletonPoint[] = [];
	for (let index = 0; index < ELLIPSE_SEGMENTS; index += 1) {
		const angle = (index / ELLIPSE_SEGMENTS) * FULL_TURN_RADIANS;
		vertices.push({
			...rotateLocalPointToBoardRadians(center, { x: Math.cos(angle) * radiusX, y: Math.sin(angle) * radiusY }, rotationRadians),
		});
	}

	return vertices;
};

const rotateLocalPointToBoardRadians = (center: SkeletonPoint, point: SkeletonPoint, rotationRadians: number): SkeletonPoint => {
	if (rotationRadians === 0) {
		return {
			x: center.x + point.x,
			y: center.y + point.y,
		};
	}

	const cosRotation = Math.cos(rotationRadians);
	const sinRotation = Math.sin(rotationRadians);
	return {
		x: center.x + point.x * cosRotation - point.y * sinRotation,
		y: center.y + point.x * sinRotation + point.y * cosRotation,
	};
};

const toRotationRadians = (rotationDegrees: number | undefined): number => {
	if (rotationDegrees === undefined) {
		return 0;
	}

	return rotationDegrees * DEGREES_TO_RADIANS;
};
