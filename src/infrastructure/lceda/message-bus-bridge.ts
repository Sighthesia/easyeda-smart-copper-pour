import {
	SMART_COPPER_POUR_RESPONSE_TOPIC,
	SMART_COPPER_POUR_REQUEST_TOPIC,
	isSmartCopperPourRequestMessage,
	type SmartCopperPourApplyRequest,
	type SmartCopperPourApplyResult,
	type SmartCopperPourClearPreviewResult,
	type SmartCopperPourPreviewRequest,
	type SmartCopperPourPreviewResult,
	type SmartCopperPourSelectionSummary,
} from '../../application/smart-copper-pour-contract';
import { handleSmartCopperPourMessage, type SmartCopperPourMessageDispatcherController } from '../../application/smart-copper-pour-message-dispatcher';

/**
 * Minimal message bus contract used by the iframe bridge.
 *
 * @public
 */
export interface SmartCopperPourMessageBus {
	publish(topic: string, message: unknown): void;
	subscribe(topic: string, handler: (message: unknown) => void): ISYS_MessageBusTask;
}

/**
 * Public controller shape required by the bridge.
 *
 * @public
 */
export interface SmartCopperPourMessageBridgeController extends SmartCopperPourMessageDispatcherController {
	inspectSelection(): Promise<SmartCopperPourSelectionSummary>;
	preview(request: SmartCopperPourPreviewRequest): Promise<SmartCopperPourPreviewResult>;
	apply(request: SmartCopperPourApplyRequest): Promise<SmartCopperPourApplyResult>;
	clearPreview(): Promise<SmartCopperPourClearPreviewResult>;
}

/**
 * Active message bus bridge instance.
 *
 * @public
 */
export interface SmartCopperPourMessageBusBridge {
	dispose(): void;
}

/**
 * Registers the iframe request/response bridge on the LCEDA message bus.
 *
 * @param controller
 * - Application controller receiving iframe commands.
 *
 * @param messageBus
 * - LCEDA message bus implementation.
 *
 * @returns
 * - Disposable bridge handle.
 *
 * @public
 */
export const registerSmartCopperPourMessageBusBridge = (
	controller: SmartCopperPourMessageBridgeController,
	messageBus: SmartCopperPourMessageBus = eda.sys_MessageBus,
): SmartCopperPourMessageBusBridge => {
	const task = messageBus.subscribe(SMART_COPPER_POUR_REQUEST_TOPIC, (message: unknown) => {
		if (!isSmartCopperPourRequestMessage(message)) {
			return;
		}

		const requestMessage = message;

		void handleSmartCopperPourMessage(controller, requestMessage).then((responseMessage) => {
			messageBus.publish(SMART_COPPER_POUR_RESPONSE_TOPIC, responseMessage);
		});
	});

	return {
		dispose: () => {
			task.cancel();
		},
	};
};
