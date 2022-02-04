import { Canvas, createCanvas, CanvasRenderingContext2D, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import getMeta from "./getMeta";

export type tileShape = "grid" | "vertical" | "horizontal" | "hollow" | "plus";
interface options {
	url: string;
	name?: string;
	shape?: tileShape;
}

export async function tileAttachment(options: options): Promise<MessageAttachment | null> {
	try {
		const canvas = await tileCanvas(options);
		return new MessageAttachment(canvas.toBuffer("image/png"), `${options.name ? options.name : "tiled"}.png`);
	} catch (err) {
		return null;
	}
}

export function tileCanvas(options: options): Promise<Canvas> {
	return getMeta(options.url)
		.then(async (dimension) => {
			if (dimension.width * dimension.height * 3 > 262144)
				return Promise.reject("Output exeeds the maximum of 512 x 512px²!");

			let canvas: Canvas = createCanvas(dimension.width * 3, dimension.height * 3);
			let context: CanvasRenderingContext2D = canvas.getContext("2d");

			context.imageSmoothingEnabled = false;

			let imageToDraw = await loadImage(options.url);

			/**
			 * Follows this pattern:
			 *  x x x	     x x x      . x .     . x .     . . .
			 *  x x x  ->  x . x  ->  x x x  -> . x . OR  x x x
			 *  x x x	     x x x      . x .     . x .     . . .
			 */
			// base grid
			for (let x = 0; x < 3; x++)
				for (let y = 0; y < 3; y++) context.drawImage(imageToDraw, x * dimension.width, y * dimension.height);

			if (options.shape === "hollow")
				context.clearRect(dimension.width, dimension.height, dimension.width, dimension.height); // middle middle

			if (options.shape === "plus" || options.shape === "horizontal" || options.shape === "vertical") {
				context.clearRect(0, 0, dimension.width, dimension.height); // top left
				context.clearRect(dimension.width * 2, 0, dimension.width, dimension.height); // top right
				context.clearRect(dimension.width * 2, dimension.height * 2, dimension.width, dimension.height); // bottom right
				context.clearRect(0, dimension.height * 2, dimension.width, dimension.height); // bottom left
			}

			if (options.shape === "horizontal") {
				context.clearRect(dimension.width, 0, dimension.width, dimension.height); // top middle
				context.clearRect(dimension.width, dimension.height * 2, dimension.width, dimension.height); // bottom middle
			}

			if (options.shape === "vertical") {
				context.clearRect(dimension.width * 2, dimension.height, dimension.width, dimension.height); // middle left
				context.clearRect(0, dimension.height, dimension.width, dimension.height); // middle right
			}

			return canvas;
		})
		.catch((e) => {
			// todo: add better handling when URL is 404
			return e;
		});
}
