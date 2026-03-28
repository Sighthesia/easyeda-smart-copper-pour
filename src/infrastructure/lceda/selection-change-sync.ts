import { SMART_COPPER_POUR_EVENT_TOPIC, type SmartCopperPourEventMessage } from '../../application/smart-copper-pour-contract';
import type { SmartCopperPourMessageBus } from './message-bus-bridge';
import { logSmartCopperPourError, logSmartCopperPourInfo } from './runtime-log';

export interface SmartCopperPourSelectionChangeSync {
	dispose: () => void;
}

interface LcedaSelectedPrimitiveIdsReader {
	getAllSelectedPrimitives_PrimitiveId?: () => Promise<unknown>;
	getAllSelectedPrimitives?: () => Promise<unknown>;
}

interface LcedaPcbEventBridge {
	addMouseEventListener?: (id: string, eventType: 'all' | string, callback: (...args: unknown[]) => void, onlyOnce?: boolean) => void;
	addPrimitiveEventListener?: (id: string, eventType: 'all' | string, callback: (...args: unknown[]) => void, onlyOnce?: boolean) => void;
	removeEventListener?: (id: string) => boolean;
	isEventListenerAlreadyExist?: (id: string) => boolean;
}

const DEFAULT_SELECTION_SYNC_INTERVAL_MS = 250;
const DEFAULT_SELECTION_SYNC_DEBOUNCE_MS = 60;
const SMART_COPPER_POUR_MOUSE_EVENT_LISTENER_ID = 'smart-copper-pour-selection-mouse';
const SMART_COPPER_POUR_PRIMITIVE_EVENT_LISTENER_ID = 'smart-copper-pour-selection-primitive';

