import type {
	SmartCopperPourApplyResult,
	SmartCopperPourClearPreviewResult,
	SmartCopperPourPreviewResult,
	SmartCopperPourSelectionSummary,
} from '../application/smart-copper-pour-contract';
import {
	type SmartCopperPourFormElement,
	applyStoredFormState,
	isDaisyChainMode,
	loadStoredFormState,
	persistFormState,
	readSmartCopperPourRequest,
} from './form-state';
import { type SmartCopperPourPanelApi, createSmartCopperPourPanelApi } from './panel-api';
import type { SmartCopperPourRuntimeWindow } from './runtime-eda';

type SmartCopperPourStorage = Pick<Storage, 'getItem' | 'setItem'>;

interface SmartCopperPourIframeState {
	selectionFingerprint: string | null;
	selectionSummary: SmartCopperPourSelectionSummary | null;
}

export interface SmartCopperPourIframeApp {
	getState: () => SmartCopperPourIframeState;
	inspectSelection: () => Promise<SmartCopperPourSelectionSummary>;
	preview: () => Promise<{ selectionSummary: SmartCopperPourSelectionSummary; result: SmartCopperPourPreviewResult }>;
	apply: () => Promise<{ selectionSummary: SmartCopperPourSelectionSummary; result: SmartCopperPourApplyResult }>;
	clearPreview: () => Promise<SmartCopperPourClearPreviewResult>;
	persistFormState: () => void;
}

const resolveStorage = (windowObject: SmartCopperPourRuntimeWindow): SmartCopperPourStorage | undefined => {
	try {
		return windowObject.localStorage;
	} catch {
		return undefined;
	}
};

const resolveErrorMessage = (error: unknown, fallbackMessage: string): string => {
	if (error instanceof Error && error.message.trim().length > 0) {
		return error.message;
	}

	return fallbackMessage;
};

const setStatus = (statusPanel: HTMLElement, message: string, tone: 'neutral' | 'success' | 'error' = 'neutral'): void => {
	statusPanel.hidden = false;
	statusPanel.textContent = message;
	statusPanel.dataset.tone = tone;
};

const updateSelectionSummary = (
	selectionSummary: SmartCopperPourSelectionSummary,
	selectionNet: HTMLElement,
	selectionLayer: HTMLElement,
	selectionCount: HTMLElement,
): void => {
	selectionNet.textContent = selectionSummary.netName ?? 'Unknown';
	selectionLayer.textContent = selectionSummary.layerName ?? 'Unknown';
	selectionCount.textContent = String(selectionSummary.connectionCount);
};

const syncModeVisibility = (form: SmartCopperPourFormElement, daisyOnlyFields: NodeListOf<HTMLElement>): void => {
	const daisyChainMode = isDaisyChainMode(form.topologyMode.value);
	daisyOnlyFields.forEach((element) => {
		element.hidden = !daisyChainMode;
	});
};

const registerFormPersistence = (form: SmartCopperPourFormElement, onChange: () => void): void => {
	[
		form.topologyMode,
		form.cornerStyle,
		form.trunkBias,
		form.width,
		form.keepoutMargin,
		form.trunkStartX,
		form.trunkStartY,
		form.trunkEndX,
		form.trunkEndY,
	].forEach((field) => {
		field.addEventListener('change', onChange);
	});
};

export const resolveSuccessStatus = (
	command: 'preview' | 'apply' | 'clearPreview',
	payload?: SmartCopperPourPreviewResult | SmartCopperPourApplyResult | SmartCopperPourClearPreviewResult,
): { message: string; tone: 'success' } => {
	switch (command) {
		case 'preview':
			return { message: '预览已更新。', tone: 'success' };
		case 'apply':
			return {
				message: (payload as SmartCopperPourApplyResult | undefined)?.applied === true ? '铜皮已成功应用。' : '未生成铜皮。',
				tone: 'success',
			};
		case 'clearPreview':
			return { message: '预览已清除。', tone: 'success' };
	}
};

export const createIframeApp = (options: {
	form: SmartCopperPourFormElement;
	panelApi: SmartCopperPourPanelApi;
	storage?: SmartCopperPourStorage;
}): SmartCopperPourIframeApp => {
	const state: SmartCopperPourIframeState = {
		selectionFingerprint: null,
		selectionSummary: null,
	};

	const storedFormState = loadStoredFormState(options.storage);
	if (storedFormState !== null) {
		applyStoredFormState(options.form, storedFormState);
	}

	const inspectSelection = async (): Promise<SmartCopperPourSelectionSummary> => {
		const selectionSummary = await options.panelApi.inspectSelection();
		state.selectionFingerprint = selectionSummary.selectionFingerprint;
		state.selectionSummary = selectionSummary;
		return selectionSummary;
	};

	return {
		getState: () => ({ ...state }),
		inspectSelection,
		preview: async () => {
			const requestResult = readSmartCopperPourRequest(options.form);
			if (!requestResult.ok) {
				throw new Error(requestResult.errorMessage);
			}

			const selectionSummary = await inspectSelection();
			return {
				selectionSummary,
				result: await options.panelApi.preview(requestResult.request),
			};
		},
		apply: async () => {
			const requestResult = readSmartCopperPourRequest(options.form);
			if (!requestResult.ok) {
				throw new Error(requestResult.errorMessage);
			}

			const selectionSummary = await inspectSelection();
			return {
				selectionSummary,
				result: await options.panelApi.apply(requestResult.request),
			};
		},
		clearPreview: () => options.panelApi.clearPreview(),
		persistFormState: () => persistFormState(options.form, options.storage),
	};
};

