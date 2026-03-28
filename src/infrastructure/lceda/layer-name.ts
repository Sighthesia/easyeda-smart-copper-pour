const TOP_LAYER_ID = 1;
const BOTTOM_LAYER_ID = 2;
const FIRST_INNER_LAYER_ID = 15;
const LAST_INNER_LAYER_ID = 44;

export const isSupportedLcedaCopperLayerId = (layerId: unknown): layerId is number => {
	return (
		typeof layerId === 'number' &&
		Number.isInteger(layerId) &&
		(layerId === TOP_LAYER_ID || layerId === BOTTOM_LAYER_ID || (layerId >= FIRST_INNER_LAYER_ID && layerId <= LAST_INNER_LAYER_ID))
	);
};

export const toLcedaLayerName = (layer: unknown): string | null => {
	if (typeof layer === 'string') {
		const layerName = layer.trim();
		if (layerName.length === 0) {
			return null;
		}

		const numericLayer = Number.parseInt(layerName, 10);
		if (String(numericLayer) === layerName) {
			return toLcedaLayerName(numericLayer);
		}

		return layerName;
	}

	if (typeof layer !== 'number' || !Number.isInteger(layer)) {
		return null;
	}

	if (layer === TOP_LAYER_ID) {
		return 'TopLayer';
	}

	if (layer === BOTTOM_LAYER_ID) {
		return 'BottomLayer';
	}

	if (isSupportedLcedaCopperLayerId(layer) && layer >= FIRST_INNER_LAYER_ID) {
		return `Inner${layer - FIRST_INNER_LAYER_ID + 1}`;
	}

	return null;
};

export const toLcedaLayerId = (layerName: string): number | null => {
	if (layerName === 'TopLayer') {
		return TOP_LAYER_ID;
	}

	if (layerName === 'BottomLayer') {
		return BOTTOM_LAYER_ID;
	}

	const innerLayerMatch = /^Inner(\d+)$/.exec(layerName);
	if (innerLayerMatch === null) {
		return null;
	}

	const innerLayerIndex = Number.parseInt(innerLayerMatch[1], 10);
	if (!Number.isInteger(innerLayerIndex) || innerLayerIndex < 1 || innerLayerIndex > LAST_INNER_LAYER_ID - FIRST_INNER_LAYER_ID + 1) {
		return null;
	}

	return FIRST_INNER_LAYER_ID + innerLayerIndex - 1;
};
