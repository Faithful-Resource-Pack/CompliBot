const { loadImage, createCanvas } = require("@napi-rs/canvas");

/**
 * stitches together an arbitrary number of images
 * @author EwanHowell, Evorp
 * @param {import("@napi-rs/canvas").Image[]} images
 * @param {Number?} gap
 * @returns {Promise<Buffer>}
 */
module.exports = async function stitch(images, gap) {
	const biggestImage = images.reduce((a, e) => (a.width > e.width ? a : e), {
		width: 0,
		height: 0,
	});

	if (gap == null || gap == undefined) {
		// the sizing here is the inverse of magnification so I can't reuse that
		const surface = biggestImage.height * biggestImage.width;
		gap = 1;
		if (surface > 256) gap = 2;
		if (surface > 1024) gap = 4;
		if (surface > 4096) gap = 8;
		if (surface > 65536) gap = 16;
	}

	const allGapsLength = (images.length - 1) * gap;
	const canvas = createCanvas(
		images.length * biggestImage.width + allGapsLength,
		biggestImage.height,
	);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	for (let x = 0; x < images.length; ++x)
		ctx.drawImage(
			images[x],
			x * (biggestImage.width + gap),
			0,
			biggestImage.width,
			biggestImage.height,
		);
	return canvas.toBuffer("image/png");
};
