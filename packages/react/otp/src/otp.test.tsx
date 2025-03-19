import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { OTP } from './otp';

// OTP Component Tests
describe('OTP 컴포넌트', () => {
	const TestOTP = ({
		otpLength = 6,
		onComplete,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	}: { otpLength?: number; onComplete?: any }) => (
		<OTP.Root otpLength={otpLength} onComplete={onComplete}>
			{({ ref, value, otpItemIndex }) => (
				<OTP.Item
					ref={ref}
					value={value}
					otpItemIndex={otpItemIndex}
					data-testid={`otp-input-${otpItemIndex}`}
				/>
			)}
		</OTP.Root>
	);

	beforeEach(() => {
		vi.useFakeTimers();
	});

	// Length Tests
	describe('OTP 개수', () => {
		// Should render correct number of inputs based on otpLength prop
		it('otpLength prop에 따라 올바른 개수의 입력 필드가 렌더링되어야 함', () => {
			render(<TestOTP otpLength={4} />);
			expect(screen.getAllByTestId(/otp-input-/)).toHaveLength(4);
		});

		// Should use default length of 6 when otpLength is not provided
		it('otpLength가 제공되지 않으면 기본값 6을 사용해야 함', () => {
			render(<TestOTP />);
			expect(screen.getAllByTestId(/otp-input-/)).toHaveLength(6);
		});
	});

	// Input Tests
	describe('입력', () => {
		// Should handle numeric input correctly
		it('숫자 입력이 올바르게 처리되어야 함', () => {
			render(<TestOTP />);
			const firstInput = screen.getByTestId('otp-input-0');

			fireEvent.keyDown(firstInput, { key: '1' });
			expect(firstInput).toHaveValue('1');
		});

		// Should trigger onComplete when all digits are filled
		it('모든 자리가 입력되면 onComplete가 호출되어야 함', () => {
			const onComplete = vi.fn();
			render(<TestOTP otpLength={3} onComplete={onComplete} />);

			const inputs = screen.getAllByTestId(/otp-input-/);
			fireEvent.keyDown(inputs[0], { key: '1' });
			fireEvent.keyDown(inputs[1], { key: '2' });
			fireEvent.keyDown(inputs[2], { key: '3' });

			vi.runAllTimers();
			expect(onComplete).toHaveBeenCalledWith({
				digits: '123',
				reset: expect.any(Function),
			});
		});

		// Should handle backspace correctly
		it('백스페이스가 올바르게 처리되어야 함', () => {
			render(<TestOTP />);

			const inputs = screen.getAllByTestId(/otp-input-/);

			const firstInput = inputs[0];
			const secondInput = inputs[1];

			fireEvent.keyDown(firstInput, { key: '1' });
			fireEvent.keyDown(secondInput, { key: 'Backspace' });
			fireEvent.keyDown(firstInput, { key: 'Backspace' });
			expect(firstInput).toHaveValue('');
		});
	});

	// Focus Tests
	describe('포커스', () => {
		// Should focus next input after entering a digit
		it('숫자 입력 후 다음 입력 필드로 포커스가 이동해야 함', () => {
			render(<TestOTP />);
			const firstInput = screen.getByTestId('otp-input-0');
			const secondInput = screen.getByTestId('otp-input-1');

			fireEvent.keyDown(firstInput, { key: '1' });
			expect(document.activeElement).toBe(secondInput);
		});

		// Should focus previous input on backspace
		it('백스페이스 입력 시 이전 입력 필드로 포커스가 이동해야 함', () => {
			render(<TestOTP />);
			const firstInput = screen.getByTestId('otp-input-0');
			const secondInput = screen.getByTestId('otp-input-1');

			fireEvent.keyDown(firstInput, { key: '1' });
			fireEvent.keyDown(secondInput, { key: 'Backspace' });
			expect(document.activeElement).toBe(firstInput);
		});
	});
});
