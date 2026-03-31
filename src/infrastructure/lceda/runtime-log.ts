import { SMART_COPPER_POUR_LOG_SCOPE } from '../../application/smart-copper-pour-contract';

const SMART_COPPER_POUR_OUTPUT_PREFIX = '[smart-copper-pour::output]';

const formatLogMessage = (action: string, message: string): string => {
	return `[${SMART_COPPER_POUR_LOG_SCOPE}::${action}] ${message}`;
};

const writeRuntimeLog = (formattedMessage: string): void => {
	try {
		eda.sys_Log?.add?.(formattedMessage);
	} catch {}
};

export const logSmartCopperPourInfo = (action: string, message: string): void => {
	const formattedMessage = formatLogMessage(action, message);
	writeRuntimeLog(formattedMessage);
	console.info(formattedMessage);
};

export const logSmartCopperPourError = (action: string, message: string): void => {
	const formattedMessage = formatLogMessage(action, message);
	writeRuntimeLog(formattedMessage);
	console.error(formattedMessage);
};

export const logSmartCopperPourOutput = (payload: unknown): void => {
	const formattedMessage = `${SMART_COPPER_POUR_OUTPUT_PREFIX} ${serializeOutputPayload(payload)}`;
	writeRuntimeLog(formattedMessage);
	console.info(formattedMessage);
};

const serializeOutputPayload = (payload: unknown): string => {
	try {
		return JSON.stringify(payload);
	} catch {
		return JSON.stringify({ error: 'Failed to serialize smart copper pour output payload.' });
	}
};
