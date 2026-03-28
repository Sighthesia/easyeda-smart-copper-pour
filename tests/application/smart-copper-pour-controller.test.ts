import { describe, expect, test, vi } from 'vitest';

import type { SmartCopperPourPreviewRequest } from '../../src/application/smart-copper-pour-contract';
import { SmartCopperPourController } from '../../src/application/smart-copper-pour-controller';
import { TopologyMode } from '../../src/domain/topology-mode';
import { createSmartCopperPourSelectionInspector } from '../../src/infrastructure/lceda/selection-inspector';

type SmartCopperPourPreviewOptimizationTestRequest = Parameters<SmartCopperPourController['preview']>[0] & {
	padNodes: Array<{ id: string; net: string; layer: string; center: { x: number; y: number }; effectiveRadius: number }>;
};

const createPreviewRequest = () => ({
	topologyMode: TopologyMode.Tree as const,
	width: 1,
	keepoutMargin: 0.2,
});

const createSelectedPrimitives = () => [
	{ id: 'pad-b', type: 'PAD' as const, net: 'VCC', layer: 'TopLayer', x: 30, y: 40, width: null, height: null, padRadius: 1.2, holeRadius: null },
	{ id: 'pad-a', type: 'PAD' as const, net: 'VCC', layer: 'TopLayer', x: 10, y: 20, width: null, height: null, padRadius: 1, holeRadius: null },
	{
		id: 'via-a',
		type: 'VIA' as const,
		net: 'VCC',
		x: 20,
		y: 30,
		layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' },
		padRadius: 0.8,
	},
];

const createSelectionSummary = () => ({
	connectionCount: 2,
	netName: 'VCC',
	layerName: 'TopLayer',
	selectionFingerprint: 'fingerprint',
});

