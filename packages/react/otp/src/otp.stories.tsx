import { OTP } from '@headless-ui/otp';
import { v4 as uuid } from 'uuid';
import styles from './otp.stories.module.css';

export default { title: 'Components/OTP' };

export const Headless = () => (
	<OTP.Root
		otpLength={6}
		className={styles.root}
		onComplete={({ reset }) => {
			reset();
		}}
	>
		{(props) => <OTP.Item className={styles.item} key={uuid()} {...props} />}
	</OTP.Root>
);
