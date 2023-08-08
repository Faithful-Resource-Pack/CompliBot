import { Canvas, SKRSContext2D, createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { MessageAttachment, MessageEmbed } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import axios from "axios";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

interface Options {
	url: string;
	mcmeta?: Object;
	name?: string;
	magnify?: boolean;
	embed?: MessageEmbed;
	image?: Image;
	style?: "Prismarine" | "Fire" | "Flowing Lava" | "Still Lava" | "Magma";
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

	return await animate(options, options.mcmeta, dimension, baseCanvas);
}

/**
 * Takes in an image and an optional style and will animate the image with the style
 * @author Superboxer47
 * @param options options for the animation
 * @returns animated gif of the provided image as a MessageAttachment and an Embed
 */

export async function animateImage(
	options: Options,
): Promise<[MessageAttachment, MessageEmbed]> {
	const dimension = await getDimensions(options.url);
	const style = options.style;
	const embed = options.embed;
	let mcmeta: any = {};
	let pathName: string = "";

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

	// Setting the pathName to be used from the style selected

	switch (style) {
		case "Prismarine":
			pathName = "prismarine";
			break;
		case "Fire":
			pathName = "fire_0";
			break;
		case "Flowing Lava":
			pathName = "lava_flow";
			break;
		case "Still Lava":
			pathName = "lava_still";
			break;
		case "Magma":
			pathName = "magma";
			break;
		default:
			pathName = "nether_portal" // This is an animated texture with no additional details like frames or frametime, so it's a good default
			break;
	}

	// Getting the mcmeta file from the default repository
	try {
		mcmeta = (
			await axios.get(
				`https://raw.githubusercontent.com/CompliBot/Default-Java/1.20.1/assets/
				minecraft/textures/block/${pathName}.png.mcmeta`,
			)
		).data;
	} catch {
		mcmeta = { __comment: "MCMETA file not found, please check default repository!" };
	}
	
	// If you want the full explanation for this, go to the animate function, but this version is just used as a flag for an embed
	const MCMETA: any = typeof mcmeta === "object" ? mcmeta : { animation: {} };
	if (!MCMETA.animation) MCMETA.animation = {};
	let frametime: number = MCMETA.animation.frametime || 1;
	let capped: boolean;
	if (frametime > 30) capped = true;

	if (pathName !== "nether_portal") embed.addFields([{ name: "MCMETA", value: `\`\`\`json\n${JSON.stringify(mcmeta, null, 4)}\`\`\`` }]);
	if (capped) embed.setFooter({ text: "Frametime capped at 30 to save computing power"});
	return [
		await animate(options, mcmeta, dimension, baseCanvas),
		embed,
	]
}

export async function animate(
	options: Options,
	mcmeta: any,
	dimension: ISizeCalculationResult,
	baseCanvas: Canvas,
	): Promise<MessageAttachment> {

	const canvas: Canvas = createCanvas(dimension.width, dimension.height);
	const context: SKRSContext2D = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	const ratio = Math.round(dimension.height / dimension.width);

	const MCMETA: any = typeof mcmeta === "object" ? mcmeta : { animation: {} };
	if (!MCMETA.animation) MCMETA.animation = {};

	let frametime: number = MCMETA.animation.frametime || 1;
	/* 
	** This next piece of code may seem arbitrary, but it serves a good purpose. Prismarine is the main offendor but there may be more in the future. Prismarine has a frametime of 300 and 22 frames.
	** This means the for loop for interpolation will get run 300 times per frame, so it needs to run 6600 times. This slows down the bot and can even crash it, plus who needs that slow of an animation?
	** The next piece of code checks if the frametime is over 30, and if it is, sets it to 30. This lowers the time in the for loop for any longer frametime animations, saving computing power.
	*/ 
	if (frametime > 30) frametime = 30;

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
	}

	// no interpolation
	else
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

	encoder.finish();
	return new MessageAttachment(
		encoder.out.getData(),
		options.name ? options.name : "animation.gif",
	);
}