describe('SmartCopperPourController', () => {
	test('returns inspectSelection summary with connectionCount and selectionFingerprint', async () => {
		const selectionInspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: async () => createSelectedPrimitives(),
		});
		const controller = new SmartCopperPourController({
			selectionInspector,
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(controller.inspectSelection()).resolves.toEqual({
			connectionCount: 3,
			netName: 'VCC',
			layerName: 'TopLayer',
			selectionFingerprint: expect.any(String),
		});
	});

	test('returns a live summary for a single selected via', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: createSmartCopperPourSelectionInspector({
				readSelectedPrimitives: async () => [
					{
						id: 'via-only',
						type: 'VIA',
						net: 'VCC',
						x: 20,
						y: 30,
						layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' },
						padRadius: 0.8,
					},
				],
			}),
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(controller.inspectSelection()).resolves.toEqual({
			connectionCount: 1,
			layerName: 'TopLayer',
			netName: 'VCC',
			selectionFingerprint: expect.any(String),
		});
	});

	test('keeps selectionFingerprint stable for the same normalized nodes', async () => {
		const selectedPrimitives = createSelectedPrimitives();
		const reversedSelectedPrimitives = [...selectedPrimitives].reverse();
		const inspectSelection = vi.fn().mockResolvedValueOnce(selectedPrimitives).mockResolvedValueOnce(reversedSelectedPrimitives);
		const selectionInspector = createSmartCopperPourSelectionInspector({
			readSelectedPrimitives: inspectSelection,
		});
		const controller = new SmartCopperPourController({
			selectionInspector,
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		const firstSummary = await controller.inspectSelection();
		const secondSummary = await controller.inspectSelection();

		expect(firstSummary.connectionCount).toBe(3);
		expect(secondSummary.connectionCount).toBe(3);
		expect(firstSummary.selectionFingerprint).toEqual(secondSummary.selectionFingerprint);
		expect(firstSummary.selectionFingerprint).toEqual(expect.any(String));
	});

	test('changes selectionFingerprint when normalized nodes change under the same net and layer', async () => {
		const firstController = new SmartCopperPourController({
			selectionInspector: createSmartCopperPourSelectionInspector({
				readSelectedPrimitives: async () => createSelectedPrimitives(),
			}),
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});
		const secondController = new SmartCopperPourController({
			selectionInspector: createSmartCopperPourSelectionInspector({
				readSelectedPrimitives: async () => [
					{
						id: 'pad-y',
						type: 'PAD',
						net: 'VCC',
						layer: 'TopLayer',
						x: 300,
						y: 400,
						width: null,
						height: null,
						padRadius: 1.2,
						holeRadius: null,
					},
					{
						id: 'pad-x',
						type: 'PAD',
						net: 'VCC',
						layer: 'TopLayer',
						x: 100,
						y: 200,
						width: null,
						height: null,
						padRadius: 1,
						holeRadius: null,
					},
					{
						id: 'via-x',
						type: 'VIA',
						net: 'VCC',
						x: 200,
						y: 300,
						layerSpan: { startLayer: 'TopLayer', endLayer: 'BottomLayer' },
						padRadius: 0.8,
					},
				],
			}),
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		const firstSummary = await firstController.inspectSelection();
		const secondSummary = await secondController.inspectSelection();

		expect(firstSummary.connectionCount).toBe(3);
		expect(secondSummary.connectionCount).toBe(3);
		expect(firstSummary.selectionFingerprint).not.toBe(secondSummary.selectionFingerprint);
	});

	test('reuses the latest preview token when apply omits it', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply,
			},
		});

		await controller.preview(createPreviewRequest());
		await controller.apply(createPreviewRequest());

		expect(apply).toHaveBeenCalledWith({
			...createPreviewRequest(),
			previewToken: 'preview-1',
		});
	});

	test('clears the cached preview token after a matching successful apply', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply,
			},
		});

		await controller.preview(createPreviewRequest());
		await controller.apply(createPreviewRequest());
		await controller.apply(createPreviewRequest());

		expect(apply).toHaveBeenNthCalledWith(1, {
			...createPreviewRequest(),
			previewToken: 'preview-1',
		});
		expect(apply).toHaveBeenNthCalledWith(2, {
			...createPreviewRequest(),
			previewToken: null,
		});
	});

	test('keeps the cached preview token after apply fails', async () => {
		const apply = vi
			.fn<(_: { previewToken?: string | null }) => Promise<{ applied: boolean }>>()
			.mockRejectedValueOnce(new Error('apply failed'))
			.mockResolvedValueOnce({ applied: true });
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply,
			},
		});

		await controller.preview(createPreviewRequest());
		await expect(controller.apply(createPreviewRequest())).rejects.toThrow('apply failed');
		await controller.apply(createPreviewRequest());

		expect(apply).toHaveBeenNthCalledWith(1, {
			...createPreviewRequest(),
			previewToken: 'preview-1',
		});
		expect(apply).toHaveBeenNthCalledWith(2, {
			...createPreviewRequest(),
			previewToken: 'preview-1',
		});
	});

	test('clears a stale cached preview token when the next preview fails', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const preview = vi
			.fn<(_: SmartCopperPourPreviewRequest) => Promise<{ previewToken: string | null }>>()
			.mockResolvedValueOnce({ previewToken: 'preview-1' })
			.mockRejectedValueOnce(new Error('preview failed'));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview,
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply,
			},
		});

		await controller.preview(createPreviewRequest());
		await expect(controller.preview(createPreviewRequest())).rejects.toThrow('preview failed');
		await controller.apply(createPreviewRequest());

		expect(apply).toHaveBeenCalledWith({
			...createPreviewRequest(),
			previewToken: null,
		});
	});

	test('clears the cached preview token after clearPreview succeeds', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply,
			},
		});

		await controller.preview(createPreviewRequest());
		await controller.clearPreview();
		await controller.apply(createPreviewRequest());

		expect(apply).toHaveBeenCalledWith({
			...createPreviewRequest(),
			previewToken: null,
		});
	});

	test('rejects preview requests with a non-positive width', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				width: 0,
			}),
		).rejects.toMatchObject({
			code: 'invalid-width',
			message: 'Width must be greater than 0.',
		});
	});

	test('rejects apply requests with a negative keepout margin', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.apply({
				...createPreviewRequest(),
				keepoutMargin: -0.1,
			}),
		).rejects.toMatchObject({
			code: 'invalid-keepout-margin',
			message: 'Keepout margin must be 0 or greater.',
		});
	});

	test('expands preview width to the last safe value when autoExpand is enabled', async () => {
		const preview = vi.fn(async () => ({ previewToken: 'preview-1' }));
		const resolveObstacles = vi.fn(async () => [
			{
				outline: {
					vertices: [
						{ x: 0, y: 2.6 },
						{ x: 10, y: 2.6 },
						{ x: 10, y: 6 },
						{ x: 0, y: 6 },
					],
				},
			},
		]);
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview,
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
			obstacleResolver: {
				resolveObstacles,
			},
		});

		const optimizedPreviewRequest: SmartCopperPourPreviewOptimizationTestRequest = {
			...createPreviewRequest(),
			autoExpand: true,
			maxWidth: 6,
			widthStep: 1,
			obstacleMargin: 0.5,
			padNodes: [
				{ id: 'pad-a', net: 'VCC', layer: 'TopLayer', center: { x: 0, y: 0 }, effectiveRadius: 1 },
				{ id: 'pad-b', net: 'VCC', layer: 'TopLayer', center: { x: 10, y: 0 }, effectiveRadius: 1 },
			],
		};

		await controller.preview(optimizedPreviewRequest);

		expect(resolveObstacles).toHaveBeenCalledOnce();
		expect(preview).toHaveBeenCalledWith({
			...createPreviewRequest(),
			width: 3,
			autoExpand: true,
			maxWidth: 6,
			widthStep: 1,
			obstacleMargin: 0.5,
			padNodes: [
				{ id: 'pad-a', net: 'VCC', layer: 'TopLayer', center: { x: 0, y: 0 }, effectiveRadius: 1 },
				{ id: 'pad-b', net: 'VCC', layer: 'TopLayer', center: { x: 10, y: 0 }, effectiveRadius: 1 },
			],
		});
	});

	test('keeps manual daisy-chain endpoints in the autoExpand optimization path', async () => {
		vi.resetModules();
		const planDaisyChainBackbone = vi.fn(() => ({
			mode: TopologyMode.DaisyChain,
			segments: [
				{
					start: { x: 0, y: 0 },
					end: { x: 10, y: 0 },
					role: 'trunk' as const,
				},
			],
		}));

		vi.doMock('../../src/domain/daisy-chain-planner', async () => {
			const actual = await vi.importActual('../../src/domain/daisy-chain-planner');
			return {
				...actual,
				planDaisyChainBackbone,
			};
		});

		try {
			const { SmartCopperPourController: MockedSmartCopperPourController } = await import('../../src/application/smart-copper-pour-controller');
			const preview = vi.fn(async () => ({ previewToken: 'preview-1' }));
			const controller = new MockedSmartCopperPourController({
				selectionInspector: {
					inspectSelection: async () => createSelectionSummary(),
				},
				previewGateway: {
					preview,
					clearPreview: async () => ({ cleared: true }),
				},
				applyGateway: {
					apply: async () => ({ applied: true }),
				},
				obstacleResolver: {
					resolveObstacles: async () => [],
				},
			});

			const optimizedPreviewRequest: SmartCopperPourPreviewOptimizationTestRequest = {
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 3, y: 1 },
				trunkEnd: { x: 9, y: 1 },
				autoExpand: true,
				maxWidth: 3,
				widthStep: 1,
				padNodes: [
					{ id: 'pad-a', net: 'VCC', layer: 'TopLayer', center: { x: 0, y: 0 }, effectiveRadius: 1 },
					{ id: 'pad-b', net: 'VCC', layer: 'TopLayer', center: { x: 10, y: 0 }, effectiveRadius: 1 },
				],
			};

			await controller.preview(optimizedPreviewRequest);

			expect(planDaisyChainBackbone).toHaveBeenCalledWith(expect.any(Array), {
				trunkMode: 'manual',
				trunkStart: { x: 3, y: 1 },
				trunkEnd: { x: 9, y: 1 },
			});
			expect(preview).toHaveBeenCalledOnce();
		} finally {
			vi.doUnmock('../../src/domain/daisy-chain-planner');
			vi.resetModules();
		}
	});

	test('accepts daisy-chain preview requests with trunk points', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => createSelectionSummary() },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply: async () => ({ applied: true }) },
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}),
		).resolves.toEqual({ previewToken: 'preview-1' });
	});

	test('accepts daisy-chain preview requests in auto trunk mode without trunk points', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => createSelectionSummary() },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply: async () => ({ applied: true }) },
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'auto',
			}),
		).resolves.toEqual({ previewToken: 'preview-1' });
	});

	test('rejects daisy-chain preview requests without trunkMode', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => createSelectionSummary() },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply: async () => ({ applied: true }) },
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
			} as unknown as Parameters<SmartCopperPourController['preview']>[0]),
		).rejects.toMatchObject({
			code: 'invalid-trunk-mode',
			message: 'Daisy Chain mode requires trunkMode to be either manual or auto.',
		});
	});

	test('rejects daisy-chain apply requests with an invalid trunkMode', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => createSelectionSummary() },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply: async () => ({ applied: true }) },
		});

		await expect(
			controller.apply({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'bogus',
			} as unknown as Parameters<SmartCopperPourController['apply']>[0]),
		).rejects.toMatchObject({
			code: 'invalid-trunk-mode',
			message: 'Daisy Chain mode requires trunkMode to be either manual or auto.',
		});
	});

	test('rejects daisy-chain preview requests without a valid trunk start point', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: Number.NaN, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}),
		).rejects.toMatchObject({
			code: 'invalid-trunk-start',
			message: 'Daisy Chain mode requires a valid trunk start point.',
		});
	});

	test('rejects daisy-chain manual apply requests without a valid trunk start point', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.apply({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: Number.NaN, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}),
		).rejects.toMatchObject({
			code: 'invalid-trunk-start',
			message: 'Daisy Chain mode requires a valid trunk start point.',
		});
	});

	test('rejects daisy-chain preview requests without a trunk end point', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
			} as unknown as Parameters<SmartCopperPourController['preview']>[0]),
		).rejects.toMatchObject({
			code: 'missing-trunk-end',
			message: 'Daisy Chain mode requires a trunk end point.',
		});
	});

	test('rejects daisy-chain preview requests without a valid trunk end point', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => createSelectionSummary(),
			},
			previewGateway: {
				preview: async () => ({ previewToken: 'preview-1' }),
				clearPreview: async () => ({ cleared: true }),
			},
			applyGateway: {
				apply: async () => ({ applied: true }),
			},
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'manual',
				trunkStart: { x: 0, y: 0 },
				trunkEnd: { x: Number.NaN, y: 0 },
			}),
		).rejects.toMatchObject({
			code: 'invalid-trunk-end',
			message: 'Daisy Chain mode requires a valid trunk end point.',
		});
	});

	test('accepts daisy-chain apply requests in auto trunk mode without trunk points', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => createSelectionSummary() },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply },
		});

		await expect(
			controller.apply({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkMode: 'auto',
			}),
		).resolves.toEqual({ applied: true });
		expect(apply).toHaveBeenCalledWith({
			...createPreviewRequest(),
			topologyMode: TopologyMode.DaisyChain,
			trunkMode: 'auto',
			previewToken: null,
		});
	});
});
