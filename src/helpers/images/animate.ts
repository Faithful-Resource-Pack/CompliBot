import { createCanvas, loadImage } from "@napi-rs/canvas";
import GIFEncoder from "./GIFEncoder";
import { AttachmentBuilder } from "discord.js";
import { ImageSource } from "@helpers/getImage";

export interface MCMETA {
	animation: {
		frametime?: number;
		interpolate?: boolean;
		frames?: (number | { index?: number; time?: number })[];
		height?: number;
		width?: number;
	};
}

/**
 * Animate a given image with a given mcmeta
 * @author Superboxer4, Evorp, Juknum
 * @param origin tilesheet to animate
 * @param mcmeta how you want it animated
 * @returns animated GIF as buffer
 */
export async function animate(origin: ImageSource, mcmeta: MCMETA): Promise<Buffer> {
	const tileSheet = await loadImage(origin);
	if (!mcmeta.animation) mcmeta.animation = {};

	if (!mcmeta.animation?.width) mcmeta.animation.width = tileSheet.width;
	// assume square image if not declared explicitly (baseCanvas.height is full spritesheet)
	if (!mcmeta.animation?.height) mcmeta.animation.height = tileSheet.width;

	// cap frametime at 15 to not crash the bot from rendering 6000 frames of prismarine
	let frametime = mcmeta.animation?.frametime || 1;
	if (frametime > 15) frametime = 15;

	const frames: { index: number; duration: number }[] = [];
	if (mcmeta.animation.frames?.length) {
		// add frames in specified order if possible
		for (let i = 0; i < mcmeta.animation.frames.length; ++i) {
			const frame = mcmeta.animation.frames[i];
			switch (typeof frame) {
				case "number":
					frames.push({ index: frame, duration: frametime });
					break;
				case "object":
					frames.push({ index: frame.index || i, duration: frame.time || frametime });
					break;
				// If wrong frame support is given
				default:
					frames.push({ index: i, duration: frametime });
					break;
			}
		}
	} else {
		// just animate directly downwards if nothing specified
		for (let i = 0; i < tileSheet.height / mcmeta.animation.height; ++i) {
			frames.push({ index: i, duration: frametime });
		}
	}

	// initialize gif encoder and final canvas
	const canvas = createCanvas(mcmeta.animation.width, mcmeta.animation.height);
	const ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	const encoder = new GIFEncoder(mcmeta.animation.width, mcmeta.animation.height);
	encoder.start();
	encoder.setTransparent(true);
	ctx.globalCompositeOperation = "copy";

	if (mcmeta.animation.interpolate) {
		for (let i = 0; i < frames.length; ++i) {
			for (let y = 1; y <= frametime; ++y) {
				ctx.clearRect(0, 0, mcmeta.animation.width, mcmeta.animation.height);
				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = "copy";

				// frame i (always 100% opacity)
				ctx.drawImage(
					tileSheet, // image
					0,
					mcmeta.animation.height * frames[i].index, // sx, sy
					mcmeta.animation.width,
					mcmeta.animation.height, // sWidth, sHeight
					0,
					0, // dx, dy
					mcmeta.animation.width,
					mcmeta.animation.height, // dWidth, dHeight
				);

				ctx.globalAlpha = ((100 / frametime) * y) / 100;
				ctx.globalCompositeOperation = "source-atop";

				// frame i + 1 (transition)
				ctx.drawImage(
					tileSheet, // image
					0,
					mcmeta.animation.height * frames[(i + 1) % frames.length].index, // sx, sy
					mcmeta.animation.width,
					mcmeta.animation.height, // sWidth, sHeight
					0,
					0, // dx, dy
					mcmeta.animation.width,
					mcmeta.animation.height, // dWidth, dHeight
				);
				encoder.addFrame(ctx);
			}
		}
	} else {
		for (let i = 0; i < frames.length; ++i) {
			ctx.clearRect(0, 0, mcmeta.animation.width, mcmeta.animation.height);
			ctx.globalAlpha = 1;

			// see: https://mdn.dev/archives/media/attachments/2012/07/09/225/46ffb06174df7c077c89ff3055e6e524/Canvas_drawimage.jpg
			ctx.drawImage(
				tileSheet, // image
				0,
				mcmeta.animation.height * frames[i].index, // sx, sy
				mcmeta.animation.width,
				mcmeta.animation.height, // sWidth, sHeight
				0,
				0, // dx, dy
				mcmeta.animation.width,
				mcmeta.animation.height, // dWidth, dHeight
			);

			encoder.setDelay(50 * frames[i].duration);
			encoder.addFrame(ctx);
		}
	}

	encoder.finish();
	return encoder.out.getData();
}

/**
 * Animate a given image into a sendable gif
 * @param baseCanvas tilesheet to animate
 * @param mcmeta how to animate it
 * @param name what name the attachment should have
 * @returns sendable gif attachment
 */
export async function animateToAttachment(
	baseCanvas: ImageSource,
	mcmeta: MCMETA,
	name = "animated.gif",
) {
	const buf = await animate(baseCanvas, mcmeta);
	return new AttachmentBuilder(buf, { name });
}
