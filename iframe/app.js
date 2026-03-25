const REQUEST_TOPIC = 'smart-copper-pour/request';
const RESPONSE_TOPIC = 'smart-copper-pour/response';

const createInitialState = () => ({
	latestInspectSequence: 0,
	nextInspectSequence: 1,
	pendingActionCommand: null,
	pendingActionSequence: null,
	daisyManualEditsDirty: false,
	selectionFingerprint: null,
	selectionSummary: null,
});

export const resolveSuccessStatus = (message) => {
	switch (message.command) {
		case 'preview':
			return { message: '预览已更新。', tone: 'success' };
		case 'apply':
			return { message: message.payload?.applied === true ? '铜皮已成功应用。' : '未生成铜皮。', tone: 'success' };
		case 'clearPreview':
			return { message: '预览已清除。', tone: 'success' };
		default:
			return null;
	}
};

export const createIframeApp = ({ form }) => {
	const state = createInitialState();

	const resetDaisyManualEditsDirty = () => {
		state.daisyManualEditsDirty = false;
	};

	const markDaisyManualEditsDirty = () => {
		if (form.topologyMode.value !== 'daisyChain') {
			return;
		}

		state.daisyManualEditsDirty = true;
	};

	const handleTopologyModeChange = () => {
		if (form.topologyMode.value !== 'daisyChain') {
			resetDaisyManualEditsDirty();
		}
	};

	const readResponseSequence = (message) => {
		return Number.isFinite(message.meta?.sequence) ? message.meta.sequence : null;
	};

	const readPendingActionCommand = (message) => {
		if (message?.command !== 'inspectSelection') {
			return null;
		}

		const sequence = readResponseSequence(message);
		if (sequence === null || sequence !== state.pendingActionSequence) {
			return null;
		}

		const pendingActionCommand = state.pendingActionCommand;
		state.pendingActionCommand = null;
		state.pendingActionSequence = null;
		return pendingActionCommand;
	};

	const readFormRequest = () => {
		const request = {
			topologyMode: form.topologyMode.value,
			cornerStyle: form.cornerStyle.value,
			trunkBias: form.trunkBias.value,
			width: Number(form.width.value),
			keepoutMargin: Number(form.keepoutMargin.value),
		};

		if (request.topologyMode === 'daisyChain') {
			return {
				...request,
				trunkMode: 'manual',
				trunkStart: {
					x: Number(form.trunkStartX.value),
					y: Number(form.trunkStartY.value),
				},
				trunkEnd: {
					x: Number(form.trunkEndX.value),
					y: Number(form.trunkEndY.value),
				},
			};
		}

		return request;
	};

	const handleResponse = (message) => {
		if (typeof message !== 'object' || message === null) {
			return false;
		}

		if (message.command !== 'inspectSelection' || message.ok !== true) {
			return false;
		}

		const sequence = readResponseSequence(message);
		if (sequence === null) {
			return false;
		}

		if (sequence < state.latestInspectSequence) {
			return false;
		}

		const nextFingerprint = message.payload?.selectionFingerprint ?? null;
		if (sequence === state.latestInspectSequence && nextFingerprint !== null && nextFingerprint === state.selectionFingerprint) {
			return false;
		}

		if (nextFingerprint !== state.selectionFingerprint) {
			resetDaisyManualEditsDirty();
		}

		state.latestInspectSequence = sequence;
		state.selectionSummary = message.payload;
		state.selectionFingerprint = nextFingerprint;
		return true;
	};

	const getState = () => ({
		...state,
	});

	const createInspectSelectionRequest = () => {
		const sequence = state.nextInspectSequence;
		state.nextInspectSequence += 1;
		return {
			command: 'inspectSelection',
			meta: {
				sequence,
			},
		};
	};

	const createForcedInspectSelectionRequest = (command) => {
		const request = createInspectSelectionRequest();
		state.pendingActionCommand = command;
		state.pendingActionSequence = request.meta.sequence;
		return request;
	};

	return {
		createForcedInspectSelectionRequest,
		createInspectSelectionRequest,
		getState,
		handleResponse,
		handleTopologyModeChange,
		markDaisyManualEditsDirty,
		readPendingActionCommand,
		readFormRequest,
		resetDaisyManualEditsDirty,
	};
};

const getMessageBus = (windowObject) => windowObject.parent?.eda?.sys_MessageBus ?? windowObject.eda?.sys_MessageBus;

