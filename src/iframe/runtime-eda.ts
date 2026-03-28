export type SmartCopperPourRuntimeWindow = Window & typeof globalThis & { eda?: typeof eda };

interface SmartCopperPourSelectionRuntime {
	pcb_SelectControl?: {
		getAllSelectedPrimitives?: () => Promise<unknown>;
	};
}

const readParentEda = (windowObject: SmartCopperPourRuntimeWindow): typeof eda | null => {
	try {
		return (windowObject.parent as SmartCopperPourRuntimeWindow | undefined)?.eda ?? null;
	} catch {
		return null;
	}
};

export const ensureEasyEdaApi = (windowObject: SmartCopperPourRuntimeWindow = window as SmartCopperPourRuntimeWindow): typeof eda => {
	const runtimeEda = windowObject.eda ?? readParentEda(windowObject);
	if (runtimeEda === null) {
		throw new Error('EasyEDA API is unavailable in current page runtime.');
	}

	if (windowObject.eda === undefined) {
		try {
			Object.assign(windowObject, { eda: runtimeEda });
		} catch {}
	}

	return runtimeEda;
};

const hasSelectionRuntime = (candidate: unknown): candidate is SmartCopperPourSelectionRuntime => {
	if (candidate === null || typeof candidate !== 'object') {
		return false;
	}

	const selectionControl = (candidate as SmartCopperPourSelectionRuntime).pcb_SelectControl;
	return selectionControl !== undefined && typeof selectionControl.getAllSelectedPrimitives === 'function';
};

export const resolveSelectionRuntime = (
	windowObject: SmartCopperPourRuntimeWindow = window as SmartCopperPourRuntimeWindow,
): SmartCopperPourSelectionRuntime => {
	if (hasSelectionRuntime(windowObject.eda)) {
		return windowObject.eda;
	}

	const parentEda = readParentEda(windowObject);
	if (hasSelectionRuntime(parentEda)) {
		return parentEda;
	}

	return ensureEasyEdaApi(windowObject) as unknown as SmartCopperPourSelectionRuntime;
};
