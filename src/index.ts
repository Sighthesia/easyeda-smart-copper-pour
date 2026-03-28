import * as extensionConfig from '../extension.json';
import { openSmartCopperPourPanel } from './infrastructure/lceda/open-smart-copper-pour-panel';

export function activate(status?: 'onStartupFinished', arg?: string): void {
	if (status === undefined && arg === undefined) {
		return;
	}
}

export function about(): void {
	eda.sys_Dialog.showInformationMessage(`${extensionConfig.displayName} v${extensionConfig.version}`, eda.sys_I18n.text('About'));
}

/**
 * Opens the Smart Copper Pour iframe panel.
 *
 * @public
 */
export async function openSmartCopperPour(): Promise<void> {
	await openSmartCopperPourPanel();
}
