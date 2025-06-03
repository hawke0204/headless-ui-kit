import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_SCROLL_SENSITIVITY = 60;
const DEFAULT_IMAGE_INDEX = 0;

type UseScrollSequenceProps = {
	imageCache: HTMLImageElement[];
	canvasElement: HTMLCanvasElement | null;
	onComplete?: () => void;
	scrollSensitivity?: number;
};

export const useScrollSequence = (props: UseScrollSequenceProps) => {
	const {
		imageCache,
		canvasElement,
		onComplete,
		scrollSensitivity = DEFAULT_SCROLL_SENSITIVITY,
	} = props;

	const currentImageIndex = useRef(DEFAULT_IMAGE_INDEX);
	const rafId = useRef<number>(0);

	const drawFrame = useCallback(
		(ctx: CanvasRenderingContext2D, img: HTMLImageElement): void => {
			rafId.current = requestAnimationFrame(() => {
				ctx.drawImage(img, 0, 0, img.width, img.height);
			});
		},
		[],
	);

	const updateImage = useCallback(
		(newIndex: number): boolean => {
			const ctx = canvasElement?.getContext('2d')!;
			const img = imageCache[newIndex];
			const isImageLoaded = img?.complete;
			if (!isImageLoaded) {
				return false;
			}

			drawFrame(ctx, img);
			currentImageIndex.current = newIndex;
			return true;
		},
		[canvasElement, drawFrame, imageCache],
	);

	const handleScroll = useCallback((): void => {
		const getValidImageIndex = (): number => {
			const scrollY = window.scrollY;
			const newIndex = Math.abs(Math.floor(scrollY / scrollSensitivity));
			return Math.min(newIndex, imageCache.length - 1);
		};

		const targetIndex = getValidImageIndex();

		const shouldUpdate = targetIndex !== currentImageIndex.current;
		if (shouldUpdate) {
			updateImage(targetIndex);
		}

		const isCompleted = targetIndex === imageCache.length - 1;
		if (isCompleted) {
			onComplete?.();
		}
	}, [scrollSensitivity, updateImage, imageCache.length, onComplete]);

	useEffect(() => {
		updateImage(DEFAULT_IMAGE_INDEX);

		const scrollOptions: AddEventListenerOptions = { passive: true };
		window.addEventListener('scroll', handleScroll, scrollOptions);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (rafId.current) {
				cancelAnimationFrame(rafId.current);
			}
		};
	}, [handleScroll, updateImage]);

	return {
		getCurrentIndex: () => currentImageIndex.current,
		getTotalFrames: () => imageCache.length,
	};
};
