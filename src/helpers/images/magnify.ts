import { createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import getDimensions from "./getDimensions";

// taken from loadImage();
export type ImageSource =
	| string
	| URL
	| Buffer
	| ArrayBufferLike
	| Uint8Array
	| Image
	| import("stream").Readable;

/**
 * The actual magnification function
 * @author Juknum, Evorp
 * @param origin url, image, or buffer to magnify
 * @param isAnimation whether to magnify the image as a tilesheet
 * @returns buffer for magnified image
 */
export async function magnify(origin: ImageSource, isAnimation = false) {
	const tmp = await loadImage(origin).catch((err) => Promise.reject(err));

	const dimension =
		typeof origin == "string"
			? await getDimensions(origin)
			: { width: tmp.width, height: tmp.height };

	// ignore height if tilesheet, otherwise it's not scaled as much
	const surface = isAnimation ? dimension.width * 16 : dimension.width * dimension.height;

	let factor = 64;
	if (surface <= 256) factor = 32;
	if (surface > 256) factor = 16;
	if (surface > 1024) factor = 8;
	if (surface > 4096) factor = 4;
	if (surface > 65536) factor = 2;
	if (surface > 262144) factor = 1;

	const width = dimension.width * factor;
	const height = dimension.height * factor;
	const canvasResult = createCanvas(width, height);
	const canvasResultCTX = canvasResult.getContext("2d");

	canvasResultCTX.imageSmoothingEnabled = false;
	canvasResultCTX.drawImage(tmp, 0, 0, width, height);
	return { magnified: canvasResult.toBuffer("image/png"), width, height, factor };
}

/**
 * Returns discord attachment
 * @author Juknum
 * @param origin url to magnify
 * @param name name, defaults to "magnified.png"
 * @returns magnified file
 */
export async function magnifyToAttachment(origin: ImageSource, name = "magnified.png") {
	const { magnified } = await magnify(origin);
	return new AttachmentBuilder(magnified, { name });
}
