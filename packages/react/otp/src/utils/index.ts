import type { KeyboardEvent } from 'react';

export const isDigit = (event: KeyboardEvent): boolean => {
	const key = event.key;
	return /^\d$/.test(key);
};

export const isBackspace = (event: KeyboardEvent): boolean => {
	const key = event.key;
	return key === 'Backspace';
};

export const hashOtp = async (text: string): Promise<string> => {
	try {
		const msgBuffer = new TextEncoder().encode(text);
		const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	} catch (error) {
		console.error('Error hashing OTP:', error);
		throw new Error('Failed to hash OTP');
	}
};

export const maskValue = (value: string): string => (value ? '*' : '');
