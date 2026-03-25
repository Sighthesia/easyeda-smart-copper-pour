import {
	type SmartCopperPourErrorPayload,
	type SmartCopperPourFailureMessage,
	type SmartCopperPourApplyRequest,
	type SmartCopperPourMessageMeta,
	type SmartCopperPourResponseMessage,
	type SmartCopperPourRequestMessage,
	type SmartCopperPourSelectionSummary,
} from './smart-copper-pour-contract';
import type { SmartCopperPourPreviewGateway } from './smart-copper-pour-controller';

export interface SmartCopperPourMessageDispatcherController
	extends SmartCopperPourPreviewGateway {
	inspectSelection(): Promise<SmartCopperPourSelectionSummary>;
	apply(request: SmartCopperPourApplyRequest): Promise<{ applied: boolean }>;
}

export const handleSmartCopperPourMessage = async (
	controller: SmartCopperPourMessageDispatcherController,
	message: SmartCopperPourRequestMessage,
): Promise<SmartCopperPourResponseMessage> => {
	const command = message.command;
	const responseMeta = cloneResponseMeta(message.meta);

	try {
			switch (command) {
				case 'inspectSelection': {
					const payload = await controller.inspectSelection();
					return { ok: true, command, payload, ...responseMeta };
				}
			case 'preview': {
				const payload = await controller.preview(message.payload);
				return { ok: true, command, payload, ...responseMeta };
			}
			case 'apply': {
				const payload = await controller.apply(message.payload);
				return { ok: true, command, payload, ...responseMeta };
			}
			case 'clearPreview': {
				const payload = await controller.clearPreview();
				return { ok: true, command, payload, ...responseMeta };
			}
			default: {
				return assertNever(command);
			}
		}
	} catch (error) {
		return createFailureMessage(command, toSmartCopperPourErrorPayload(error), message.meta);
	}
};

const createFailureMessage = (
	command: SmartCopperPourRequestMessage['command'],
	error: SmartCopperPourErrorPayload,
	meta?: SmartCopperPourMessageMeta,
): SmartCopperPourFailureMessage<SmartCopperPourRequestMessage['command']> => {
	const responseMeta = cloneResponseMeta(meta);

	switch (command) {
		case 'inspectSelection':
		case 'preview':
		case 'apply':
		case 'clearPreview':
			return { ok: false, command, error, ...responseMeta };
		default:
			return assertNever(command);
	}
};

const assertNever = (_value: never): never => {
	throw new Error('Unhandled Smart Copper Pour command.');
};

const toSmartCopperPourErrorPayload = (error: unknown): SmartCopperPourErrorPayload => {
	if (isSmartCopperPourErrorPayloadLike(error)) {
		const payload: SmartCopperPourErrorPayload = {
			code: error.code,
			message: error.message,
		};

		if (error.details !== undefined) {
			payload.details = error.details;
		}

		return payload;
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

const cloneResponseMeta = (meta?: SmartCopperPourMessageMeta): { meta?: SmartCopperPourMessageMeta } => {
	if (meta?.sequence === undefined) {
		return {};
	}

	return {
		meta: {
			sequence: meta.sequence,
		},
	};
};
