import { Canvas, SKRSContext2D, createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { MessageAttachment } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

interface Options {
	url: string;
	mcmeta?: Object;
	name?: string;
	magnify?: boolean;
	image?: Image;
}

export async function animateAttachment(options: Options): Promise<MessageAttachment> {
	const dimension = await getDimensions(options.url);
	if (options.magnify) {
		let factor: number = 1;
		const surface = dimension.width * dimension.width;

		if (surface <= 256) factor = 32; // 16²px or below
		if (surface > 256) factor = 16; // 16²px
		if (surface > 1024) factor = 8; // 32²px
		if (surface > 4096) factor = 4; // 64²px
		if (surface > 65536) factor = 2;
		// 262144 = 512²px
		else if (surface >= 262144) factor = 1;

		dimension.width *= factor;
		dimension.height *= factor;
	}

	const baseIMG = await loadImage(options.url);
	const baseCanvas: Canvas = createCanvas(dimension.width, dimension.height);
	const baseContext: SKRSContext2D = baseCanvas.getContext("2d");
	baseContext.imageSmoothingEnabled = false;
	baseContext.drawImage(baseIMG, 0, 0, baseCanvas.width, baseCanvas.height);

	// ! TODO: Width & Height properties from MCMETA are not supported yet

	return await animate(options, dimension, baseCanvas);
}




export async function animate(
	options: Options,
	dimension: ISizeCalculationResult,
	baseCanvas: Canvas,
	): Promise<MessageAttachment> {

	const canvas: Canvas = createCanvas(dimension.width, dimension.height);
	const context: SKRSContext2D = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;

	const MCMETA: any = typeof options.mcmeta === "object" ? options.mcmeta : { animation: {} };
	if (!MCMETA.animation) MCMETA.animation = {};

	const frametime: number = MCMETA.animation.frametime || 1;
	const frames = [];

	// MCMETA.animation.frames is defined
	if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
		for (let i = 0; i < MCMETA.animation.frames.length; i++) {
			const frame = MCMETA.animation.frames[i];

			switch (typeof frame) {
				case "number":
					frames.push({ index: frame, duration: frametime });
					break;
				case "object":
					frames.push({ index: frame.index || 1, duration: frame.time || frametime });
					break;
				default:
					frames.push({ index: i, duration: frametime });
					break;
			}
		}
	}

	// MCMETA.animation.frames is not defined
	else
		for (let i = 0; i < dimension.height / dimension.width; i++)
			frames.push({ index: i, duration: frametime });

	// Draw frames
	const encoder = new GIFEncoder(dimension.width, dimension.width);
	encoder.start();
	encoder.setTransparent(true);

	// interpolation
	if (MCMETA.animation.interpolate) {
		let limit: number = frametime;
		for (let i = 0; i < frames.length; i++) {
			for (let y = 1; y <= limit; y++) {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.globalAlpha = 1;
				context.globalCompositeOperation = "copy";

				// frame i (always 100% opacity)
				context.drawImage(
					baseCanvas, // image
					0,
					dimension.width * frames[i].index, // sx, sy
					dimension.width,
					dimension.width, // sWidth, sHeight
					0,
					0, // dx, dy
					canvas.width,
					canvas.width, // dWidth, dHeight
				);

				context.globalAlpha = ((100 / frametime) * y) / 100;
				context.globalCompositeOperation = "source-atop";

				// frame i + 1 (transition)
				context.drawImage(
					baseCanvas, // image
					0,
					dimension.width * frames[(i + 1) % frames.length].index, // sx, sy
					dimension.width,
					dimension.width, // sWidth, sHeight
					0,
					0, // dx, dy
					canvas.width,
					canvas.width, // dWidth, dHeight
				);
				encoder.addFrame(context);
			}
		}
	}

	// no interpolation
	else
		for (let i = 0; i < frames.length; i++) {
			context.clearRect(0, 0, dimension.width, dimension.height);
			context.globalAlpha = 1;

			context.drawImage(
				baseCanvas, // image
				0,
				dimension.width * frames[i].index, // sx, sy
				dimension.width,
				dimension.width, // sWidth, sHeight
				0,
				0, // dx, dy
				canvas.width,
				canvas.width, // dWidth, dHeight
			);

			encoder.setDelay(50 * (frames[i].duration === 1 ? 3 : frames[i].duration));
			encoder.addFrame(context);
		}

	encoder.finish();
	return new MessageAttachment(
		encoder.out.getData(),
		options.name ? options.name : "animation.gif",
	);
}
