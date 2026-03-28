import {
	type SmartCopperPourControllerDependencies,
	createSmartCopperPourControllerDependencies,
} from '../../application/smart-copper-pour-controller';
import { createLcedaPourWriter } from './pour-writer';
import { createRuntimeCopperPlanBuilder } from './runtime-copper-plan-builder';
import { createRuntimeLcedaPourObjectStore } from './runtime-pour-object-store';
import { createLcedaSelectedPrimitivesReader, createSmartCopperPourSelectionInspector } from './selection-inspector';

export const createRuntimeSmartCopperPourControllerDependencies = (): SmartCopperPourControllerDependencies => {
	const selectionInspector = createSmartCopperPourSelectionInspector(createLcedaSelectedPrimitivesReader());
	const planBuilder = createRuntimeCopperPlanBuilder();
	const writer = createLcedaPourWriter(createRuntimeLcedaPourObjectStore());

	return createSmartCopperPourControllerDependencies({
		selectionInspector,
		previewGateway: {
			preview: async (request) => writer.writePreview(await planBuilder.buildWriterInput(request)),
			clearPreview: async () => writer.clearPreview(),
		},
		applyGateway: {
			apply: async (request) =>
				writer.applyFinal({
					...(await planBuilder.buildWriterInput(request)),
					previewToken: request.previewToken ?? null,
				}),
		},
	});
};
