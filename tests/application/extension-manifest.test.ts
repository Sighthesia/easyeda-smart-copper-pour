import { describe, expect, test } from 'vitest';

import * as extensionConfig from '../../extension.json';
import * as packageConfig from '../../package.json';

describe('extension manifest', () => {
	test('uses Smart Copper Pour product naming consistently', () => {
		expect(packageConfig.name).toBe('smart-copper-pour');
		expect(extensionConfig.name).toBe('smart-copper-pour');
		expect(extensionConfig.displayName).toBe('Smart Copper Pour');
		expect(extensionConfig.version).toBe(packageConfig.version);
	});

	test('registers the Smart Copper Pour PCB menu entry under the product name', () => {
		expect(extensionConfig.headerMenus.pcb).toHaveLength(1);

		const pcbMenu = extensionConfig.headerMenus.pcb[0];
		expect(pcbMenu.id).toBe('Smart Copper Pour');
		expect(pcbMenu.title).toBe('Smart Copper Pour');
		expect(pcbMenu.menuItems).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'Smart Copper Pour',
					title: 'Smart Copper Pour',
					registerFn: 'openSmartCopperPour',
				}),
			]),
		);
	});

	test('only exposes the Smart Copper Pour menu group inside the PCB editor', () => {
		expect(extensionConfig.headerMenus.home ?? []).toHaveLength(0);
		expect(extensionConfig.headerMenus.sch ?? []).toHaveLength(0);
		expect(extensionConfig.headerMenus.pcb ?? []).toHaveLength(1);
	});
});
