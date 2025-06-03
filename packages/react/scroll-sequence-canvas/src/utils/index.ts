export const loadImages = async (
	imageUrls: string[],
): Promise<HTMLImageElement[]> => {
	const imagePromises = imageUrls.map(async (src) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		await new Promise<void>((resolve) => {
			img.onload = () => resolve();
			img.src = src;
		});

		if (typeof img.decode === 'function') {
			await img.decode();
		}

		return img;
	});

	return Promise.all(imagePromises);
};
