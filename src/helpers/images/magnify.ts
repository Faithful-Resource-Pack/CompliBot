import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import { ImageSource } from "@images/getImage";

export interface MagnifyOptions {
	isAnimation?: boolean;
	factor?: number;
}

/**
 * The actual magnification function
 * @author Juknum, Evorp
 * @param origin url, image, or buffer to magnify
 * @param options additional options
 * @returns buffer for magnified image
 */
export async function magnify(origin: ImageSource, options: MagnifyOptions = {}) {
	const input = await loadImage(origin);

	// ignore height if tilesheet, otherwise it's not scaled as much
	const surface = options.isAnimation ? input.width ** 2 : input.width * input.height;

	// no custom factor provided
	let factor = 64;
	if (surface <= 256) factor = 32;
	if (surface > 256) factor = 16;
	if (surface > 1024) factor = 8;
	if (surface > 4096) factor = 4;
	if (surface > 65536) factor = 2;
	if (surface > 262144) factor = 1;

	// custom factor provided
	if (options.factor) factor = options.factor;

	const width = input.width * factor;
	const height = input.height * factor;
	const output = createCanvas(width, height);
	const ctx = output.getContext("2d");

	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(input, 0, 0, width, height);
	return { magnified: output.toBuffer("image/png"), width, height, factor };
}

/**
 * Returns discord attachment
 * @author Juknum
 * @param origin url to magnify
 * @param name name, defaults to "magnified.png"
 * @returns magnified file
 */
export async function magnifyToAttachment(
	origin: ImageSource,
	options?: MagnifyOptions,
	name = "magnified.png",
) {
	const { magnified } = await magnify(origin, options);
	return new AttachmentBuilder(magnified, { name });
}
