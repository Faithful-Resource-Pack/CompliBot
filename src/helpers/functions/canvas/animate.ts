import { Canvas, SKRSContext2D, createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { MessageAttachment, MessageEmbed } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import { ISizeCalculationResult } from "image-size/dist/types/interface";
import prismarineMCMETA from "@json/MCMETAs/prismarineMCMETA.json";
import fireMCMETA from "@json/MCMETAs/fireMCMETA.json";
import lavaFlowMCMETA from "@json/MCMETAs/lava_flowMCMETA.json";
import lavaStillMCMETA from "@json/MCMETAs/lava_stillMCMETA.json";
import magmaMCMETA from "@json/MCMETAs/magmaMCMETA.json";
import blankMCMETA from "@json/MCMETAs/blank_animationMCMETA.json";

interface Options {
	url: string;
	mcmeta?: Object;
	name?: string;
	magnify?: boolean;
	embed?: MessageEmbed;
	image?: Image;
	style?: "Prismarine" | "Fire" | "Flowing Lava" | "Still Lava" | "Magma" | "None";
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

	// Setting the MCMETA to the style selected from the loaded JSONs
	// If the MCMETA of a style changes in the future, its respective JSON will need to be updated manually

	switch (style) {
		case "Prismarine":
			mcmeta = prismarineMCMETA;
			break;
		case "Fire":
			mcmeta = fireMCMETA;
			break;
		case "Flowing Lava":
			mcmeta = lavaFlowMCMETA;
			break;
		case "Still Lava":
			mcmeta = lavaStillMCMETA;
			break;
		case "Magma":
			mcmeta = magmaMCMETA;
			break;
		default:
			mcmeta = blankMCMETA;
			break;
	}
	
	// If you want the full explanation for this, go to the animate function, but this version is just used as a flag for an embed
	const MCMETA: any = typeof mcmeta === "object" ? mcmeta : { animation: {} };
	if (!MCMETA.animation) MCMETA.animation = {};
	let frametime: number = MCMETA.animation.frametime || 1;
	let capped: boolean;
	if (frametime > 30) capped = true;

	if (mcmeta != blankMCMETA) embed.addFields([{ name: "MCMETA", value: `\`\`\`json\n${JSON.stringify(mcmeta, null, 4)}\`\`\`` }]);
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
	let ratio: number = Math.round(dimension.height / dimension.width);
	if (ratio < 1) ratio = 1; // This is if someone threw in a really wide image, which they shouldn't, but it would try to do a remainder with 0 and probably cause issues, so this is just a failsafe

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
