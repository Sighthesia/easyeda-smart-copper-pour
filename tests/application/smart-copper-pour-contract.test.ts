import { describe, expect, test } from 'vitest';

import { isSmartCopperPourRequestMessage } from '../../src/application/smart-copper-pour-contract';
import { TopologyMode } from '../../src/domain/topology-mode';

describe('smart copper topology contract', () => {
	test('accepts tree and star topology modes with the shared payload shape', () => {
		for (const topologyMode of [TopologyMode.Tree, TopologyMode.Star]) {
			expect(
				isSmartCopperPourRequestMessage({
					command: 'preview',
					payload: {
						topologyMode,
						width: 1,
						keepoutMargin: 0.2,
						cornerStyle: 'round',
					},
				}),
			).toBe(true);
		}
	});

	test('accepts daisyChain topology mode with auto trunk routing', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.DaisyChain,
					trunkMode: 'auto',
					width: 1,
					keepoutMargin: 0.2,
					cornerStyle: 'round',
				},
			}),
		).toBe(true);
	});

	test('accepts daisyChain topology mode with manual trunk routing', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.DaisyChain,
					trunkMode: 'manual',
					width: 1,
					keepoutMargin: 0.2,
					cornerStyle: 'round',
					trunkStart: { x: 0, y: 0 },
					trunkEnd: { x: 10, y: 0 },
				},
			}),
		).toBe(true);
	});

	test('accepts preview requests that omit cornerStyle and use the default', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.Tree,
					width: 1,
					keepoutMargin: 0.2,
				},
			}),
		).toBe(true);
	});

	test('accepts preview requests with auto expansion controls', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'preview',
				payload: {
					topologyMode: TopologyMode.Tree,
					width: 1,
					keepoutMargin: 0.2,
					autoExpand: true,
					maxWidth: 3,
					widthStep: 0.5,
					obstacleMargin: 0.1,
				},
			}),
		).toBe(true);
	});

	test('rejects apply requests that try to carry previewToken across the public bus boundary', () => {
		expect(
			isSmartCopperPourRequestMessage({
				command: 'apply',
				payload: {
					topologyMode: TopologyMode.Tree,
					width: 1,
					keepoutMargin: 0.2,
					previewToken: 'preview-1',
				},
			}),
		).toBe(false);
	});
});
