const strings = require("../../resources/strings.json");

const { createCanvas, loadImage } = require("@napi-rs/canvas");
const GIFEncoder = require("./GIFEncoder");
const getDimensions = require("./getDimensions");

async function animateAttachment(url, mcmeta, magnify = false) {
	const dimension = await getDimensions(url);
	if (magnify) {
		let factor = 64;
		const surface = dimension.height * dimension.width;

		if (surface == 256) factor = 32; // 16²px or below
		if (surface > 256) factor = 16; // 16²px
		if (surface > 1024) factor = 8; // 32²px
		if (surface > 4096) factor = 4; // 64²px
		if (surface > 65536) factor = 2;
		// 262144 = 512²px
		else if (surface >= 262144) factor = 1;

		dimension.width *= factor;
		dimension.height *= factor;
	}

	const baseImage = await loadImage(url);
	const baseCanvas = createCanvas(dimension.width, dimension.height);
	const baseContext = baseCanvas.getContext("2d");
	baseContext.imageSmoothingEnabled = false;
	baseContext.drawImage(baseImage, 0, 0, baseCanvas.width, baseCanvas.height);

	return await animate(baseCanvas, mcmeta, dimension);
}

async function animate(baseCanvas, mcmeta, dimension) {
	const canvas = createCanvas(dimension.width, dimension.height);
	const context = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	let ratio = Math.round(dimension.height / dimension.width);
	if (ratio < 1) ratio = 1;

	mcmeta = typeof mcmeta === "object" ? mcmeta : { animation: {} };
	if (!mcmeta.animation) mcmeta.animation = {};

	let frametime = mcmeta.animation.frametime || 1;
	if (frametime > 15) frametime = 15;

	const frames = [];

	if (mcmeta.animation.frames?.length) {
		// add frames in specified order if possible
		for (let i = 0; i < mcmeta.animation.frames.length; i++) {
			const frame = mcmeta.animation.frames[i];
			switch (typeof frame) {
				case "number":
					frames.push({ index: frame, duration: frametime });
					break;
				case "object":
					frames.push({ index: frame.index || i, duration: frame.time || frametime });
					break;
				// If wrong frames support is given
				default:
					frames.push({ index: i, duration: frametime });
					break;
			}
		}
	} else {
		// just animate directly downwards if nothing specified
		for (let i = 0; i < dimension.height / dimension.width; i++) {
			frames.push({ index: i, duration: frametime });
		}
	}

	// Draw frames:
	const encoder = new GIFEncoder(dimension.width, dimension.width);
	encoder.start();
	encoder.setTransparent(true);

	context.globalCompositeOperation = "copy";

	if (mcmeta.animation.interpolate) {
		let limit = frametime;
		for (let i = 0; i < frames.length; i++) {
			for (let y = 1; y <= limit; y++) {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.globalAlpha = 1;
				context.globalCompositeOperation = "copy";

				// frame i (always 100% opacity)
				context.drawImage(
					baseCanvas, // image
					0,
					dimension.width * (frames[i].index % ratio), // sx, sy
					dimension.width,
					dimension.width, // sWidth, sHeight
					0,
					0, // dx, dy
					canvas.width,
					canvas.height, // dWidth, dHeight
				);

				context.globalAlpha = ((100 / frametime) * y) / 100;
				context.globalCompositeOperation = "source-atop";

				// frame i + 1 (transition)
				context.drawImage(
					baseCanvas, // image
					0,
					dimension.width * (frames[(i + 1) % frames.length].index % ratio), // sx, sy
					dimension.width,
					dimension.width, // sWidth, sHeight
					0,
					0, // dx, dy
					canvas.width,
					canvas.height, // dWidth, dHeight
				);
				encoder.addFrame(context);
			}
		}
	} else {
		for (let i = 0; i < frames.length; i++) {
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.globalAlpha = 1;

			// see: https://mdn.dev/archives/media/attachments/2012/07/09/225/46ffb06174df7c077c89ff3055e6e524/Canvas_drawimage.jpg
			context.drawImage(
				baseCanvas, // image
				0,
				dimension.width * (frames[i].index % ratio), // sx, sy
				dimension.width,
				dimension.width, // sWidth, sHeight
				0,
				0, // dx, dy
				canvas.width,
				canvas.height, // dWidth, dHeight
			);

			encoder.setDelay(50 * frames[i].duration);
			encoder.addFrame(context);
		}
	}

	encoder.finish();
	return encoder.out.getData();
}

module.exports = {
	animateAttachment,
	animate,
};
