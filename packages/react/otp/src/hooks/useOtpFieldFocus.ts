import { useEffect } from 'react';
import type { RefObject } from 'react';

interface UseOtpFieldFocusProps {
	ref: RefObject<HTMLInputElement>;
	isActive: boolean;
}

export const useOtpFieldFocus = ({
	ref,
	isActive,
}: UseOtpFieldFocusProps): void => {
	useEffect(() => {
		if (!isActive || !ref.current) {
			return;
		}

		const input = ref.current;
		input.focus();
		input.click();

		return () => {
			input.blur();
		};
	}, [isActive, ref]);
};
