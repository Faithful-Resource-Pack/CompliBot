import { createCanvas, loadImage, Image, DOMMatrix } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import { ImageSource } from "@images/getImage";
import { magnifyToAttachment } from "@images/magnify";

export type TileShape = "grid" | "vertical" | "horizontal" | "plus";
export type TileRandom = "flip" | "rotation";
export interface TileOptions {
	shape?: TileShape;
	random?: TileRandom;
	magnify?: boolean;
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
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;

	const drawRotatedImage = (
		image: Image,
		x: number,
		y: number,
		scale: number,
		rotation: number,
	) => {
		ctx.setTransform(new DOMMatrix([scale, 0, 0, scale, x, y]));
		ctx.rotate(rotation * (Math.PI / 180)); // cast to radians

		// non-square images get stretched to always fit the canvas size
		const w = rotation % 180 === 0 ? input.width : input.height;
		const h = rotation % 180 === 0 ? input.height : input.width;

		ctx.drawImage(image, -w / 2, -h / 2, w, h);
	};

	const drawMirroredImage = (x = 0, y = 0) => {
		ctx.save();
		ctx.scale(-1, 1); //scales the entire canvas

		// draw in negative space since its flipped by .scale()
		// and account for image width since the corner is also flipped
		ctx.drawImage(input, -x - input.width, y);
		ctx.restore();
	};

	if (options.random == "rotation") {
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
					x * input.width + input.width / 2, // middle of tile
					y * input.height + input.height / 2,
					1,
					angles[y][x],
				);
			}
		}
	}

	// base grid
	else {
		for (let x = 0; x < 3; ++x) {
			for (let y = 0; y < 3; ++y) {
				if (options.random == "flip" && Math.random() < 0.5)
					drawMirroredImage(x * input.width, y * input.height);
				else ctx.drawImage(input, x * input.width, y * input.height);
			}
		}
	}

	switch (options.shape) {
		case "plus":
			ctx.clearRect(0, 0, input.width, input.height); // top left
			ctx.clearRect(input.width * 2, 0, input.width, input.height); // top right
			ctx.clearRect(input.width * 2, input.height * 2, input.width, input.height); // bottom right
			ctx.clearRect(0, input.height * 2, input.width, input.height); // bottom left
			break;
		case "horizontal":
			ctx.clearRect(0, 0, input.width * 3, input.height); // top row
			ctx.clearRect(0, input.height * 2, input.width * 3, input.height); // bottom row
			break;
		case "vertical":
			ctx.clearRect(0, 0, input.width, input.height * 3); // left side
			ctx.clearRect(input.width * 2, 0, input.width, input.height * 3); // right side
			break;
	}

	return canvas.toBuffer("image/png");
}

/**
 * Get the original image back from a tiled grid
 * @author Superboxer47
 * @param origin image to untile
 * @param gridSize size of grid
 * @returns original image as buffer
 */
export async function untile(origin: ImageSource, gridSize = 3): Promise<Buffer> {
	const input = await loadImage(origin);

	const canvas = createCanvas(input.width / gridSize, input.height / gridSize);
	const ctx = canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;

	ctx.drawImage(
		input, // image
		input.width / gridSize,
		input.height / gridSize, // sx, sy
		input.width / gridSize,
		input.height / gridSize, // sWidth, sHeight
		0,
		0, // dx, dy
		input.width / gridSize,
		input.height / gridSize, // dWidth, dHeight
	);

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
	if (options?.magnify) return magnifyToAttachment(buf);
	return new AttachmentBuilder(buf, { name });
}
