import { Canvas, createCanvas, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import getMeta from "./getMeta";

type options = {
	url: string | Canvas;
	name?: string;
	factor?: 32 | 16 | 8 | 4 | 2 | 1;
};

export async function magnifyAttachment(options: options): Promise<MessageAttachment> {
	if (options.url instanceof Canvas) {
		let canvas = options.url;

		let factor = options.factor;
		const surface = canvas.width * canvas.height;
		if (factor == undefined) {
			//If no factor was given it tries maximising the image output size

			if (surface <= 256) factor = 32; // 16^2px or below
			if (surface > 256) factor = 16; // 16^2px
			if (surface > 1024) factor = 8; // 32^2px
			if (surface > 4096) factor = 4; // 64^2px
			if (surface > 65636) factor = 2; // 512^2px
			if (surface >= 262144) factor = 1; //no point in magnifying by a scale of 1
		} else if (surface * factor >= 262144) return null; // if a factor was given, it checks if it is over 512^2px

		const context = canvas.getContext("2d");
		context.imageSmoothingEnabled = false;
		let newCanvas = new Canvas(canvas.width * factor, canvas.height * factor);
		let newContext = newCanvas.getContext("2d");
		newContext.imageSmoothingEnabled = false;

		newContext.drawImage(canvas, 0, 0, canvas.width * factor, canvas.height * factor);

		return new MessageAttachment(newCanvas.toBuffer("image/png"), `${options.name ? options.name : "magnified"}.png`);
	} else {
		return getMeta(options.url).then(async (dimension) => {
			let factor = options.factor;
			const surface = dimension.width * dimension.height;
			if (factor == undefined) {
				//If no factor was given it tries maximising the image output size

				if (surface <= 256) factor = 32; // 16^2px or below
				if (surface > 256) factor = 16; // 16^2px
				if (surface > 1024) factor = 8; // 32^2px
				if (surface > 4096) factor = 4; // 64^2px
				if (surface > 65636) factor = 2; // 512^2px
				if (surface >= 262144) factor = 1;
			} else if (surface * factor >= 262144) return null; // if a factor was given, it checks if it is over 512^2px

			const width = dimension.width * factor;
			const height = dimension.height * factor;
			let canvas = createCanvas(width, height);
			const context = canvas.getContext("2d");

			context.imageSmoothingEnabled = false;

			let imageToDraw = await loadImage(options.url as string).catch((err) => {
				console.trace(err);
				return Promise.reject(err);
			});

			context.drawImage(imageToDraw, 0, 0, width, height);
			return new MessageAttachment(canvas.toBuffer("image/png"), `${options.name ? options.name : "magnified.png"}`);
		});
	}
}
