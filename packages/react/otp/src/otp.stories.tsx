import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { v4 as uuid } from 'uuid';
import { OTP } from '@headless-ui/otp';
import styles from './otp.stories.module.css';

const meta: Meta<typeof OTP.Root> = {
  title: 'Components/OTP',
  component: OTP.Root,
  argTypes: {
    otpLength: {
      control: { type: 'number', min: 1, max: 6 },
      description: 'Length of the OTP input',
      defaultValue: 6
    },
    onComplete: {
      action: 'onComplete',
      description: 'Callback fired when all digits are entered'
    }
  }
};

export default meta;
type Story = StoryObj<typeof OTP.Root>;

export const Basic: Story = {
  args: {
    otpLength: 4,
    onComplete: ({ digits, reset }) => {
			action('onComplete')({ digits, reset });
      reset();
    }
  },
  render: ({ otpLength, onComplete }) => (
    <OTP.Root
      otpLength={otpLength}
      className={styles.root}
      onComplete={onComplete}
    >
      {(props) => <OTP.Item className={styles.item} key={uuid()} {...props} />}
    </OTP.Root>
  )
};
