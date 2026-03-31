export interface LcedaPadPrimitiveShape {
	getState_PrimitiveId: () => string;
	getState_Pad: () => [unknown, number, number] | [unknown, number, number, number] | [unknown, unknown] | undefined;
	getState_Hole: () => [unknown, number, number] | null;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Rotation?: () => unknown;
	getState_Net: () => string | undefined;
	getState_Layer: () => unknown;
}

export interface LcedaViaPrimitiveShape {
	getState_PrimitiveId: () => string;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Net: () => string | undefined;
	getState_Diameter?: () => unknown;
	getState_ViaType?: () => unknown;
	getState_DesignRuleBlindViaName?: () => unknown;
}

export const isLcedaPadPrimitive = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaPadPrimitiveShape => {
	const candidate = primitive as Partial<LcedaPadPrimitiveShape>;
	return (
		typeof candidate.getState_PrimitiveId === 'function' &&
		typeof candidate.getState_Pad === 'function' &&
		typeof candidate.getState_Hole === 'function' &&
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function' &&
		typeof candidate.getState_Layer === 'function'
	);
};

export const isLcedaViaPrimitiveCandidate = (primitive: IPCB_Primitive): primitive is IPCB_Primitive & LcedaViaPrimitiveShape => {
	const candidate = primitive as Partial<LcedaViaPrimitiveShape>;
	return (
		typeof candidate.getState_PrimitiveId === 'function' &&
		typeof candidate.getState_X === 'function' &&
		typeof candidate.getState_Y === 'function' &&
		typeof candidate.getState_Net === 'function' &&
		(typeof candidate.getState_Diameter === 'function' ||
			typeof candidate.getState_ViaType === 'function' ||
			typeof candidate.getState_DesignRuleBlindViaName === 'function')
	);
};
