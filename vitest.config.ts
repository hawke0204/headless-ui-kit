import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./scripts/vitest.setup.ts'],
		exclude: ['node_modules', 'dist'],
		include: ['**/*.test.?(c|m)[jt]s?(x)'],
		globals: true,
	},
	resolve: {
		alias: {
			'@headless-ui/core': resolve(__dirname, './packages/react/core/src'),
		},
	},
});
