import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./scripts/vitest.setup.ts'],
		exclude: ['node_modules', 'dist'],
		include: ['**/*.test.?(c|m)[jt]s?(x)'],
		globals: true,
	},
});
