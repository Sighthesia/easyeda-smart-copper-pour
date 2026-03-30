import type {
	SmartCopperPourApplyRequest,
	SmartCopperPourDaisyChainRequest,
	SmartCopperPourTreeLikeRequest,
} from '../application/smart-copper-pour-contract';
import { TopologyMode } from '../domain/topology-mode';

export interface SmartCopperPourFormElement extends HTMLFormElement {
	topologyMode: HTMLSelectElement;
	starAreaShape: HTMLSelectElement;
	cornerStyle: HTMLSelectElement;
	width: HTMLInputElement;
	keepoutMargin: HTMLInputElement;
	useNodeSizeAsBaseWidth: HTMLInputElement;
	orthogonalRouting: HTMLInputElement;
}

export interface SmartCopperPourStoredFormState {
	topologyMode: string;
	starAreaShape: string;
	cornerStyle: string;
	width: string;
	keepoutMargin: string;
	useNodeSizeAsBaseWidth: boolean;
	orthogonalRouting: boolean;
}

type SmartCopperPourStorage = Pick<Storage, 'getItem' | 'setItem'>;

type SmartCopperPourRequestReadResult = { ok: true; request: SmartCopperPourApplyRequest } | { ok: false; errorMessage: string };

const STORAGE_KEY = 'smart-copper-pour:form';

export const DEFAULT_SMART_COPPER_POUR_FORM_STATE: SmartCopperPourStoredFormState = {
	topologyMode: 'daisyChain',
	starAreaShape: 'convexHull',
	cornerStyle: 'bevel45',
	width: '1',
	keepoutMargin: '0',
	useNodeSizeAsBaseWidth: true,
	orthogonalRouting: true,
};

export const isStarMode = (topologyMode: string): boolean => topologyMode === TopologyMode.Star;

export const applyStoredFormState = (form: SmartCopperPourFormElement, state: SmartCopperPourStoredFormState): void => {
	form.topologyMode.value = state.topologyMode;
	form.starAreaShape.value = state.starAreaShape;
	form.cornerStyle.value = state.cornerStyle;
	form.width.value = state.width;
	form.keepoutMargin.value = state.keepoutMargin;
	form.useNodeSizeAsBaseWidth.checked = state.useNodeSizeAsBaseWidth;
	form.orthogonalRouting.checked = state.orthogonalRouting;
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
			starAreaShape: typeof parsed.starAreaShape === 'string' ? parsed.starAreaShape : DEFAULT_SMART_COPPER_POUR_FORM_STATE.starAreaShape,
			cornerStyle: typeof parsed.cornerStyle === 'string' ? parsed.cornerStyle : DEFAULT_SMART_COPPER_POUR_FORM_STATE.cornerStyle,
			width: typeof parsed.width === 'string' ? parsed.width : DEFAULT_SMART_COPPER_POUR_FORM_STATE.width,
			keepoutMargin: typeof parsed.keepoutMargin === 'string' ? parsed.keepoutMargin : DEFAULT_SMART_COPPER_POUR_FORM_STATE.keepoutMargin,
			useNodeSizeAsBaseWidth:
				typeof parsed.useNodeSizeAsBaseWidth === 'boolean'
					? parsed.useNodeSizeAsBaseWidth
					: DEFAULT_SMART_COPPER_POUR_FORM_STATE.useNodeSizeAsBaseWidth,
			orthogonalRouting:
				typeof parsed.orthogonalRouting === 'boolean' ? parsed.orthogonalRouting : DEFAULT_SMART_COPPER_POUR_FORM_STATE.orthogonalRouting,
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
			starAreaShape: form.starAreaShape.value,
			cornerStyle: form.cornerStyle.value,
			width: form.width.value,
			keepoutMargin: form.keepoutMargin.value,
			useNodeSizeAsBaseWidth: form.useNodeSizeAsBaseWidth.checked,
			orthogonalRouting: form.orthogonalRouting.checked,
		} satisfies SmartCopperPourStoredFormState),
	);
};

export const readSmartCopperPourRequest = (form: SmartCopperPourFormElement): SmartCopperPourRequestReadResult => {
	const topologyMode = form.topologyMode.value;
	if (topologyMode !== TopologyMode.Tree && topologyMode !== TopologyMode.Star && topologyMode !== TopologyMode.DaisyChain) {
		return { ok: false, errorMessage: '不支持的拓扑模式。' };
	}

	const width = Number(form.width.value);
	if (!Number.isFinite(width) || width < 0) {
		return { ok: false, errorMessage: '附加宽度必须大于等于 0。' };
	}

	const keepoutMargin = Number(form.keepoutMargin.value);
	if (!Number.isFinite(keepoutMargin) || keepoutMargin < 0) {
		return { ok: false, errorMessage: '避让边距必须大于等于 0。' };
	}

	const cornerStyle = form.cornerStyle.value;
	if (cornerStyle !== 'round' && cornerStyle !== 'rightAngle' && cornerStyle !== 'bevel45') {
		return { ok: false, errorMessage: '不支持的拐角样式。' };
	}

	const starAreaShape = form.starAreaShape.value;
	if (starAreaShape !== 'boundingBox' && starAreaShape !== 'convexHull') {
		return { ok: false, errorMessage: '不支持的星形区域形状。' };
	}

	const requestBase = {
		cornerStyle,
		keepoutMargin,
		orthogonalRouting: form.orthogonalRouting.checked,
		useNodeSizeAsBaseWidth: form.useNodeSizeAsBaseWidth.checked,
		width,
	} as const;

	if (topologyMode === TopologyMode.Tree || topologyMode === TopologyMode.Star) {
		const request: SmartCopperPourTreeLikeRequest = {
			...requestBase,
			topologyMode,
			...(topologyMode === TopologyMode.Star ? { starAreaShape } : {}),
		};

		return {
			ok: true,
			request,
		};
	}

	const request: SmartCopperPourDaisyChainRequest = {
		...requestBase,
		topologyMode: TopologyMode.DaisyChain,
	};

	return {
		ok: true,
		request,
	};
};
