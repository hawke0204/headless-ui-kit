import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { v4 as uuid } from 'uuid';
import { OTP } from '@headless-ui/otp';
import styles from './otp.stories.module.css';

import { OTP as DeprecatedOTP } from './deprecated/otp.deprecated';

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

export const PropsPattern: Story = {
	args: {
		onComplete: ({ digits, reset }) => {
			action('onComplete')({ digits, reset });
			reset();
		},
	},
	render: ({ onComplete }) => (
		<DeprecatedOTP.Root
			otpLength={4}
			className={styles.root}
			onComplete={onComplete}
		>
			{(props) => (
				<DeprecatedOTP.Item className={styles.item} key={uuid()} {...props} />
			)}
		</DeprecatedOTP.Root>
	),
};
