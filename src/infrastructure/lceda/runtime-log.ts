import { SMART_COPPER_POUR_LOG_SCOPE } from '../../application/smart-copper-pour-contract';

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
