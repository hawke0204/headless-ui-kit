import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
	parameters: {
		chromatic: { disable: true },
	},
};

export default preview;
