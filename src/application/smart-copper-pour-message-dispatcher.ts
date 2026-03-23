import {
	type SmartCopperPourErrorPayload,
	type SmartCopperPourFailureMessage,
	type SmartCopperPourApplyRequest,
	type SmartCopperPourResponseMessage,
	type SmartCopperPourRequestMessage,
} from './smart-copper-pour-contract';
import type { SmartCopperPourSelectionInspector, SmartCopperPourPreviewGateway } from './smart-copper-pour-controller';

export interface SmartCopperPourMessageDispatcherController
	extends SmartCopperPourSelectionInspector,
		SmartCopperPourPreviewGateway {
	apply(request: SmartCopperPourApplyRequest): Promise<{ applied: boolean }>;
}

export const handleSmartCopperPourMessage = async (
	controller: SmartCopperPourMessageDispatcherController,
	message: SmartCopperPourRequestMessage,
): Promise<SmartCopperPourResponseMessage> => {
	const command = message.command;

	try {
		switch (command) {
			case 'inspectSelection': {
				const payload = await controller.inspectSelection();
				return { ok: true, command, payload };
			}
			case 'preview': {
				const payload = await controller.preview(message.payload);
				return { ok: true, command, payload };
			}
			case 'apply': {
				const payload = await controller.apply(message.payload);
				return { ok: true, command, payload };
			}
			case 'clearPreview': {
				const payload = await controller.clearPreview();
				return { ok: true, command, payload };
			}
			default: {
				return assertNever(command);
			}
		}
	} catch (error) {
		return createFailureMessage(command, toSmartCopperPourErrorPayload(error));
	}
};

const createFailureMessage = (
	command: SmartCopperPourRequestMessage['command'],
	error: SmartCopperPourErrorPayload,
): SmartCopperPourFailureMessage<SmartCopperPourRequestMessage['command']> => {
	switch (command) {
		case 'inspectSelection':
		case 'preview':
		case 'apply':
		case 'clearPreview':
			return { ok: false, command, error };
		default:
			return assertNever(command);
	}
};

const assertNever = (_value: never): never => {
	throw new Error('Unhandled Smart Copper Pour command.');
};

const toSmartCopperPourErrorPayload = (error: unknown): SmartCopperPourErrorPayload => {
	if (isSmartCopperPourErrorPayloadLike(error)) {
		return {
			code: error.code,
			message: error.message,
			details: error.details,
		};
	}

	if (error instanceof Error) {
		return {
			code: 'runtime-error',
			message: error.message,
		};
	}

	return {
		code: 'runtime-error',
		message: String(error),
	};
};

const isSmartCopperPourErrorPayloadLike = (value: unknown): value is SmartCopperPourErrorPayload => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	const error = value as { code?: unknown; message?: unknown; details?: unknown };
	return (
		typeof error.code === 'string' &&
		typeof error.message === 'string' &&
		(error.details === undefined || typeof error.details === 'string')
	);
};
