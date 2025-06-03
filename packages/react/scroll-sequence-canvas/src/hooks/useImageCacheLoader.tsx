import { useRef, useState, useEffect, useCallback } from 'react';
import { loadImages } from '../utils';

interface UseImageCacheLoaderProps {
	imageUrls: string[];
	onLoad?: () => void;
	onLoadError?: (error: Error) => void;
}

interface UseImageCacheLoaderResult {
	imageCache: HTMLImageElement[];
	isLoaded: boolean;
}

const DEFAULT_IMAGE_CACHE: HTMLImageElement[] = [];

export const useImageCacheLoader = (
	props: UseImageCacheLoaderProps,
): UseImageCacheLoaderResult => {
	const { imageUrls, onLoad, onLoadError } = props;

	const [isLoaded, setIsLoaded] = useState(false);

	const imageCache = useRef<HTMLImageElement[]>(DEFAULT_IMAGE_CACHE);

	const prepareImageCache = useCallback(async () => {
		if (imageUrls.length === 0) {
			setIsLoaded(true);
			return;
		}

		try {
			const loaded = await loadImages(imageUrls);
			imageCache.current = loaded;
			onLoad?.();
		} catch (error) {
			onLoadError?.(error as Error);
		} finally {
			setIsLoaded(true);
		}
	}, [imageUrls, onLoad, onLoadError]);

	useEffect(() => {
		prepareImageCache();

		return () => {
			imageCache.current = DEFAULT_IMAGE_CACHE;
			setIsLoaded(false);
		};
	}, [prepareImageCache]);

	return { imageCache: imageCache.current, isLoaded };
};
