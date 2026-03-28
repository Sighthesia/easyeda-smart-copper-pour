import esbuild from 'esbuild';

import common from './esbuild.common';

(async () => {
	const contexts = await Promise.all([esbuild.context(common)]);
	if (process.argv.includes('--watch')) {
		await Promise.all(contexts.map((ctx) => ctx.watch()));
	} else {
		await Promise.all(contexts.map((ctx) => ctx.rebuild()));
		process.exit();
	}
})();
