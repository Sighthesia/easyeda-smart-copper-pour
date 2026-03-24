/**
 * 入口文件
 *
 * 本文件为默认扩展入口文件，如果你想要配置其它文件作为入口文件，
 * 请修改 `extension.json` 中的 `entry` 字段；
 *
 * 请在此处使用 `export`  导出所有你希望在 `headerMenus` 中引用的方法，
 * 方法通过方法名与 `headerMenus` 关联。
 *
 * 如需了解更多开发细节，请阅读：
 * https://prodocs.lceda.cn/cn/api/guide/
 */
import * as extensionConfig from '../extension.json';
import { SMART_COPPER_POUR_IFRAME_ID } from './application/smart-copper-pour-contract';
import {
	SmartCopperPourController,
	type SmartCopperPourControllerDependencies,
	createSmartCopperPourControllerDependencies,
} from './application/smart-copper-pour-controller';
import { type SmartCopperPourMessageBusBridge, registerSmartCopperPourMessageBusBridge } from './infrastructure/lceda/message-bus-bridge';
import { createLcedaPourWriter } from './infrastructure/lceda/pour-writer';
import { createRuntimeCopperPlanBuilder } from './infrastructure/lceda/runtime-copper-plan-builder';
import { createRuntimeLcedaPourObjectStore } from './infrastructure/lceda/runtime-pour-object-store';
import { createLcedaSelectedPrimitivesReader, createSmartCopperPourSelectionInspector } from './infrastructure/lceda/selection-inspector';

let smartCopperPourMessageBridge: SmartCopperPourMessageBusBridge | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {}

export function about(): void {
	eda.sys_Dialog.showInformationMessage(`${extensionConfig.displayName} v${extensionConfig.version}`, eda.sys_I18n.text('About'));
}

/**
 * Opens the Smart Copper Pour iframe and wires message handlers.
 *
 * @public
 */
export function openSmartCopperPour(): void {
	const controller = new SmartCopperPourController(createRuntimeSmartCopperPourControllerDependencies());
	disposeSmartCopperPourMessageBridge();
	smartCopperPourMessageBridge = registerSmartCopperPourMessageBusBridge(controller);
	// eslint-disable-next-line no-void
	void eda.sys_IFrame.openIFrame('/iframe/index.html', 420, 560, SMART_COPPER_POUR_IFRAME_ID, {
		buttonCallbackFn: () => {
			disposeSmartCopperPourMessageBridge();
		},
		grayscaleMask: true,
	});
}
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
const disposeSmartCopperPourMessageBridge = (): void => {
	smartCopperPourMessageBridge?.dispose();
	smartCopperPourMessageBridge = undefined;
};