export const bootstrapIframeApp = (
	options: {
		documentObject?: Document;
		windowObject?: SmartCopperPourRuntimeWindow;
		storage?: SmartCopperPourStorage;
		panelApi?: SmartCopperPourPanelApi;
	} = {},
): void => {
	const documentObject = options.documentObject ?? document;
	const windowObject = options.windowObject ?? (window as SmartCopperPourRuntimeWindow);
	const form = documentObject.getElementById('smart-copper-pour-form') as SmartCopperPourFormElement | null;
	if (form === null) {
		return;
	}

	const storage = options.storage ?? resolveStorage(windowObject);
	const panelApi = options.panelApi ?? createSmartCopperPourPanelApi(windowObject);
	const app = createIframeApp({ form, panelApi, storage });
	const previewButton = documentObject.getElementById('preview-button') as HTMLButtonElement | null;
	const applyButton = documentObject.getElementById('apply-button') as HTMLButtonElement | null;
	const clearButton = documentObject.getElementById('clear-button') as HTMLButtonElement | null;
	const statusPanel = documentObject.getElementById('status-panel') as HTMLElement | null;
	const selectionNet = documentObject.getElementById('selection-net') as HTMLElement | null;
	const selectionLayer = documentObject.getElementById('selection-layer') as HTMLElement | null;
	const selectionCount = documentObject.getElementById('selection-pad-count') as HTMLElement | null;
	const daisyOnlyFields = documentObject.querySelectorAll<HTMLElement>('[data-daisy-only]');
	if (statusPanel === null || selectionNet === null || selectionLayer === null || selectionCount === null) {
		return;
	}

	const renderSummary = (selectionSummary: SmartCopperPourSelectionSummary): void => {
		updateSelectionSummary(selectionSummary, selectionNet, selectionLayer, selectionCount);
	};

	const refreshSelection = async (successMessage: string): Promise<void> => {
		try {
			const selectionSummary = await app.inspectSelection();
			renderSummary(selectionSummary);
			setStatus(statusPanel, successMessage, 'success');
		} catch (error) {
			setStatus(statusPanel, resolveErrorMessage(error, '读取当前 PCB 选区失败。'), 'error');
		}
	};

	const refreshSelectionSilently = async (): Promise<void> => {
		const previousFingerprint = app.getState().selectionFingerprint;
		try {
			const selectionSummary = await app.inspectSelection();
			if (selectionSummary.selectionFingerprint !== previousFingerprint) {
				renderSummary(selectionSummary);
			}
		} catch {}
	};

	const handleFormChange = (): void => {
		app.persistFormState();
		syncModeVisibility(form, daisyOnlyFields);
	};

	registerFormPersistence(form, handleFormChange);
	previewButton?.addEventListener('click', () => {
		setStatus(statusPanel, '正在生成预览...', 'neutral');
		app.preview()
			.then(({ selectionSummary, result }) => {
				renderSummary(selectionSummary);
				const successStatus = resolveSuccessStatus('preview', result);
				setStatus(statusPanel, successStatus.message, successStatus.tone);
			})
			.catch((error) => {
				setStatus(statusPanel, resolveErrorMessage(error, '智能铜皮生成失败。'), 'error');
			});
	});
	applyButton?.addEventListener('click', () => {
		setStatus(statusPanel, '正在应用铜皮...', 'neutral');
		app.apply()
			.then(({ selectionSummary, result }) => {
				renderSummary(selectionSummary);
				const successStatus = resolveSuccessStatus('apply', result);
				setStatus(statusPanel, successStatus.message, successStatus.tone);
			})
			.catch((error) => {
				setStatus(statusPanel, resolveErrorMessage(error, '智能铜皮生成失败。'), 'error');
			});
	});
	clearButton?.addEventListener('click', () => {
		setStatus(statusPanel, '正在清除预览...', 'neutral');
		app.clearPreview()
			.then((result) => {
				const successStatus = resolveSuccessStatus('clearPreview', result);
				setStatus(statusPanel, successStatus.message, successStatus.tone);
			})
			.catch((error) => {
				setStatus(statusPanel, resolveErrorMessage(error, '清除预览失败。'), 'error');
			});
	});
	windowObject.addEventListener('focus', () => {
		refreshSelection('已同步当前选区。');
	});

	syncModeVisibility(form, daisyOnlyFields);
	setStatus(statusPanel, '正在读取当前选区...', 'neutral');
	refreshSelection('已准备好选择。请调整参数后预览。');
	const selectionSyncTimer = globalThis.setInterval(() => {
		refreshSelectionSilently();
	}, 400);
	windowObject.addEventListener('beforeunload', () => {
		globalThis.clearInterval(selectionSyncTimer);
	});
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	bootstrapIframeApp();
}
