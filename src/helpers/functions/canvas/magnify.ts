import { MessageEmbed } from "@client";
import { createCanvas, loadImage, Image } from "@napi-rs/canvas";
import { MessageAttachment } from "discord.js";
import getDimensions from "./getDimensions";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

type options = {
	url?: string;
	image?: Image;
	embed?: MessageEmbed;
	name?: string;
	factor?: 32 | 16 | 8 | 4 | 2 | 1 | 0.5 | 0.25;
	orientation?: "portrait" | "landscape" | "none"; // default is none
};

/**
 * magnification from an image url
 */
export async function magnifyAttachment(
	options: options,
): Promise<[MessageAttachment, MessageEmbed]> {
	return getDimensions(options.url).then(async (dimension) => {
		return await magnify(options, dimension);
	});
}

/**
 * magnification from pre-loaded image (can't be MessageAttachment, has to be Image)
 */
export async function magnify(
	options: options,
	dimension?: ISizeCalculationResult,
): Promise<[MessageAttachment, MessageEmbed]> {
	let factor = options.factor;
	if (!dimension) {
		dimension = { width: options.image.width, height: options.image.height };
	}

	// If no factor was given it tries maximizing the image output size
	if (factor == undefined) {
		const surface = dimension.width * dimension.height;

		if (surface <= 256) factor = 32; // 16²px or below
		if (surface > 256) factor = 16; // 16²px
		if (surface > 1024) factor = 8; // 32²px
		if (surface > 4096) factor = 4; // 64²px
		if (surface > 65636) factor = 2;
		// 262144 = 512²px
		else if (surface >= 262144) factor = 1;
	} else if (dimension.width * factor * (dimension.height * factor) > 262144) factor = 1;

	const [width, height] = [dimension.width * factor, dimension.height * factor];
	const imageToDraw = options.url ? await loadImage(options.url) : options.image;

	const canvas = createCanvas(
		options.orientation === undefined ||
			options.orientation === "none" ||
			options.orientation === "portrait"
			? width
			: width * (16 / 9),
		options.orientation === undefined ||
			options.orientation === "none" ||
			options.orientation === "landscape"
			? height
			: height * (16 / 9),
	);

	const context = canvas.getContext("2d");
	context.imageSmoothingEnabled = false;
	context.drawImage(
		imageToDraw,
		options.orientation === undefined ||
			options.orientation === "none" ||
			options.orientation === "portrait"
			? 0
			: (width * (16 / 9)) / 4, // landscape
		options.orientation === undefined ||
			options.orientation === "none" ||
			options.orientation === "landscape"
			? 0
			: (height * (16 / 9)) / 4, // portrait
		width,
		height,
	);

	return [
		new MessageAttachment(
			canvas.toBuffer("image/png"),
			`${options.name ? options.name : "magnified.png"}`,
		),
		options.embed,
	];
}
