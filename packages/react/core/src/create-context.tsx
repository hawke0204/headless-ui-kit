import * as React from 'react';

export const createContext = <ContextValueType extends object>(
	rootComponentName: string,
	defaultContextValue: ContextValueType,
) => {
	const Context = React.createContext<ContextValueType>(defaultContextValue);

	const Provider = (
		props: ContextValueType & { children: React.ReactNode },
	) => {
		const { children, ...context } = props;
		// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
		const value = React.useMemo(
			() => context,
			Object.values(context),
		) as ContextValueType;
		return <Context.Provider value={value}>{children}</Context.Provider>;
	};
	Provider.displayName = `${rootComponentName} Provider`;
	const useContext = (consumerName: string) => {
		const context = React.useContext(Context);
		if (context) {
			return context;
		}
		throw new Error(
			`\`${consumerName}\` must be used within \`${rootComponentName}\``,
		);
	};

	return [Provider, useContext] as const;
};
