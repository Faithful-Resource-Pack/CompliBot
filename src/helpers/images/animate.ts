import { Canvas, SKRSContext2D, createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import mcmetaList from "@json/mcmetas.json";

interface Options {
	url: string;
	mcmeta?: Object;
	name?: string;
	magnify?: boolean;
	embed?: EmbedBuilder;
	image?: Image;
	style?: keyof typeof mcmetaList;
}

export async function animateAttachment(options: Options): Promise<AttachmentBuilder> {
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
	return await animate(options, options.mcmeta, dimension, baseCanvas);
}

/**
 * Animate image with specified style
 * @author Superboxer47
 * @param options options for the animation
 * @returns animated gif of the provided image
 */
export async function animateImage(options: Options): Promise<[AttachmentBuilder, EmbedBuilder]> {
	const dimension = await getDimensions(options.url);
	const style = options.style;
	const embed = options.embed;

	// Setting the width and height of the canvas to max
	const maxWidth = 512;
	const aspect = dimension.height / dimension.width;
	dimension.height = maxWidth * aspect;
	dimension.width = maxWidth;

	// Making the baseCanvas to be animated
	const baseIMG = await loadImage(options.url);
	const baseCanvas: Canvas = createCanvas(dimension.width, dimension.height);
	const baseContext: SKRSContext2D = baseCanvas.getContext("2d");
	baseContext.imageSmoothingEnabled = false;
	baseContext.drawImage(baseIMG, 0, 0, baseCanvas.width, baseCanvas.height);

	const mcmeta = mcmetaList[style];

	const frametime = (mcmeta as any).animation?.frametime || 1;

	if (style !== "none")
		embed.addFields([
			{ name: "MCMETA", value: `\`\`\`json\n${JSON.stringify(mcmeta.animation)}\`\`\`` },
		]);
	if (frametime > 15) embed.setFooter({ text: "Frametime reduced for optimization!" });

	try {
		return [await animate(options, mcmeta, dimension, baseCanvas), embed];
	} catch {
		return [null, embed];
	}
}

export async function animate(
	options: Options,
	mcmeta: any,
	dimension: ISizeCalculationResult,
	baseCanvas: Canvas,
): Promise<AttachmentBuilder> {
	if (dimension.height > 16384 || dimension.width > 512)
		return Promise.reject("Output is too big!");

	const canvas: Canvas = createCanvas(dimension.width, dimension.height);
	const context: SKRSContext2D = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	let ratio = Math.round(dimension.height / dimension.width);
	if (ratio < 1) ratio = 1; // failsafe for wide images

	mcmeta = typeof mcmeta === "object" ? mcmeta : { animation: {} };
	if (!mcmeta.animation) mcmeta.animation = {};

	let frametime: number = mcmeta.animation.frametime || 1;

	// prismarine would take 6600 iterations without a cap which isn't great for performance
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
					frames.push({ index: frame.index || 1, duration: frame.time || frametime });
					break;
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

	// Draw frames
	const encoder = new GIFEncoder(dimension.width, dimension.width);
	encoder.start();
	encoder.setTransparent(true);

	if (mcmeta.animation.interpolate) {
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
					dimension.width * (frames[i].index % ratio), // sx, sy
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
					dimension.width * (frames[(i + 1) % frames.length].index % ratio), // sx, sy
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
	} else {
		for (let i = 0; i < frames.length; i++) {
			context.clearRect(0, 0, dimension.width, dimension.height);
			context.globalAlpha = 1;

			context.drawImage(
				baseCanvas, // image
				0,
				dimension.width * (frames[i].index % ratio), // sx, sy
				dimension.width,
				dimension.width, // sWidth, sHeight
				0,
				0, // dx, dy
				canvas.width,
				canvas.width, // dWidth, dHeight
			);

			encoder.setDelay(50 * frames[i].duration);
			encoder.addFrame(context);
		}
	}

	encoder.finish();
	return new AttachmentBuilder(encoder.out.getData(), {
		name: options.name ? options.name : "animation.gif",
	});
}
