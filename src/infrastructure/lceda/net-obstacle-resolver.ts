import type { SkeletonObstacle, SkeletonPoint } from '../../domain/skeleton-types';
import type { SmartCopperPourObstacleResolver, SmartCopperPourObstacleResolverInput } from '../../application/smart-copper-pour-controller';

/**
 * Minimal LCEDA primitive used for obstacle extraction.
 *
 * @public
 */
export interface LcedaObstaclePrimitive {
	id: string;
	layer?: string | null;
	net?: string | null;
	x?: number;
	y?: number;
	width?: number | null;
	height?: number | null;
	outline?: ReadonlyArray<SkeletonPoint>;
}

/**
 * Query surface needed to inspect nearby LCEDA primitives.
 *
 * @public
 */
export interface LcedaObstacleQuery {
	listSameLayerPrimitives(layerName: string): Promise<ReadonlyArray<LcedaObstaclePrimitive>>;
}

/**
 * Creates an obstacle resolver that conservatively envelopes foreign-net primitives.
 *
 * @param query
 * - LCEDA primitive query bound to the runtime object model.
 *
 * @returns
 * - Resolver returning planner-space obstacle polygons.
 *
 * @public
 */
export const createLcedaNetObstacleResolver = (query: LcedaObstacleQuery): SmartCopperPourObstacleResolver => ({
	resolveObstacles: async (input: SmartCopperPourObstacleResolverInput): Promise<ReadonlyArray<SkeletonObstacle>> => {
		if (input.layerName === null) {
			return [];
		}

		const primitives = await query.listSameLayerPrimitives(input.layerName);
		return primitives
			.filter((primitive) => primitive.net !== input.netName)
			.map(toSkeletonObstacle)
			.filter((obstacle): obstacle is SkeletonObstacle => obstacle !== null);
	},
});

const toSkeletonObstacle = (primitive: LcedaObstaclePrimitive): SkeletonObstacle | null => {
	if (primitive.outline !== undefined && primitive.outline.length >= 3) {
		return {
			outline: {
				vertices: primitive.outline,
			},
		};
	}

	if (
		typeof primitive.x !== 'number' ||
		!Number.isFinite(primitive.x) ||
		typeof primitive.y !== 'number' ||
		!Number.isFinite(primitive.y)
	) {
		return null;
	}

	const halfWidth = Math.max(primitive.width ?? 0, 0) / 2;
	const halfHeight = Math.max(primitive.height ?? primitive.width ?? 0, 0) / 2;
	if (halfWidth === 0 && halfHeight === 0) {
		return null;
	}

	return {
		outline: {
			vertices: [
				{ x: primitive.x - halfWidth, y: primitive.y - halfHeight },
				{ x: primitive.x + halfWidth, y: primitive.y - halfHeight },
				{ x: primitive.x + halfWidth, y: primitive.y + halfHeight },
				{ x: primitive.x - halfWidth, y: primitive.y + halfHeight },
			],
		},
	};
};
