import { Primitive } from 'radix-ui/internal';
import React, { Children } from 'react';

interface ContextValueType {
	otp: string[];
	activeOTPIndex: number;
	handleKeyDown: (event: KeyboardEvent) => void;
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
	onComplete?: (props: {
		digits: string;
		reset: () => void;
	}) => void;
	children: React.ReactNode;
}

const DEFAULT_INDEX = 0;

const isDigit = (event: KeyboardEvent) => /^\d$/.test(event.key);

const isBackspace = (event: KeyboardEvent) => event.key === 'Backspace';

const OTPRoot = React.forwardRef<HTMLFormElement, OTPRootProps>(
	(props, forwardedRef) => {
		const { onComplete, children, ...restProps } = props;
		const otpLength = Children.count(children);
		const [otp, setOTP] = React.useState<string[]>(Array(otpLength).fill(''));
		const [activeOTPIndex, setActiveOTPIndex] =
			React.useState<number>(DEFAULT_INDEX);

		const handleKeyDown = React.useCallback(
			(event: KeyboardEvent) => {
				switch (true) {
					case isDigit(event): {
						const newOTPIndex = Math.min(activeOTPIndex, otpLength - 1);
						if (otp[newOTPIndex] !== '') {
							return;
						}

						const newOtp = [...otp];
						newOtp[newOTPIndex] = event.key;
						setOTP(newOtp);

						if (activeOTPIndex < otpLength - 1) {
							setActiveOTPIndex((prevActiveOTPIndex) => prevActiveOTPIndex + 1);
						}

						if (newOtp.every((digit) => digit !== '')) {
							setTimeout(() => {
								onComplete?.({
									digits: newOtp.join(''),
									reset: () => {
										setOTP(Array(otpLength).fill(''));
										setActiveOTPIndex(DEFAULT_INDEX);
									},
								});
							}, 100);
						}
						break;
					}
					case isBackspace(event): {
						const newOtp = [...otp];
						newOtp[activeOTPIndex] = '';
						setOTP(newOtp);
						setActiveOTPIndex((prevActiveOTPIndex) =>
							Math.max(prevActiveOTPIndex - 1, DEFAULT_INDEX),
						);
						break;
					}
				}
			},
			[activeOTPIndex, onComplete, otp, otpLength],
		);

		return (
			<OTPContext.Provider
				value={{
					otp,
					activeOTPIndex,
					handleKeyDown,
				}}
			>
				<Primitive.form
					tabIndex={0}
					name="form"
					ref={forwardedRef}
					{...restProps}
				>
					{children}
				</Primitive.form>
			</OTPContext.Provider>
		);
	},
);

OTPRoot.displayName = OTP_ROOT_NAME;

const OTP_ITEM_NAME = 'OTPItem';

interface OTPItemProps extends React.HTMLAttributes<HTMLInputElement> {
	index: number;
}

const OTPItem = React.forwardRef<HTMLInputElement, OTPItemProps>((props, _) => {
	const { index, ...restProps } = props;
	const inputRef = React.useRef<HTMLInputElement>(null);
	const { otp, activeOTPIndex, handleKeyDown } = useOTPContext(OTP_ITEM_NAME);
	const currentValue = React.useMemo(() => otp[index], [otp, index]);
	const isActive = React.useMemo(
		() => index === activeOTPIndex,
		[index, activeOTPIndex],
	);

	React.useEffect(() => {
		if (isActive && inputRef?.current) {
			inputRef.current.focus();
			inputRef.current.click();
		}

		return () => {
			if (inputRef?.current) {
				inputRef.current.blur();
			}
		};
	}, [isActive]);

	React.useEffect(() => {
		if (inputRef?.current) {
			inputRef.current.addEventListener('keydown', handleKeyDown);
		}
		return () => {
			if (inputRef?.current) {
				inputRef.current.removeEventListener('keydown', handleKeyDown);
			}
		};
	}, [handleKeyDown]);

	return (
		<Primitive.input
			type="text"
			name="number"
			tabIndex={0}
			inputMode="numeric"
			autoComplete="off"
			readOnly={!isActive}
			ref={inputRef}
			onChange={(event) => {
				event.preventDefault();
			}}
			value={currentValue}
			{...restProps}
		/>
	);
});

OTPItem.displayName = OTP_ITEM_NAME;

export const OTP = {
	Root: OTPRoot,
	Item: OTPItem,
};
