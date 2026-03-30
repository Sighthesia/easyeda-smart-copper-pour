import { beforeEach, describe, expect, test, vi } from 'vitest';

const hideIFrame = vi.fn();
const openIFrame = vi.fn();
const showIFrame = vi.fn();

vi.stubGlobal('eda', {
	sys_IFrame: {
		hideIFrame,
		openIFrame,
		showIFrame,
	},
});

describe('openSmartCopperPourPanel', () => {
	beforeEach(() => {
		hideIFrame.mockReset();
		openIFrame.mockReset();
		showIFrame.mockReset();
	});

	test('reuses the existing iframe when it is already open', async () => {
		showIFrame.mockResolvedValue(true);

		const { openSmartCopperPourPanel } = await import('../../../src/infrastructure/lceda/open-smart-copper-pour-panel');
		await openSmartCopperPourPanel();

		expect(showIFrame).toHaveBeenCalledWith('smart-copper-pour');
		expect(openIFrame).not.toHaveBeenCalled();
	});

	test('opens a new iframe with the stable panel id when none exists', async () => {
		showIFrame.mockResolvedValue(false);

		const { openSmartCopperPourPanel } = await import('../../../src/infrastructure/lceda/open-smart-copper-pour-panel');
		await openSmartCopperPourPanel();

		expect(openIFrame).toHaveBeenCalledWith('/iframe/index.html', 480, 700, 'smart-copper-pour', {
			buttonCallbackFn: expect.any(Function),
			grayscaleMask: true,
			maximizeButton: true,
			minimizeButton: true,
			onBeforeCloseCallFn: expect.any(Function),
			title: '智能铜皮生成',
		});
	});

	test('intercepts close and hides the existing iframe instead of destroying it', async () => {
		showIFrame.mockResolvedValue(false);
		hideIFrame.mockResolvedValue(true);

		const { openSmartCopperPourPanel } = await import('../../../src/infrastructure/lceda/open-smart-copper-pour-panel');
		await openSmartCopperPourPanel();

		const iframeProps = openIFrame.mock.calls[0]?.[4];
		await iframeProps.buttonCallbackFn('close');
		const shouldClose = await iframeProps.onBeforeCloseCallFn();

		expect(hideIFrame).toHaveBeenCalledWith('smart-copper-pour');
		expect(shouldClose).toBe(false);
	});
});
