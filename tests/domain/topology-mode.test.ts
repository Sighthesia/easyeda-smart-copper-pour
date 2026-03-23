import { describe, expect, test } from 'vitest';

import { TopologyMode } from '../../src/domain/topology-mode';

describe('topology mode contract', () => {
	test('keeps all planned topology modes available in the domain layer', () => {
		expect(TopologyMode).toMatchObject({
			Tree: 'tree',
			Star: 'star',
			DaisyChain: 'daisyChain',
		});
	});
});