const syncModeVisibility = (form, daisyOnlyFields) => {
	const isDaisyChainMode = form.topologyMode.value === 'daisyChain';
	daisyOnlyFields.forEach((element) => {
		element.hidden = !isDaisyChainMode;
	});
};

const updateSelectionSummary = (state, selectionNet, selectionLayer, selectionPadCount) => {
	selectionNet.textContent = state.selectionSummary?.netName ?? 'Unknown';
	selectionLayer.textContent = state.selectionSummary?.layerName ?? 'Unknown';
	selectionPadCount.textContent = String(state.selectionSummary?.connectionCount ?? 0);
};

export const bootstrapIframeApp = (options = {}) => {
	const documentObject = options.documentObject ?? document;
	const windowObject = options.windowObject ?? window;
	const form = documentObject.getElementById('smart-copper-pour-form');
	if (form === null) {
		return;
	}

	const messageBus = getMessageBus(windowObject);
	const previewButton = documentObject.getElementById('preview-button');
	const applyButton = documentObject.getElementById('apply-button');
	const clearButton = documentObject.getElementById('clear-button');
	const statusPanel = documentObject.getElementById('status-panel');
	const selectionNet = documentObject.getElementById('selection-net');
	const selectionLayer = documentObject.getElementById('selection-layer');
	const selectionPadCount = documentObject.getElementById('selection-pad-count');
	const daisyOnlyFields = documentObject.querySelectorAll('[data-daisy-only]');
	const app = createIframeApp({ form });

	const setStatus = (message, tone = 'neutral') => {
		statusPanel.hidden = false;
		statusPanel.textContent = message;
		statusPanel.dataset.tone = tone;
	};

	const publishRequest = (message) => {
		if (!messageBus) {
			setStatus('当前 iframe 中无法访问 LCEDA 消息总线。', 'error');
			return false;
		}

		messageBus.publish(REQUEST_TOPIC, message);
		return true;
	};

	const publishPreviewOrApply = (command) => {
		publishRequest({ command, payload: app.readFormRequest() });
	};

	const handlePreview = () => {
		setStatus('正在生成预览...', 'neutral');
		publishRequest(app.createForcedInspectSelectionRequest('preview'));
	};

	const handleApply = () => {
		setStatus('正在应用铜皮...', 'neutral');
		publishRequest(app.createForcedInspectSelectionRequest('apply'));
	};

	const handleClear = () => {
		setStatus('正在清除预览...', 'neutral');
		publishRequest({ command: 'clearPreview' });
	};

	const responseTask = messageBus?.subscribe(RESPONSE_TOPIC, (message) => {
		const pendingActionCommand = app.readPendingActionCommand(message);
		if (app.handleResponse(message)) {
			updateSelectionSummary(app.getState(), selectionNet, selectionLayer, selectionPadCount);
			if (pendingActionCommand !== null) {
				publishPreviewOrApply(pendingActionCommand);
				return;
			}

			setStatus('已准备好选择。请调整参数后预览。', 'success');
			return;
		}

		if (typeof message !== 'object' || message === null || !('command' in message) || !('ok' in message)) {
			return;
		}

		if (message.ok === false) {
			setStatus(message.error?.message ?? '智能铜皮生成失败。', 'error');
			return;
		}

		const successStatus = resolveSuccessStatus(message);
		if (successStatus !== null) {
			setStatus(successStatus.message, successStatus.tone);
		}
	});

	previewButton?.addEventListener('click', handlePreview);
	applyButton?.addEventListener('click', handleApply);
	clearButton?.addEventListener('click', handleClear);
	form.topologyMode.addEventListener('change', () => {
		app.handleTopologyModeChange();
		syncModeVisibility(form, daisyOnlyFields);
	});
	form.trunkStartX?.addEventListener('change', app.markDaisyManualEditsDirty);
	form.trunkStartY?.addEventListener('change', app.markDaisyManualEditsDirty);
	form.trunkEndX?.addEventListener('change', app.markDaisyManualEditsDirty);
	form.trunkEndY?.addEventListener('change', app.markDaisyManualEditsDirty);
	windowObject.addEventListener('focus', () => {
		publishRequest(app.createInspectSelectionRequest());
	});
	windowObject.addEventListener('beforeunload', () => {
		responseTask?.cancel?.();
	});

	syncModeVisibility(form, daisyOnlyFields);
	setStatus('等待选择摘要。');
	publishRequest(app.createInspectSelectionRequest());
};

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	bootstrapIframeApp();
}
