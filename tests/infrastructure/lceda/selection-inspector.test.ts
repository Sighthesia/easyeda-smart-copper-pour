import { describe, expect, test } from 'vitest';

import { createSmartCopperPourSelectionInspector } from '../../../src/infrastructure/lceda/selection-inspector';

describe('createSmartCopperPourSelectionInspector', () => {
	test('summarizes normalized same-net pads', async () => {
		const inspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, padRadius: 1 },
				{ id: 'pad-2', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 3, y: 4, padRadius: 1.2 },
			],
		});

		await expect(inspector.inspectSelection()).resolves.toEqual({
			padCount: 2,
			netName: 'VCC',
			layerName: 'TopLayer',
		});
	});
});
