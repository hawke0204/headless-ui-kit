/**
 * @deprecated This component is deprecated.
 */
import { Primitive } from 'radix-ui/internal';
import React from 'react';

interface ContextValueType {
	otp: string[];
	activeOTPItemIndex: number;
}

const OTPContext = React.createContext<ContextValueType | undefined>(undefined);

const useOTPContext = (consumerName: string) => {
	const context = React.useContext(OTPContext);

	if (context) {
		return context;
	}

	throw new Error(
		`\`${consumerName}\` must be used within \`${OTP_ROOT_NAME}\``,
	);
};

const OTP_ROOT_NAME = 'OTPRoot';

interface OTPRootProps
	extends Omit<React.HTMLAttributes<HTMLFormElement>, 'children'> {
	otpLength?: number;
	onComplete?: (props: {
		digits: string;
		reset: () => void;
	}) => void;
	children: (props: {
		ref: React.RefObject<HTMLInputElement>;
		value: string;
		otpItemIndex: number;
	}) => React.ReactNode;
}

const INITIAL_ACTIVE_OTP_INDEX = 0;

const isDigit = (event: KeyboardEvent) => /^\d$/.test(event.key);

const isBackspace = (event: KeyboardEvent) => event.key === 'Backspace';

const OTPRoot = React.forwardRef<HTMLFormElement, OTPRootProps>(
	(props, forwardedRef) => {
		const { otpLength = 6, onComplete, children, ...restProps } = props;

		const [otp, setOTP] = React.useState<string[]>(Array(otpLength).fill(''));
		const [activeOTPItemIndex, setActiveOTPItemIndex] = React.useState<number>(
			INITIAL_ACTIVE_OTP_INDEX,
		);
		const [itemRefs, setItemRefs] = React.useState<
			React.RefObject<HTMLInputElement>[]
		>([]);

		const handleKeyDown = React.useCallback(
			(event: KeyboardEvent) => {
				switch (true) {
					case isDigit(event): {
						const newOTPIndex = Math.min(activeOTPItemIndex, otpLength - 1);
						if (otp[newOTPIndex] !== '') {
							return;
						}

						const newOtp = [...otp];
						newOtp[newOTPIndex] = event.key;
						setOTP(newOtp);

						if (activeOTPItemIndex < otpLength - 1) {
							setActiveOTPItemIndex(
								(prevActiveOTPIndex) => prevActiveOTPIndex + 1,
							);
						}

						if (newOtp.every((digit) => digit !== '')) {
							setTimeout(() => {
								onComplete?.({
									digits: newOtp.join(''),
									reset: () => {
										setOTP(Array(otpLength).fill(''));
										setActiveOTPItemIndex(INITIAL_ACTIVE_OTP_INDEX);
									},
								});
							}, 100);
						}
						break;
					}

					case isBackspace(event): {
						const newOtp = [...otp];
						newOtp[activeOTPItemIndex] = '';
						setOTP(newOtp);
						setActiveOTPItemIndex((prevActiveOTPIndex) =>
							Math.max(prevActiveOTPIndex - 1, INITIAL_ACTIVE_OTP_INDEX),
						);
						break;
					}
				}
			},
			[activeOTPItemIndex, onComplete, otp, otpLength],
		);

		React.useEffect(() => {
			setItemRefs((prevRefs) =>
				Array(otp.length)
					.fill(null)
					.map((_, i) => prevRefs[i] || React.createRef()),
			);
		}, [otp.length]);

		React.useEffect(() => {
			for (const itemRef of itemRefs) {
				itemRef.current?.addEventListener('keydown', handleKeyDown);
			}

			return () => {
				for (const itemRef of itemRefs) {
					itemRef.current?.removeEventListener('keydown', handleKeyDown);
				}
			};
		}, [handleKeyDown, itemRefs]);

		return (
			<OTPContext.Provider
				value={{
					otp,
					activeOTPItemIndex,
				}}
			>
				<Primitive.form
					tabIndex={0}
					name="form"
					ref={forwardedRef}
					{...restProps}
				>
					{otp.map((digit, otpItemIndex) => {
						return children({
							ref: itemRefs[otpItemIndex],
							value: digit,
							otpItemIndex,
						});
					})}
				</Primitive.form>
			</OTPContext.Provider>
		);
	},
);

OTPRoot.displayName = OTP_ROOT_NAME;

const OTP_ITEM_NAME = 'OTPItem';

interface OTPItemProps extends React.HTMLAttributes<HTMLInputElement> {
	value: string;
	otpItemIndex: number;
}

const OTPItem = React.forwardRef<HTMLInputElement, OTPItemProps>(
	(props, forwardedRef) => {
		const { otpItemIndex, ...restProps } = props;

		const { activeOTPItemIndex } = useOTPContext(OTP_ITEM_NAME);

		React.useEffect(() => {
			const inputRef =
				forwardedRef && 'current' in forwardedRef ? forwardedRef : null;

			const isActive = otpItemIndex === activeOTPItemIndex;

			if (isActive && inputRef?.current) {
				inputRef.current.focus();
				inputRef.current.click();
			}

			return () => {
				if (inputRef?.current) {
					inputRef.current.blur();
				}
			};
		}, [activeOTPItemIndex, otpItemIndex, forwardedRef]);

		return (
			<Primitive.input
				type="text"
				name="password"
				tabIndex={0}
				inputMode="numeric"
				autoComplete="off"
				readOnly={otpItemIndex !== activeOTPItemIndex}
				ref={forwardedRef}
				{...restProps}
				onChange={(event) => {
					event.preventDefault();
				}}
			/>
		);
	},
);

OTPItem.displayName = OTP_ITEM_NAME;

export const OTP = {
	Root: OTPRoot,
	Item: OTPItem,
};
