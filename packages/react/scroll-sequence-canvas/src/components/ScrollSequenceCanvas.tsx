import { type ReactNode, useRef } from 'react';

import { useImageCacheLoader } from '../hooks/useImageCacheLoader';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useScrollSequence } from '../hooks/useScrollSequence';

interface ScrollSequenceCanvasProps {
	imageUrls: string[];
	size?: { width: number; height: number };
	scrollSensitivity?: number;
	onLoad?: () => void;
	onLoadError?: (error: Error) => void;
	onComplete?: () => void;
	children: (props: {
		canvasRef: React.RefObject<HTMLCanvasElement | null>;
		isLoadedImage: boolean;
		getCurrentImageIndex: () => number;
	}) => ReactNode;
}

export const ScrollSequenceCanvas = (props: ScrollSequenceCanvasProps) => {
	const {
		imageUrls,
		size,
		onLoad,
		onLoadError,
		scrollSensitivity,
		onComplete,
		children,
	} = props;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasElement = canvasRef.current;

	const { imageCache, isLoaded: isLoadedImage } = useImageCacheLoader({
		imageUrls,
		onLoad,
		onLoadError,
	});

	const { getCurrentIndex: getCurrentImageIndex } = useScrollSequence({
		imageCache,
		canvasElement,
		scrollSensitivity,
		onComplete,
	});

	useCanvasSize({ canvasElement, size });

	return children({ canvasRef, isLoadedImage, getCurrentImageIndex });
};

ScrollSequenceCanvas.displayName = 'ScrollSequenceCanvas';
