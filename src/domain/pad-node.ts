import type { SkeletonPoint } from './skeleton-types';

/**
 * Normalized pad input for copper planning.
 *
 * @public
 */
export interface PadNode {
	id: string;
	net: string;
	layer: string;
	center: SkeletonPoint;
	effectiveRadius: number;
	width?: number;
	height?: number;
	rotation?: number;
	outlineShape?: 'ellipse' | 'rect';
}
