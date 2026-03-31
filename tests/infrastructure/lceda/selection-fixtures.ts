interface PadPrimitiveOverrides {
	id?: string;
	net?: string | null;
	layer?: unknown;
	x?: number;
	y?: number;
	rotation?: number | null;
	padRadius?: number | null;
	holeRadius?: number | null;
	width?: number | null;
	height?: number | null;
}

interface ComponentSelectionOverrides {
	id?: string;
	children?: readonly unknown[];
}

interface ViaPrimitiveOverrides {
	id?: string;
	net?: string | null;
	x?: number;
	y?: number;
	diameter?: number | null;
	viaType?: unknown;
	designRuleBlindViaName?: unknown;
}

interface ComponentSelectionFixture {
	id: string;
	type: 'COMPONENT';
	getState_PrimitiveId: () => string;
	getChildren: () => readonly unknown[];
}

interface PadPrimitiveFixture {
	id: string;
	type: 'PAD';
	net: string;
	layer: unknown;
	x: number;
	y: number;
	rotation: number | null;
	padRadius: number | null;
	holeRadius: number | null;
	width: number | null;
	height: number | null;
	getState_PrimitiveId: () => string;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Rotation: () => number | null;
	getState_Layer: () => unknown;
	getState_Net: () => string;
	getState_Pad: () => readonly ['ELLIPSE', number | null, number | null];
	getState_Hole: () => readonly ['ROUND', number, number] | null;
}

interface ViaPrimitiveFixture {
	id: string;
	type: 'VIA';
	net: string;
	x: number;
	y: number;
	diameter: number | null;
	viaType: unknown;
	designRuleBlindViaName: unknown;
	getState_PrimitiveId: () => string;
	getState_X: () => number;
	getState_Y: () => number;
	getState_Net: () => string;
	getState_Diameter: () => number | null;
	getState_ViaType: () => unknown;
	getState_DesignRuleBlindViaName: () => unknown;
}

// Mock-backed contract: getChildren(): readonly unknown[] is a fixture assumption and needs live LCEDA verification before merge.
export const createComponentSelection = (overrides: ComponentSelectionOverrides = {}): ComponentSelectionFixture => {
	const id = overrides.id ?? 'component-1';
	const children = overrides.children ?? [];

	return {
		id,
		type: 'COMPONENT' as const,
		getState_PrimitiveId: () => id,
		getChildren: (): readonly unknown[] => children,
	};
};

export const createPadPrimitive = (overrides: PadPrimitiveOverrides = {}): PadPrimitiveFixture => {
	const id = overrides.id ?? 'pad-runtime-1';
	const net = overrides.net ?? 'VCC';
	const layer = overrides.layer ?? 1;
	const x = overrides.x ?? 12;
	const y = overrides.y ?? 34;
	const rotation = overrides.rotation ?? 0;
	const width = overrides.width ?? 6;
	const height = overrides.height ?? 4;
	const padRadius = overrides.padRadius ?? (typeof width === 'number' && typeof height === 'number' ? Math.max(width, height) / 2 : null);
	const holeRadius = overrides.holeRadius ?? 1;

	return {
		id,
		type: 'PAD' as const,
		net,
		layer,
		x,
		y,
		rotation,
		padRadius,
		holeRadius,
		width,
		height,
		getState_PrimitiveId: () => id,
		getState_X: () => x,
		getState_Y: () => y,
		getState_Rotation: () => rotation,
		getState_Layer: () => layer,
		getState_Net: () => net,
		getState_Pad: () => ['ELLIPSE', width, height] as const,
		getState_Hole: () => ['ROUND', holeRadius * 2, holeRadius * 2] as const,
	};
};

export const createViaPrimitive = (overrides: ViaPrimitiveOverrides = {}): ViaPrimitiveFixture => {
	const id = overrides.id ?? 'via-runtime-1';
	const net = overrides.net ?? 'VCC';
	const x = overrides.x ?? 12;
	const y = overrides.y ?? 34;
	const diameter = overrides.diameter ?? 1.6;
	const viaType = overrides.viaType ?? 0;
	const designRuleBlindViaName = overrides.designRuleBlindViaName ?? null;

	return {
		id,
		type: 'VIA' as const,
		net,
		x,
		y,
		diameter,
		viaType,
		designRuleBlindViaName,
		getState_PrimitiveId: () => id,
		getState_X: () => x,
		getState_Y: () => y,
		getState_Net: () => net,
		getState_Diameter: () => diameter,
		getState_ViaType: () => viaType,
		getState_DesignRuleBlindViaName: () => designRuleBlindViaName,
	};
};
