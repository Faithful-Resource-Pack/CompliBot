import { MessageEmbed } from "@client";
import { Canvas, createCanvas, CanvasRenderingContext2D, loadImage, Image } from "canvas";
import { MessageAttachment } from "discord.js";
import getMeta from "./getMeta";

export type tileShape = "grid" | "vertical" | "horizontal" | "hollow" | "plus";
interface options {
	url: string;
	embed?: MessageEmbed;
	name?: string;
	shape?: tileShape;
	random?: "flip" | "rotation";
}

export async function tileAttachment(options: options): Promise<[MessageAttachment, MessageEmbed]> {
	try {
		const canvas = await tileCanvas(options);
		return [
			new MessageAttachment(canvas.toBuffer("image/png"), `${options.name ? options.name : "tiled.png"}`),
			options.embed,
		];
	} catch (err) {
		return [null, options.embed];
	}
}

export async function tileCanvas(options: options): Promise<Canvas> {
	return getMeta(options.url)
		.then(async (dimension) => {
			if (dimension.width * dimension.height * 3 > 262144)
				return Promise.reject("Output exceeds the maximum of 512 x 512px²!");

			let canvas: Canvas = createCanvas(dimension.width * 3, dimension.height * 3);
			let context: CanvasRenderingContext2D = canvas.getContext("2d");

			context.imageSmoothingEnabled = false;
			let imageToDraw = await loadImage(options.url);

			const drawRotatedImage = (image: Image, x: number, y: number, scale: number, rotation: number) => {
				context.clearRect(x, y, dimension.width, dimension.height);
				context.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
				context.rotate(rotation * (Math.PI / 180));
				context.drawImage(image, -image.width / 2, -image.height / 2);

				context.setTransform(); // reset context position to it's origin
			};
			const drawMirroredImage = (x = 0, y = 0) => {
				context.save();
				context.scale(-1, 1); //scales the entire canvas

				// draw in negative space (* -1) since its flipped by .scale()
				// and account for image width since the corner is also flipped
				context.drawImage(imageToDraw, x * -1 - dimension.width, y);
				context.restore();
			};

			/**
			 * Follows this pattern:
			 *  x x x	     x x x      . x .     . x .     . . .
			 *  x x x  ->    x . x  ->  x x x  -> . x .  OR x x x
			 *  x x x	     x x x      . x .     . x .     . . .
			 */

			if (options.random && options.random === "rotation") {
				const angles = [0, 90, 180, 270];
				for (let x = 0; x < 3; x++) {
					for (let y = 0; y < 3; y++) {
						var angle = angles[Math.floor(Math.random() * angles.length)];
						drawRotatedImage(
							imageToDraw,
							x * dimension.width + dimension.width / 2,
							y * dimension.height + dimension.height / 2,
							1,
							angle,
						);
					}
				}
			}

			// base grid
			else
				for (let x = 0; x < 3; x++) {
					for (let y = 0; y < 3; y++) {
						if (options.random && options.random === "flip" && Math.random() < 0.5) {
							drawMirroredImage(x * dimension.width, y * dimension.height);
						} else context.drawImage(imageToDraw, x * dimension.width, y * dimension.height);
					}
				}
			// context.fillStyle = "#fff";
			// context.fillRect(1 * dimension.width, 1 * dimension.height, dimension.width, dimension.height);
			// if (options.random && options.random === "flip") {
			// 	drawMirroredImage(1 * dimension.width, 1 * dimension.height);
			// } else context.drawImage(imageToDraw, 1 * dimension.width, 1 * dimension.height);

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
			// TODO: add better handling when URL is 404
			return e;
		});
}