export const registerSmartCopperPourSelectionChangeSync = (
	messageBus: SmartCopperPourMessageBus = eda.sys_MessageBus,
	selectedPrimitiveIdsReader: LcedaSelectedPrimitiveIdsReader | undefined = resolveSelectedPrimitiveIdsReader(),
	pollIntervalMs = DEFAULT_SELECTION_SYNC_INTERVAL_MS,
	pcbEventBridge: LcedaPcbEventBridge | undefined = resolvePcbEventBridge(),
): SmartCopperPourSelectionChangeSync => {
	let disposed = false;
	let inFlight = false;
	let selectionFingerprint: string | null = null;
	let lastReadError: string | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const publishSelectionChanged = (): void => {
		const message: SmartCopperPourEventMessage = { type: 'selectionChanged' };
		messageBus.publish(SMART_COPPER_POUR_EVENT_TOPIC, message);
		logSmartCopperPourInfo('selectionChanged', 'Published selection change event to iframe.');
	};

	const syncSelection = async (): Promise<void> => {
		if (disposed || inFlight) {
			return;
		}

		inFlight = true;
		try {
			const nextFingerprint = await readSelectedPrimitiveIdsFingerprint(selectedPrimitiveIdsReader);
			lastReadError = null;
			if (selectionFingerprint === null) {
				selectionFingerprint = nextFingerprint;
				return;
			}

			if (nextFingerprint !== selectionFingerprint) {
				selectionFingerprint = nextFingerprint;
				publishSelectionChanged();
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			if (errorMessage !== lastReadError) {
				lastReadError = errorMessage;
				logSmartCopperPourError('selectionSync', errorMessage);
			}
		} finally {
			inFlight = false;
		}
	};

	const scheduleSyncSelection = (): void => {
		if (disposed) {
			return;
		}

		if (debounceTimer !== undefined) {
			clearTimeout(debounceTimer);
		}

		debounceTimer = setTimeout(() => {
			debounceTimer = undefined;
			syncSelection();
		}, DEFAULT_SELECTION_SYNC_DEBOUNCE_MS);
	};

	registerSelectionEventListeners(pcbEventBridge, scheduleSyncSelection);

	logSmartCopperPourInfo('selectionSync', `Started selection sync polling (${pollIntervalMs}ms).`);
	syncSelection();
	const timer = setInterval(() => {
		syncSelection();
	}, pollIntervalMs);

	return {
		dispose: () => {
			if (disposed) {
				return;
			}

			disposed = true;
			if (debounceTimer !== undefined) {
				clearTimeout(debounceTimer);
				debounceTimer = undefined;
			}
			clearInterval(timer);
			unregisterSelectionEventListeners(pcbEventBridge);
			logSmartCopperPourInfo('selectionSync', 'Stopped selection sync polling.');
		},
	};
};

const registerSelectionEventListeners = (pcbEventBridge: LcedaPcbEventBridge | undefined, onSelectionActivity: () => void): void => {
	if (pcbEventBridge === undefined) {
		logSmartCopperPourInfo('selectionSync', 'PCB event bridge unavailable; using polling only.');
		return;
	}

	registerSelectionEventListener(
		pcbEventBridge,
		SMART_COPPER_POUR_MOUSE_EVENT_LISTENER_ID,
		(eventBridge, listenerId, callback) => eventBridge.addMouseEventListener?.(listenerId, 'all', callback),
		onSelectionActivity,
		'mouse',
	);
	registerSelectionEventListener(
		pcbEventBridge,
		SMART_COPPER_POUR_PRIMITIVE_EVENT_LISTENER_ID,
		(eventBridge, listenerId, callback) => eventBridge.addPrimitiveEventListener?.(listenerId, 'all', callback),
		onSelectionActivity,
		'primitive',
	);
};

const registerSelectionEventListener = (
	pcbEventBridge: LcedaPcbEventBridge,
	listenerId: string,
	register: (pcbEventBridge: LcedaPcbEventBridge, listenerId: string, callback: (...args: unknown[]) => void) => void,
	onSelectionActivity: () => void,
	channel: string,
): void => {
	try {
		if (pcbEventBridge.isEventListenerAlreadyExist?.(listenerId)) {
			pcbEventBridge.removeEventListener?.(listenerId);
		}

		register(pcbEventBridge, listenerId, onSelectionActivity);
		logSmartCopperPourInfo('selectionSync', `Registered ${channel} selection listener.`);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		logSmartCopperPourError('selectionSync', `Failed to register ${channel} selection listener: ${errorMessage}`);
	}
};

const unregisterSelectionEventListeners = (pcbEventBridge: LcedaPcbEventBridge | undefined): void => {
	if (pcbEventBridge === undefined) {
		return;
	}

	pcbEventBridge.removeEventListener?.(SMART_COPPER_POUR_MOUSE_EVENT_LISTENER_ID);
	pcbEventBridge.removeEventListener?.(SMART_COPPER_POUR_PRIMITIVE_EVENT_LISTENER_ID);
};

const resolveSelectedPrimitiveIdsReader = (): LcedaSelectedPrimitiveIdsReader | undefined => {
	return (globalThis as typeof globalThis & { eda?: { pcb_SelectControl?: LcedaSelectedPrimitiveIdsReader } }).eda?.pcb_SelectControl;
};

const resolvePcbEventBridge = (): LcedaPcbEventBridge | undefined => {
	return (globalThis as typeof globalThis & { eda?: { pcb_Event?: LcedaPcbEventBridge } }).eda?.pcb_Event;
};

const readSelectedPrimitiveIdsFingerprint = async (reader: LcedaSelectedPrimitiveIdsReader | undefined): Promise<string> => {
	if (reader !== undefined && typeof reader.getAllSelectedPrimitives_PrimitiveId === 'function') {
		const selectedPrimitiveIds = await reader.getAllSelectedPrimitives_PrimitiveId();
		if (!Array.isArray(selectedPrimitiveIds)) {
			throw new Error('LCEDA selected primitive id API returned an unusable result.');
		}

		return JSON.stringify(normalizeSelectedPrimitiveIds(selectedPrimitiveIds));
	}

	if (reader !== undefined && typeof reader.getAllSelectedPrimitives === 'function') {
		const selectedPrimitives = await reader.getAllSelectedPrimitives();
		if (!Array.isArray(selectedPrimitives)) {
			throw new Error('LCEDA selected primitives API returned an unusable result.');
		}

		return JSON.stringify(
			normalizeSelectedPrimitiveIds(
				selectedPrimitives
					.map((primitive) => resolvePrimitiveId(primitive))
					.filter((primitiveId): primitiveId is string => primitiveId !== null),
			),
		);
	}

	throw new Error('LCEDA selected primitive id API is unavailable.');
};

const normalizeSelectedPrimitiveIds = (value: readonly unknown[]): string[] => {
	return Array.from(
		new Set(
			value
				.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
				.map((entry) => entry.trim())
				.filter((entry) => entry.length > 0),
		),
	).sort();
};

const resolvePrimitiveId = (primitive: unknown): string | null => {
	if (primitive === null || typeof primitive !== 'object') {
		return null;
	}

	const runtimePrimitive = primitive as Partial<IPCB_Primitive>;
	if (typeof runtimePrimitive.getState_PrimitiveId === 'function') {
		return runtimePrimitive.getState_PrimitiveId();
	}

	const inspectedPrimitive = primitive as { id?: unknown };
	return typeof inspectedPrimitive.id === 'string' ? inspectedPrimitive.id : null;
};
