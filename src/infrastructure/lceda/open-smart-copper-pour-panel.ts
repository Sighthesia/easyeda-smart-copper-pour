import { SMART_COPPER_POUR_IFRAME_ID } from '../../application/smart-copper-pour-contract';

const SMART_COPPER_POUR_PANEL_HEIGHT = 700;
const SMART_COPPER_POUR_PANEL_WIDTH = 480;

type SmartCopperPourIFrameProps = NonNullable<Parameters<typeof eda.sys_IFrame.openIFrame>[4]> & {
	onBeforeCloseCallFn?: () => boolean | Promise<boolean>;
	title?: string;
};

export const openSmartCopperPourPanel = async (): Promise<void> => {
	const shown = await eda.sys_IFrame.showIFrame(SMART_COPPER_POUR_IFRAME_ID);
	if (shown) {
		return;
	}

	const iframeProps: SmartCopperPourIFrameProps = {
		buttonCallbackFn: async (button) => {
			if (button === 'close') {
				await eda.sys_IFrame.hideIFrame(SMART_COPPER_POUR_IFRAME_ID);
			}
		},
		maximizeButton: true,
		minimizeButton: true,
		onBeforeCloseCallFn: async () => {
			await eda.sys_IFrame.hideIFrame(SMART_COPPER_POUR_IFRAME_ID);
			return false;
		},
		grayscaleMask: true,
		title: '智能铜皮生成',
	};

	await eda.sys_IFrame.openIFrame(
		'/iframe/index.html',
		SMART_COPPER_POUR_PANEL_WIDTH,
		SMART_COPPER_POUR_PANEL_HEIGHT,
		SMART_COPPER_POUR_IFRAME_ID,
		iframeProps as Parameters<typeof eda.sys_IFrame.openIFrame>[4],
	);
};
