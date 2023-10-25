import { createCanvas, loadImage, Image, DOMMatrix } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import { ImageSource } from "@helpers/getImage";
import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction,
	Message,
} from "@client";

export type TileShape = "grid" | "vertical" | "horizontal" | "hollow" | "plus";
export type TileRandom = "flip" | "rotation";
interface TileOptions {
	shape?: TileShape;
	random?: TileRandom;
}

/**
 * Tile an image
 * @author Juknum
 * @param origin what to tile
 * @param options what shape and randomness
 * @returns tiled image as buffer
 */
export async function tile(origin: ImageSource, options: TileOptions = {}): Promise<Buffer> {
	const input = await loadImage(origin);

	// 1048576px is the same size as a magnified image
	if (input.width * input.height * 3 > 1048576) return null;

	const canvas = createCanvas(input.width * 3, input.height * 3);
	const context = canvas.getContext("2d");

	context.imageSmoothingEnabled = false;

	const drawRotatedImage = (
		image: Image,
		x: number,
		y: number,
		scale: number,
		rotation: number,
	) => {
		context.clearRect(x, y, input.width, input.height);
		context.setTransform(new DOMMatrix([scale, 0, 0, scale, x, y])); // sets scale and origin
		context.rotate(rotation * (Math.PI / 180));
		context.drawImage(image, -image.width / 2, -image.height / 2);

		context.restore(); // reset context position to its origin
	};

	const drawMirroredImage = (x = 0, y = 0) => {
		context.save();
		context.scale(-1, 1); //scales the entire canvas

		// draw in negative space (* -1) since its flipped by .scale()
		// and account for image width since the corner is also flipped
		context.drawImage(input, x * -1 - input.width, y);
		context.restore();
	};

	/**
	 * Follows this pattern:
	 *  x x x	   x x x      . x .      . x .      . . .
	 *  x x x  ->  x . x  ->  x x x  ->  . x .  OR  x x x
	 *  x x x	   x x x      . x .      . x .      . . .
	 */

	if (options?.random == "rotation") {
		// grid to get all possible rotation states matched with each other
		// specific configuration originally by Pomi108
		const angles = [
			[0, 180, 0],
			[90, 0, 270],
			[0, 0, 0],
		];

		for (let x = 0; x < 3; ++x) {
			for (let y = 0; y < 3; ++y) {
				drawRotatedImage(
					input,
					x * input.width + input.width / 2,
					y * input.height + input.height / 2,
					1,
					angles[y][x],
				);
			}
		}
	}

	// base grid
	else
		for (let x = 0; x < 3; ++x) {
			for (let y = 0; y < 3; ++y) {
				if (options?.random == "flip" && Math.random() < 0.5) {
					drawMirroredImage(x * input.width, y * input.height);
				} else context.drawImage(input, x * input.width, y * input.height);
			}
		}

	switch (options.shape) {
		case "hollow":
			context.clearRect(input.width, input.height, input.width, input.height); // middle middle
			break;
		case "plus":
		case "horizontal":
		case "vertical":
			context.clearRect(0, 0, input.width, input.height); // top left
			context.clearRect(input.width * 2, 0, input.width, input.height); // top right
			context.clearRect(input.width * 2, input.height * 2, input.width, input.height); // bottom right
			context.clearRect(0, input.height * 2, input.width, input.height); // bottom left
			break;
		case "horizontal":
			context.clearRect(input.width, 0, input.width, input.height); // top middle
			context.clearRect(input.width, input.height * 2, input.width, input.height); // bottom middle
			break;
		case "vertical":
			context.clearRect(input.width * 2, input.height, input.width, input.height); // middle left
			context.clearRect(0, input.height, input.width, input.height); // middle right
			break;
	}

	return canvas.toBuffer("image/png");
}

/**
 * Tile an image with specified parameters
 * @author Evorp
 * @param origin image to tile
 * @param options how to tile it
 * @param name what the attachment should be called
 * @returns tiled image as sendable attachment
 */
export async function tileToAttachment(
	origin: ImageSource,
	options?: TileOptions,
	name = "tiled.png",
) {
	const buf = await tile(origin, options);
	// image too big so we returned early
	if (!buf) return null;
	return new AttachmentBuilder(buf, { name });
}
