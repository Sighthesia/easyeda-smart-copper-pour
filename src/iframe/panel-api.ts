import type {
	SmartCopperPourApplyRequest,
	SmartCopperPourApplyResult,
	SmartCopperPourClearPreviewResult,
	SmartCopperPourPreviewRequest,
	SmartCopperPourPreviewResult,
	SmartCopperPourSelectedPrimitive,
	SmartCopperPourSelectionSummary,
} from '../application/smart-copper-pour-contract';
import { SmartCopperPourController } from '../application/smart-copper-pour-controller';
import { createRuntimeSmartCopperPourControllerDependencies } from '../infrastructure/lceda/runtime-smart-copper-pour-controller-dependencies';
import { createLcedaSelectedPrimitivesReader } from '../infrastructure/lceda/selection-inspector';
import { type SmartCopperPourRuntimeWindow, ensureEasyEdaApi, resolveSelectionRuntime } from './runtime-eda';

export interface SmartCopperPourPanelApi {
	inspectSelection: () => Promise<SmartCopperPourSelectionSummary>;
	preview: (request: SmartCopperPourPreviewRequest) => Promise<SmartCopperPourPreviewResult>;
	apply: (request: SmartCopperPourApplyRequest) => Promise<SmartCopperPourApplyResult>;
	clearPreview: () => Promise<SmartCopperPourClearPreviewResult>;
}

export const createSmartCopperPourPanelApi = (windowObject?: SmartCopperPourRuntimeWindow): SmartCopperPourPanelApi => {
	ensureEasyEdaApi(windowObject);
	const controller = new SmartCopperPourController(createRuntimeSmartCopperPourControllerDependencies());
	const selectionReader = createLcedaSelectedPrimitivesReader(resolveSelectionRuntime(windowObject));
	let latestSelectionPrimitives: readonly SmartCopperPourSelectedPrimitive[] = [];

	const inspectSelection = async (): Promise<SmartCopperPourSelectionSummary> => {
		latestSelectionPrimitives = await selectionReader.readSelectedPrimitives();
		return controller.inspectSelection({
			selectionPrimitives: latestSelectionPrimitives,
		});
	};

	const withSelectionSnapshot = <TRequest extends SmartCopperPourPreviewRequest | SmartCopperPourApplyRequest>(request: TRequest): TRequest => {
		if (latestSelectionPrimitives.length === 0) {
			return request;
		}

		return {
			...request,
			selectionPrimitives: latestSelectionPrimitives,
		};
	};

	return {
		inspectSelection,
		preview: (request) => controller.preview(withSelectionSnapshot(request)),
		apply: (request) => controller.apply(withSelectionSnapshot(request)),
		clearPreview: () => controller.clearPreview(),
	};
};
