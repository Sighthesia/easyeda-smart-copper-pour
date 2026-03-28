import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TopologyMode } from '../../src/domain/topology-mode';

const controller = {
	inspectSelection: vi.fn(),
	preview: vi.fn(),
	apply: vi.fn(),
	clearPreview: vi.fn(),
};

const createLcedaSelectedPrimitivesReader = vi.fn();
const createRuntimeSmartCopperPourControllerDependencies = vi.fn(() => ({
	selectionInspector: {},
	previewGateway: {},
	applyGateway: {},
	obstacleResolver: {},
}));
const SmartCopperPourController = vi.fn(() => controller);

vi.mock('../../src/application/smart-copper-pour-controller', () => ({
	SmartCopperPourController,
}));

vi.mock('../../src/infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies', () => ({
	createRuntimeSmartCopperPourControllerDependencies,
}));

vi.mock('../../src/infrastructure/lceda/selection-inspector', () => ({
	createLcedaSelectedPrimitivesReader,
}));

describe('createSmartCopperPourPanelApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		createLcedaSelectedPrimitivesReader.mockReturnValue({
			readSelectedPrimitives: vi.fn().mockResolvedValue([
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
				{ id: 'pad-2', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 3, y: 4, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
			]),
		});
		controller.inspectSelection.mockResolvedValue({
			connectionCount: 2,
			layerName: 'TopLayer',
			netName: 'VCC',
			selectionFingerprint: 'fingerprint-1',
		});
		controller.preview.mockResolvedValue({ previewToken: 'preview-1' });
	});

	test('reuses the latest inspected selection snapshot for preview requests', async () => {
		const { createSmartCopperPourPanelApi } = await import('../../src/iframe/panel-api');
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const api = createSmartCopperPourPanelApi({ eda: {} } as never);

		await api.inspectSelection();
		await api.preview({
			topologyMode: TopologyMode.Tree,
			width: 1,
			keepoutMargin: 0,
		});

		expect(controller.inspectSelection).toHaveBeenCalledWith({
			selectionPrimitives: [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
				{ id: 'pad-2', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 3, y: 4, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
			],
		});
		expect(controller.preview).toHaveBeenCalledWith({
			keepoutMargin: 0,
			selectionPrimitives: [
				{ id: 'pad-1', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 1, y: 2, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
				{ id: 'pad-2', type: 'PAD', net: 'VCC', layer: 'TopLayer', x: 3, y: 4, width: 6, height: 4, padRadius: 3, holeRadius: 1 },
			],
			topologyMode: TopologyMode.Tree,
			width: 1,
		});
	});
});
