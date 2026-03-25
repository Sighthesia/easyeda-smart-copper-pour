import { SelectionResolutionError } from './selection-resolver';
import { isLcedaPadPrimitive } from './selection-shapes';

interface LcedaExpandableSelection {
	getState_PrimitiveId: () => string;
	getChildren: () => readonly unknown[];
}

export interface LcedaExpandedSelection {
	parentSelectionId: string;
	children: readonly IPCB_Primitive[];
}

export const normalizeLcedaSelectionPrimitives = (primitives: readonly unknown[]): readonly unknown[] => {
	const expandedPrimitives: unknown[] = [];
	const seenIds = new Set<string>();

	for (const primitive of primitives) {
		const expandedSelection = expandLcedaSelection(primitive);
		if (expandedSelection !== null) {
			if (expandedSelection.children.length === 0) {
				throw new SelectionResolutionError(
					'selection-too-small',
					`Expandable selection ${expandedSelection.parentSelectionId} has no pad-like children.`,
				);
			}

			for (const child of expandedSelection.children) {
				const childId = resolvePrimitiveId(child);
				if (childId === null || seenIds.has(childId)) {
					continue;
				}

				seenIds.add(childId);
				expandedPrimitives.push(child);
			}

			continue;
		}

		const primitiveId = resolvePrimitiveId(primitive);
		if (primitiveId === null) {
			expandedPrimitives.push(primitive);
			continue;
		}

		if (seenIds.has(primitiveId)) {
			continue;
		}

		seenIds.add(primitiveId);
		expandedPrimitives.push(primitive);
	}

	return expandedPrimitives;
};

export const expandRuntimeSelectedPrimitives = (primitives: readonly IPCB_Primitive[]): readonly IPCB_Primitive[] => {
	return normalizeLcedaSelectionPrimitives(primitives).filter(isRuntimePrimitive) as readonly IPCB_Primitive[];
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

const isRuntimePrimitive = (primitive: unknown): primitive is IPCB_Primitive => {
	if (primitive === null || typeof primitive !== 'object') {
		return false;
	}

	const candidate = primitive as Partial<IPCB_Primitive>;
	return typeof candidate.getState_PrimitiveId === 'function';
};

const expandLcedaSelection = (selection: unknown): LcedaExpandedSelection | null => {
	if (selection === null || typeof selection !== 'object') {
		return null;
	}

	const candidate = selection as Partial<LcedaExpandableSelection>;
	if (typeof candidate.getState_PrimitiveId !== 'function' || typeof candidate.getChildren !== 'function') {
		return null;
	}

	const children = candidate.getChildren();
	if (!Array.isArray(children)) {
		return null;
	}

	return {
		parentSelectionId: candidate.getState_PrimitiveId(),
		children: children.filter(isLcedaPadPrimitive),
	};
};
