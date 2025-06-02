import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { OTP } from '../components/otp';
import styles from './otp.stories.module.css';

const meta: Meta<typeof OTP.Root> = {
	title: 'Components/OTP',
	component: OTP.Root,
	argTypes: {
		onComplete: {
			action: 'onComplete',
			description: 'Callback fired when all digits are entered',
		},
	},
};

export default meta;
type Story = StoryObj<typeof OTP.Root>;

export const Basic: Story = {
	args: {
		onComplete: ({ digits, reset }) => {
			action('onComplete')({ digits, reset });
			reset();
		},
	},
	render: ({ onComplete }) => (
		<OTP.Root className={styles.root} onComplete={onComplete}>
			<OTP.Item index={0} className={styles.item} />
			<OTP.Item index={1} className={styles.item} />
			<OTP.Item index={2} className={styles.item} />
			<OTP.Item index={3} className={styles.item} />
		</OTP.Root>
	),
};
