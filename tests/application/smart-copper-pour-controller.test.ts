import { describe, expect, test, vi } from 'vitest';

import {
	SmartCopperPourController,
	type SmartCopperPourPreviewOptimizationRequest,
} from '../../src/application/smart-copper-pour-controller';
import { TopologyMode } from '../../src/domain/topology-mode';

const createPreviewRequest = () => ({
	topologyMode: TopologyMode.Tree as const,
	width: 1,
	keepoutMargin: 0.2,
});

describe('SmartCopperPourController', () => {
	test('reuses the latest preview token when apply omits it', async () => {
		const apply = vi.fn(async () => ({ applied: true }));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
			.fn<(_: ReturnType<typeof createPreviewRequest>) => Promise<{ previewToken: string | null }>>()
			.mockResolvedValueOnce({ previewToken: 'preview-1' })
			.mockRejectedValueOnce(new Error('preview failed'));
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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

		await controller.preview({
			...createPreviewRequest(),
			autoExpand: true,
			maxWidth: 6,
			widthStep: 1,
			obstacleMargin: 0.5,
			padNodes: [
				{ id: 'pad-a', net: 'VCC', layer: 'TopLayer', center: { x: 0, y: 0 }, effectiveRadius: 1 },
				{ id: 'pad-b', net: 'VCC', layer: 'TopLayer', center: { x: 10, y: 0 }, effectiveRadius: 1 },
			],
		} as SmartCopperPourPreviewOptimizationRequest);

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

	test('accepts daisy-chain preview requests with trunk points', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: { inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }) },
			previewGateway: { preview: async () => ({ previewToken: 'preview-1' }), clearPreview: async () => ({ cleared: true }) },
			applyGateway: { apply: async () => ({ applied: true }) },
		});

		await expect(
			controller.preview({
				...createPreviewRequest(),
				topologyMode: TopologyMode.DaisyChain,
				trunkStart: { x: 0, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}),
		).resolves.toEqual({ previewToken: 'preview-1' });
	});

	test('rejects daisy-chain preview requests without a valid trunk start point', async () => {
		const controller = new SmartCopperPourController({
			selectionInspector: {
				inspectSelection: async () => ({ padCount: 2, netName: 'VCC', layerName: 'TopLayer' }),
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
				trunkStart: { x: Number.NaN, y: 0 },
				trunkEnd: { x: 10, y: 0 },
			}),
		).rejects.toMatchObject({
			code: 'invalid-trunk-start',
			message: 'Daisy Chain mode requires a valid trunk start point.',
		});
	});
});
