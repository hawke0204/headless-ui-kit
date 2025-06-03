import { useRef } from 'react';

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
}

export const ScrollSequenceCanvas = (props: ScrollSequenceCanvasProps) => {
	const {
		imageUrls,
		size,
		onLoad,
		onLoadError,
		scrollSensitivity,
		onComplete,
	} = props;

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const canvasElement = canvasRef.current;

	const { imageCache } = useImageCacheLoader({
		imageUrls,
		onLoad,
		onLoadError,
	});

	useScrollSequence({
		imageCache,
		canvasElement,
		scrollSensitivity,
		onComplete,
	});

	useCanvasSize({ canvasElement, size });

	return <canvas ref={canvasRef} />;
};

ScrollSequenceCanvas.displayName = 'ScrollSequenceCanvas';
