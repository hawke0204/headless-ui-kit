import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { OTP } from './otp';

const hashOtp = async (text: string): Promise<string> => {
	const msgBuffer = new TextEncoder().encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

// OTP Component Tests
describe('OTP 컴포넌트', () => {
	const TestOTP = ({
		onComplete,
	}: {
		onComplete?: (props: { digits: string; reset: () => void }) => void;
	}) => (
		<OTP.Root className="root" onComplete={onComplete}>
			<OTP.Item index={0} data-testid="otp-input-0" />
			<OTP.Item index={1} data-testid="otp-input-1" />
			<OTP.Item index={2} data-testid="otp-input-2" />
			<OTP.Item index={3} data-testid="otp-input-3" />
		</OTP.Root>
	);

	beforeEach(() => {
		vi.useFakeTimers();
	});

	// Rendering Tests
	describe('렌더링', () => {
		// Should render correct number of input fields (4)
		it('지정된 개수(4개)의 입력 필드가 렌더링되어야 함', () => {
			render(<TestOTP />);
			expect(screen.getAllByTestId(/otp-input-/)).toHaveLength(4);
		});
	});

	// Input Tests
	describe('입력', () => {
		// Should handle numeric input correctly
		it('숫자 입력이 올바르게 처리되어야 함', () => {
			render(<TestOTP />);
			const firstInput = screen.getByTestId('otp-input-0');

			fireEvent.keyDown(firstInput, { key: '1' });
			expect(firstInput).toHaveValue('*');
		});

		// Should trigger onComplete when all digits are filled
		it('모든 자리가 입력되면 onComplete가 호출되어야 함', async () => {
			const onComplete = vi.fn();
			render(<TestOTP onComplete={onComplete} />);

			const inputs = screen.getAllByTestId(/otp-input-/);
			inputs.forEach((input, index) => {
				fireEvent.keyDown(input, { key: String(index + 1) });
			});

			const expectedHash = await hashOtp('1234');
			vi.runAllTimers();
			expect(onComplete).toHaveBeenCalledWith({
				digits: expectedHash,
				reset: expect.any(Function),
			});
		});

		// Should handle backspace correctly
		it('백스페이스가 올바르게 처리되어야 함', () => {
			render(<TestOTP />);
			const firstInput = screen.getByTestId('otp-input-0');

			fireEvent.keyDown(firstInput, { key: '1' });
			fireEvent.keyDown(firstInput, { key: 'Backspace' });
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

			fireEvent.keyDown(firstInput, { key: '1' });
			const secondInput = screen.getByTestId('otp-input-1');
			fireEvent.keyDown(secondInput, { key: 'Backspace' });
			expect(document.activeElement).toBe(firstInput);
		});
	});
});
