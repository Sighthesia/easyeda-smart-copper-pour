import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TopologyMode } from '../../../src/domain/topology-mode';

const planBuilder = {
	buildWriterInput: vi.fn(),
};

const writer = {
	writePreview: vi.fn(),
	applyFinal: vi.fn(),
	clearPreview: vi.fn(),
};

const selectionInspector = {
	inspectSelection: vi.fn(),
};

const reader = {
	readSelectedPrimitives: vi.fn(),
};

const runtimeObjectStore = {
	createPreviewRegion: vi.fn(),
	createPour: vi.fn(),
	deleteObject: vi.fn(),
};

const createRuntimeCopperPlanBuilder = vi.fn(() => planBuilder);
const createRuntimeLcedaPourObjectStore = vi.fn(() => runtimeObjectStore);
const createLcedaPourWriter = vi.fn(() => writer);
const createLcedaSelectedPrimitivesReader = vi.fn(() => reader);
const createSmartCopperPourSelectionInspector = vi.fn(() => selectionInspector);

vi.mock('../../../src/infrastructure/lceda/runtime-copper-plan-builder', () => ({
	createRuntimeCopperPlanBuilder,
}));

vi.mock('../../../src/infrastructure/lceda/runtime-pour-object-store', () => ({
	createRuntimeLcedaPourObjectStore,
}));

vi.mock('../../../src/infrastructure/lceda/pour-writer', () => ({
	createLcedaPourWriter,
}));

vi.mock('../../../src/infrastructure/lceda/selection-inspector', () => ({
	createLcedaSelectedPrimitivesReader,
	createSmartCopperPourSelectionInspector,
}));

describe('createRuntimeSmartCopperPourControllerDependencies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('wires runtime factories to the expected runtime adapters', async () => {
		const { createRuntimeSmartCopperPourControllerDependencies } = await import(
			'../../../src/infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies'
		);

		createRuntimeSmartCopperPourControllerDependencies();

		expect(selectionInspector.inspectSelection).not.toHaveBeenCalled();
		expect(reader.readSelectedPrimitives).not.toHaveBeenCalled();
		expect(createLcedaSelectedPrimitivesReader).toHaveBeenCalledTimes(1);
		expect(createSmartCopperPourSelectionInspector).toHaveBeenCalledWith(reader);
		expect(createRuntimeCopperPlanBuilder).toHaveBeenCalledTimes(1);
		expect(createRuntimeLcedaPourObjectStore).toHaveBeenCalledTimes(1);
		expect(createLcedaPourWriter).toHaveBeenCalledWith(runtimeObjectStore);
	});

	test('delegates preview through plan building and preview writing', async () => {
		planBuilder.buildWriterInput.mockResolvedValue({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [{ vertices: [] }],
		});
		writer.writePreview.mockResolvedValue({ previewToken: 'preview-token' });
		reader.readSelectedPrimitives.mockResolvedValue([]);

		const { createRuntimeSmartCopperPourControllerDependencies } = await import(
			'../../../src/infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies'
		);
		const dependencies = createRuntimeSmartCopperPourControllerDependencies();

		expect(createLcedaSelectedPrimitivesReader).toHaveBeenCalledTimes(1);
		expect(createSmartCopperPourSelectionInspector).toHaveBeenCalledWith(reader);
		expect(createRuntimeCopperPlanBuilder).toHaveBeenCalledTimes(1);
		expect(createRuntimeLcedaPourObjectStore).toHaveBeenCalledTimes(1);
		expect(createLcedaPourWriter).toHaveBeenCalledWith(runtimeObjectStore);

		await dependencies.previewGateway.preview({
			topologyMode: TopologyMode.Tree,
			width: 2,
			keepoutMargin: 0,
		});

		expect(planBuilder.buildWriterInput).toHaveBeenCalledWith({
			topologyMode: TopologyMode.Tree,
			width: 2,
			keepoutMargin: 0,
		});
		expect(writer.writePreview).toHaveBeenCalledWith({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [{ vertices: [] }],
		});
		expect(writer.clearPreview).not.toHaveBeenCalled();
	});

	test('delegates clear preview to the writer', async () => {
		const { createRuntimeSmartCopperPourControllerDependencies } = await import(
			'../../../src/infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies'
		);
		const dependencies = createRuntimeSmartCopperPourControllerDependencies();

		await dependencies.previewGateway.clearPreview();

		expect(writer.clearPreview).toHaveBeenCalledTimes(1);
		expect(writer.writePreview).not.toHaveBeenCalled();
		expect(writer.applyFinal).not.toHaveBeenCalled();
	});

	test('delegates apply through plan building and preserves preview token', async () => {
		planBuilder.buildWriterInput.mockResolvedValue({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [{ vertices: [] }],
		});
		writer.applyFinal.mockResolvedValue({ applied: true });
		reader.readSelectedPrimitives.mockResolvedValue([]);

		const { createRuntimeSmartCopperPourControllerDependencies } = await import(
			'../../../src/infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies'
		);
		const dependencies = createRuntimeSmartCopperPourControllerDependencies();

		await dependencies.applyGateway.apply({
			topologyMode: TopologyMode.Tree,
			width: 2,
			keepoutMargin: 0,
			previewToken: 'preview-token',
		});

		expect(planBuilder.buildWriterInput).toHaveBeenCalledWith({
			topologyMode: TopologyMode.Tree,
			width: 2,
			keepoutMargin: 0,
			previewToken: 'preview-token',
		});
		expect(writer.applyFinal).toHaveBeenCalledWith({
			layerId: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			polygons: [{ vertices: [] }],
			previewToken: 'preview-token',
		});
	});
});
