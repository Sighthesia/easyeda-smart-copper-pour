import { describe, expect, test } from 'vitest';

import { isSmartCopperPourRequestMessage } from '../../src/application/smart-copper-pour-contract';
import { handleSmartCopperPourMessage } from '../../src/application/smart-copper-pour-message-dispatcher';
import { TopologyMode } from '../../src/domain/topology-mode';
import { SelectionResolutionError } from '../../src/infrastructure/lceda/selection-resolver';

describe('handleSmartCopperPourMessage', () => {
	test('accepts daisyChain requests with automatic routing payloads', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.DaisyChain,
					width: 1,
					keepoutMargin: 0.2,
					orthogonalRouting: true,
				},
			}),
		).toBe(true);
	});

	test('rejects tree requests carrying removed manual trunk fields', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.Tree,
					width: 1,
					keepoutMargin: 0.2,
					trunkStart: { x: 0, y: 0 },
				},
			}),
		).toBe(false);
	});

	test('returns inspectSelection summary payload', async () => {
		await expect(
			handleSmartCopperPourMessage(
				{
					inspectSelection: async () => ({
						connectionCount: 1,
						netName: 'VCC',
						layerName: 'TopLayer',
						selectionFingerprint: 'fingerprint-1',
					}),
					preview: async () => ({ previewToken: null }),
					apply: async () => ({ applied: false }),
					clearPreview: async () => ({ cleared: true }),
				},
				{ command: 'inspectSelection', meta: { sequence: 7 } },
			),
		).resolves.toEqual({
			ok: true,
			command: 'inspectSelection',
			payload: {
				connectionCount: 1,
				netName: 'VCC',
				layerName: 'TopLayer',
				selectionFingerprint: 'fingerprint-1',
			},
			meta: { sequence: 7 },
		});
	});

	test('preserves actionable selection error codes for inspectSelection failures', async () => {
		await expect(
			handleSmartCopperPourMessage(
				{
					inspectSelection: async () => {
						throw new SelectionResolutionError('selection-empty', 'Select at least two pads before running Smart Copper Pour.');
					},
					preview: async () => ({ previewToken: null }),
					apply: async () => ({ applied: false }),
					clearPreview: async () => ({ cleared: true }),
				},
				{ command: 'inspectSelection', meta: { sequence: 9 } },
			),
		).resolves.toEqual({
			ok: false,
			command: 'inspectSelection',
			error: {
				code: 'selection-empty',
				message: 'Select at least two pads before running Smart Copper Pour.',
			},
			meta: { sequence: 9 },
		});
	});
});
