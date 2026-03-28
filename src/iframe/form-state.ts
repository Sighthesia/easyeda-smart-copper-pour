import type { SmartCopperPourApplyRequest, SmartCopperPourTreeLikeRequest } from '../application/smart-copper-pour-contract';
import { TopologyMode } from '../domain/topology-mode';

export interface SmartCopperPourFormElement extends HTMLFormElement {
	topologyMode: HTMLSelectElement;
	cornerStyle: HTMLSelectElement;
	trunkBias: HTMLSelectElement;
	width: HTMLInputElement;
	keepoutMargin: HTMLInputElement;
	trunkStartX: HTMLInputElement;
	trunkStartY: HTMLInputElement;
	trunkEndX: HTMLInputElement;
	trunkEndY: HTMLInputElement;
}

export interface SmartCopperPourStoredFormState {
	topologyMode: string;
	cornerStyle: string;
	trunkBias: string;
	width: string;
	keepoutMargin: string;
	trunkStartX: string;
	trunkStartY: string;
	trunkEndX: string;
	trunkEndY: string;
}

type SmartCopperPourStorage = Pick<Storage, 'getItem' | 'setItem'>;

type SmartCopperPourRequestReadResult = { ok: true; request: SmartCopperPourApplyRequest } | { ok: false; errorMessage: string };

const STORAGE_KEY = 'smart-copper-pour:form';

export const DEFAULT_SMART_COPPER_POUR_FORM_STATE: SmartCopperPourStoredFormState = {
	topologyMode: 'tree',
	cornerStyle: 'bevel',
	trunkBias: 'neutral',
	width: '1',
	keepoutMargin: '0',
	trunkStartX: '0',
	trunkStartY: '0',
	trunkEndX: '10',
	trunkEndY: '0',
};

export const isDaisyChainMode = (topologyMode: string): boolean => topologyMode === 'daisyChain';

export const applyStoredFormState = (form: SmartCopperPourFormElement, state: SmartCopperPourStoredFormState): void => {
	form.topologyMode.value = state.topologyMode;
	form.cornerStyle.value = state.cornerStyle;
	form.trunkBias.value = state.trunkBias;
	form.width.value = state.width;
	form.keepoutMargin.value = state.keepoutMargin;
	form.trunkStartX.value = state.trunkStartX;
	form.trunkStartY.value = state.trunkStartY;
	form.trunkEndX.value = state.trunkEndX;
	form.trunkEndY.value = state.trunkEndY;
};

export const loadStoredFormState = (storage?: SmartCopperPourStorage): SmartCopperPourStoredFormState | null => {
	const rawValue = storage?.getItem(STORAGE_KEY);
	if (rawValue === null || rawValue === undefined) {
		return null;
	}

	try {
		const parsed = JSON.parse(rawValue) as Partial<SmartCopperPourStoredFormState>;
		return {
			topologyMode: typeof parsed.topologyMode === 'string' ? parsed.topologyMode : DEFAULT_SMART_COPPER_POUR_FORM_STATE.topologyMode,
			cornerStyle: typeof parsed.cornerStyle === 'string' ? parsed.cornerStyle : DEFAULT_SMART_COPPER_POUR_FORM_STATE.cornerStyle,
			trunkBias: typeof parsed.trunkBias === 'string' ? parsed.trunkBias : DEFAULT_SMART_COPPER_POUR_FORM_STATE.trunkBias,
			width: typeof parsed.width === 'string' ? parsed.width : DEFAULT_SMART_COPPER_POUR_FORM_STATE.width,
			keepoutMargin: typeof parsed.keepoutMargin === 'string' ? parsed.keepoutMargin : DEFAULT_SMART_COPPER_POUR_FORM_STATE.keepoutMargin,
			trunkStartX: typeof parsed.trunkStartX === 'string' ? parsed.trunkStartX : DEFAULT_SMART_COPPER_POUR_FORM_STATE.trunkStartX,
			trunkStartY: typeof parsed.trunkStartY === 'string' ? parsed.trunkStartY : DEFAULT_SMART_COPPER_POUR_FORM_STATE.trunkStartY,
			trunkEndX: typeof parsed.trunkEndX === 'string' ? parsed.trunkEndX : DEFAULT_SMART_COPPER_POUR_FORM_STATE.trunkEndX,
			trunkEndY: typeof parsed.trunkEndY === 'string' ? parsed.trunkEndY : DEFAULT_SMART_COPPER_POUR_FORM_STATE.trunkEndY,
		};
	} catch {
		return null;
	}
};

export const persistFormState = (form: SmartCopperPourFormElement, storage?: SmartCopperPourStorage): void => {
	storage?.setItem(
		STORAGE_KEY,
		JSON.stringify({
			topologyMode: form.topologyMode.value,
			cornerStyle: form.cornerStyle.value,
			trunkBias: form.trunkBias.value,
			width: form.width.value,
			keepoutMargin: form.keepoutMargin.value,
			trunkStartX: form.trunkStartX.value,
			trunkStartY: form.trunkStartY.value,
			trunkEndX: form.trunkEndX.value,
			trunkEndY: form.trunkEndY.value,
		} satisfies SmartCopperPourStoredFormState),
	);
};

export const readSmartCopperPourRequest = (form: SmartCopperPourFormElement): SmartCopperPourRequestReadResult => {
	const topologyMode = form.topologyMode.value;
	if (topologyMode !== TopologyMode.Tree && topologyMode !== TopologyMode.Star && topologyMode !== TopologyMode.DaisyChain) {
		return { ok: false, errorMessage: '不支持的拓扑模式。' };
	}

	const width = Number(form.width.value);
	if (!Number.isFinite(width) || width <= 0) {
		return { ok: false, errorMessage: '宽度必须大于 0。' };
	}

	const keepoutMargin = Number(form.keepoutMargin.value);
	if (!Number.isFinite(keepoutMargin) || keepoutMargin < 0) {
		return { ok: false, errorMessage: '避让边距必须大于等于 0。' };
	}

	const cornerStyle = form.cornerStyle.value;
	if (cornerStyle !== 'round' && cornerStyle !== 'miter' && cornerStyle !== 'bevel') {
		return { ok: false, errorMessage: '不支持的拐角样式。' };
	}

	const trunkBias = form.trunkBias.value;
	if (trunkBias !== 'neutral' && trunkBias !== 'horizontal' && trunkBias !== 'vertical') {
		return { ok: false, errorMessage: '不支持的主干偏置。' };
	}

	const requestBase = {
		cornerStyle,
		trunkBias,
		width,
		keepoutMargin,
	} as const;

	if (topologyMode === TopologyMode.Tree || topologyMode === TopologyMode.Star) {
		const request: SmartCopperPourTreeLikeRequest = {
			...requestBase,
			topologyMode,
		};

		return {
			ok: true,
			request,
		};
	}

	const trunkStart = {
		x: Number(form.trunkStartX.value),
		y: Number(form.trunkStartY.value),
	};
	const trunkEnd = {
		x: Number(form.trunkEndX.value),
		y: Number(form.trunkEndY.value),
	};
	if (!Number.isFinite(trunkStart.x) || !Number.isFinite(trunkStart.y) || !Number.isFinite(trunkEnd.x) || !Number.isFinite(trunkEnd.y)) {
		return { ok: false, errorMessage: '菊链模式需要有效的主干坐标。' };
	}

	return {
		ok: true,
		request: {
			...requestBase,
			topologyMode: TopologyMode.DaisyChain,
			trunkMode: 'manual',
			trunkStart,
			trunkEnd,
		},
	};
};
