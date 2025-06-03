import { useCallback, useEffect } from 'react';

interface UseCanvasSizeProps {
	canvasElement: HTMLCanvasElement | null;
	size?: { width: number; height: number };
}

export const useCanvasSize = (props: UseCanvasSizeProps): void => {
	const { canvasElement, size } = props;
	const { width, height } = size || {};

	const updateCanvasSize = useCallback(() => {
		if (!canvasElement) {
			return;
		}

		if (width && height) {
			canvasElement.width = width;
			canvasElement.height = height;
			return;
		}

		if (canvasElement.parentElement) {
			const { clientWidth, clientHeight } = canvasElement.parentElement;
			canvasElement.width = clientWidth;
			canvasElement.height = clientHeight;
		}
	}, [canvasElement, width, height]);

	useEffect(() => {
		updateCanvasSize();
		window.addEventListener('resize', updateCanvasSize);

		return () => {
			window.removeEventListener('resize', updateCanvasSize);
		};
	}, [updateCanvasSize]);
};
