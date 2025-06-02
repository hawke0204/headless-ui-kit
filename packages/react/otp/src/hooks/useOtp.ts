import { useCallback, useState, type KeyboardEvent } from 'react';
import { hashOtp, isDigit, isBackspace } from '../utils';
import { CONSTANTS } from '../constants';

interface UseOtpProps {
	otpLength: number;
	onComplete?: (props: { digits: string; reset: () => void }) => void;
}

export const useOtp = ({ otpLength, onComplete }: UseOtpProps) => {
	const [otp, setOtp] = useState<string[]>(() => Array(otpLength).fill(''));
	const [activeOtpIndex, setActiveOtpIndex] = useState<number>(
		CONSTANTS.DEFAULT_INDEX,
	);

	const resetOtp = useCallback((): void => {
		setOtp(Array(otpLength).fill(''));
		setActiveOtpIndex(CONSTANTS.DEFAULT_INDEX);
	}, [otpLength]);

	const handleDigitInput = useCallback(
		(key: string): string[] | null => {
			const lastIndex = otpLength - 1;
			const targetIndex = Math.min(activeOtpIndex, lastIndex);
			const isTargetFilled = otp[targetIndex] !== '';

			if (isTargetFilled) {
				return null;
			}

			const newOtp = [...otp];
			newOtp[targetIndex] = key;
			setOtp(newOtp);

			const isNotLastIndex = activeOtpIndex < lastIndex;
			if (isNotLastIndex) {
				setActiveOtpIndex((prev) => prev + 1);
			}

			return newOtp;
		},
		[activeOtpIndex, otp, otpLength],
	);

	const handleBackspace = useCallback((): void => {
		const newOtp = [...otp];
		newOtp[activeOtpIndex] = '';

		setOtp(newOtp);
		setActiveOtpIndex((prev) => {
			const targetIndex = Math.max(prev - 1, CONSTANTS.DEFAULT_INDEX);
			return targetIndex;
		});
	}, [activeOtpIndex, otp]);

	const checkIfOtpIsComplete = useCallback((otpArray: string[]): boolean => {
		return otpArray.every((digit) => digit !== '');
	}, []);

	const handleCompleteOtp = useCallback(
		async (otpArray: string[]): Promise<void> => {
			try {
				const digits = otpArray.join('');
				const hashedDigits = await hashOtp(digits);
				onComplete?.({
					digits: hashedDigits,
					reset: resetOtp,
				});
			} catch (error) {
				console.error('Error processing OTP:', error);
			}
		},
		[onComplete, resetOtp],
	);

	const handleKeyDown = useCallback(
		async (event: KeyboardEvent): Promise<void> => {
			if (isDigit(event)) {
				const newOtp = handleDigitInput(event.key);

				if (newOtp && checkIfOtpIsComplete(newOtp)) {
					await handleCompleteOtp(newOtp);
				}
			} else if (isBackspace(event)) {
				handleBackspace();
			}
		},
		[
			handleDigitInput,
			handleBackspace,
			handleCompleteOtp,
			checkIfOtpIsComplete,
		],
	);

	return {
		otp,
		activeOtpIndex,
		handleKeyDown,
		resetOtp,
	};
};
