import { createContext } from '@headless-ui/core';
import { Primitive } from 'radix-ui/internal';
import {
	forwardRef,
	useRef,
	Children,
	type HTMLAttributes,
	type ReactNode,
	type ForwardedRef,
	type KeyboardEvent,
	type RefObject,
} from 'react';

import { useOtp } from '../hooks/useOtp';
import { CONSTANTS } from '../constants';
import { maskValue } from '../utils';
import { useOtpFieldFocus } from '../hooks/useOtpFieldFocus';

interface ContextValueType {
	otp: string[];
	activeOTPIndex: number;
	handleKeyDown: (event: KeyboardEvent) => void;
}

const defaultContextValue: ContextValueType = {
	otp: [],
	activeOTPIndex: CONSTANTS.DEFAULT_INDEX,
	handleKeyDown: () => {},
};

const [OTPProvider, useOTPContext] = createContext<ContextValueType>(
	CONSTANTS.NAMES.ITEM,
	defaultContextValue,
);

interface OTPRootProps
	extends Omit<HTMLAttributes<HTMLFormElement>, 'children'> {
	onComplete?: (props: {
		digits: string;
		reset: () => void;
	}) => void;
	children: ReactNode;
}

const OTPRoot = forwardRef<HTMLFormElement, OTPRootProps>(
	(props, forwardedRef: ForwardedRef<HTMLFormElement>) => {
		const { onComplete, children, ...restProps } = props;

		const otpLength = Children.count(children);

		const { otp, activeOtpIndex, handleKeyDown } = useOtp({
			otpLength,
			onComplete,
		});

		return (
			<OTPProvider
				otp={otp}
				activeOTPIndex={activeOtpIndex}
				handleKeyDown={handleKeyDown}
			>
				<Primitive.form
					tabIndex={0}
					name="form"
					autoComplete="off"
					ref={forwardedRef}
					{...restProps}
				>
					{children}
				</Primitive.form>
			</OTPProvider>
		);
	},
);

OTPRoot.displayName = CONSTANTS.NAMES.ROOT;

interface OTPItemProps extends HTMLAttributes<HTMLInputElement> {
	index: number;
}

const OTPItem = forwardRef<HTMLInputElement, OTPItemProps>((props, ref) => {
	const { index, ...restProps } = props;
	const { otp, activeOTPIndex, handleKeyDown } = useOTPContext(
		CONSTANTS.NAMES.ITEM,
	);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const isActive = index === activeOTPIndex;
	const value = otp[index];

	useOtpFieldFocus({ ref: inputRef as RefObject<HTMLInputElement>, isActive });

	return (
		<input
			type="text"
			name="number"
			tabIndex={0}
			inputMode="numeric"
			autoComplete="new-password"
			autoCorrect="off"
			spellCheck="false"
			maxLength={1}
			pattern="\d*"
			readOnly={!isActive}
			ref={(node) => {
				if (ref) {
					if (typeof ref === 'function') {
						ref(node);
					} else {
						ref.current = node;
					}
				}
				inputRef.current = node;
			}}
			onChange={(event) => {
				event.preventDefault();
			}}
			onCopy={(event) => {
				event.preventDefault();
			}}
			onPaste={(event) => {
				event.preventDefault();
			}}
			onCut={(event) => {
				event.preventDefault();
			}}
			onKeyDown={(event) => {
				handleKeyDown(event as unknown as KeyboardEvent);
			}}
			value={maskValue(value)}
			aria-label={`OTP digit ${index + 1}`}
			{...restProps}
		/>
	);
});

OTPItem.displayName = CONSTANTS.NAMES.ITEM;

export { OTPRoot as Root, OTPItem as Item };

export const OTP = {
	Root: OTPRoot,
	Item: OTPItem,
};
