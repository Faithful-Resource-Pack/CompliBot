import { Canvas } from "@napi-rs/canvas";

/**
 * @author EwanHowell
 * @param images pre-loaded canvas images
 * @param gap optionally specify pixel gap
 * @returns canvas buffer with stitched image
 */
export default async function stitch(images: Canvas[][], gap = 0) {
	const img = images.flat().reduce((a, e) => (a.width > e.width ? a : e), { width: 0, height: 0 });
	const length = images.reduce((a, e) => Math.max(a, e.length), 0);
	const vGap = (length - 1) * gap;
	const hGap = (images.length - 1) * gap;
	const width = length * img.width;
	const height = images.length * img.height;
	const tileWidth = Math.floor(width / length);
	const tileHeight = Math.floor(height / images.length);
	const canvas = new Canvas(tileWidth * length + vGap, tileHeight * images.length + hGap);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	for (let y = 0; y < images.length; y++)
		for (let x = 0; x < images[y].length; x++) {
			ctx.drawImage(
				images[y][x],
				x * tileWidth + x * gap,
				y * tileHeight + y * gap,
				tileWidth,
				tileHeight,
			);
		}
	return canvas.toBuffer("image/png");
}
