import { createCanvas, Canvas, Image } from "@napi-rs/canvas";

/**
 * Stitch a 2d array of canvases into one image
 * @author EwanHowell, Evorp
 * @param images pre-loaded canvas images
 * @param gap optionally specify pixel gap
 * @returns canvas buffer with stitched image
 */
export default async function stitch(images: (Canvas | Image)[][], gap = 0) {
	const biggestImage = images
		.flat()
		.reduce((a, e) => (a.width > e.width ? a : e), { width: 0, height: 0 });

	if (gap == null || gap == undefined) {
		const surface = biggestImage.width * biggestImage.height;
		// the gap should be the size of one 16x "pixel"
		gap = 1;
		if (surface > 256) gap = 2;
		if (surface > 1024) gap = 4;
		if (surface > 4096) gap = 8;
		if (surface > 65536) gap = 16;
		if (surface > 262144) gap = 32;
	}

	const longestRow = images.reduce((a, e) => Math.max(a, e.length), 0);
	const canvas = createCanvas(
		// gap count = image length - 1
		longestRow * (biggestImage.width + gap) - gap,
		images.length * (biggestImage.height + gap) - gap,
	);

	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	for (let y = 0; y < images.length; ++y)
		for (let x = 0; x < images[y].length; ++x) {
			ctx.drawImage(
				images[y][x],
				x * (biggestImage.width + gap),
				y * (biggestImage.height + gap),
				biggestImage.width,
				biggestImage.height,
			);
		}
	return canvas.toBuffer("image/png");
}
