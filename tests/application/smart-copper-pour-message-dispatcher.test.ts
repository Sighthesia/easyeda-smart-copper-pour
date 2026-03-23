import { describe, expect, test } from 'vitest';

import { handleSmartCopperPourMessage } from '../../src/application/smart-copper-pour-message-dispatcher';
import { SelectionResolutionError } from '../../src/infrastructure/lceda/selection-resolver';

describe('handleSmartCopperPourMessage', () => {
	test('returns inspectSelection summary payload', async () => {
		await expect(
			handleSmartCopperPourMessage(
			{
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
				preview: async () => ({ previewToken: null }),
				apply: async () => ({ applied: false }),
				clearPreview: async () => ({ cleared: true }),
			},
			{ command: 'inspectSelection' },
			),
		).resolves.toEqual({
			ok: true,
			command: 'inspectSelection',
			payload: { padCount: 2, netName: 'VCC', layerName: 'TopLayer' },
		});
	});

	test('preserves actionable selection error codes', async () => {
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
			{ command: 'inspectSelection' },
			),
		).resolves.toEqual({
			ok: false,
			command: 'inspectSelection',
			error: {
				code: 'selection-empty',
				message: 'Select at least two pads before running Smart Copper Pour.',
			},
		});
	});
});
