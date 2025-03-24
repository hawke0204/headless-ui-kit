import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import { createContext } from './create-context';

describe('createContext', () => {
	it('Provider가 자식 컴포넌트에게 값을 정상적으로 전달해야 함', () => {
		const [Provider, useContext] = createContext('TestComponent', { value: 0 });

		const TestChild = () => {
			const ctx = useContext('TestChild');
			return <div data-testid="value">{ctx.value}</div>;
		};

		const TestRoot = () => (
			<Provider value={42}>
				<TestChild />
			</Provider>
		);

		render(<TestRoot />);
		expect(screen.getByTestId('value')).toHaveTextContent('42');
	});

	it('Provider의 값이 변경되면 자식 컴포넌트가 리렌더링되어야 함', () => {
		const [Provider, useContext] = createContext('TestComponent', { count: 0 });

		const TestChild = () => {
			const ctx = useContext('TestChild');
			return <div data-testid="count">{ctx.count}</div>;
		};

		const TestRoot = ({ count }: { count: number }) => (
			<Provider count={count}>
				<TestChild />
			</Provider>
		);

		const { rerender } = render(<TestRoot count={1} />);
		expect(screen.getByTestId('count')).toHaveTextContent('1');

		rerender(<TestRoot count={2} />);
		expect(screen.getByTestId('count')).toHaveTextContent('2');
	});

	it('Provider 없이 useContext를 사용하면 에러가 발생해야 함', () => {
		const [, useContext] = createContext('TestComponent', { value: 0 });

		const useTestContext = () => useContext('TestComponent');

		expect(() => {
			render(<div>{useTestContext().value}</div>);
		}).toThrow();
	});

	it('중첩된 Provider가 가장 가까운 값을 제공해야 함', () => {
		const [Provider, useContext] = createContext('TestComponent', { value: 0 });

		const TestChild = () => {
			const ctx = useContext('TestChild');
			return <div data-testid="value">{ctx.value}</div>;
		};

		const TestRoot = () => (
			<Provider value={1}>
				<Provider value={2}>
					<TestChild />
				</Provider>
			</Provider>
		);

		render(<TestRoot />);
		expect(screen.getByTestId('value')).toHaveTextContent('2');
	});
});
