import { MessageEmbed } from "@src/Extended Discord";
import { Canvas, createCanvas, loadImage } from "canvas";
import { MessageAttachment } from "discord.js";
import getMeta from "./getMeta";

type options = {
	url: string;
	embed?: MessageEmbed;
	name?: string;
	factor?: 32 | 16 | 8 | 4 | 2 | 1;
};

export async function magnifyAttachment(options: options): Promise<[MessageAttachment, MessageEmbed]> {
	return getMeta(options.url)
		.then(async (dimension) => {
			let factor = options.factor;

			//If no factor was given it tries maximising the image output size
			if (factor == undefined) {
				const surface = dimension.width * dimension.height;

				if (surface <= 256) factor = 32; // 16^2px or below
				if (surface > 256) factor = 16; // 16^2px
				if (surface > 1024) factor = 8; // 32^2px
				if (surface > 4096) factor = 4; // 64^2px
				if (surface > 65636) factor = 2; // 512^2px
				else if (surface >= 262144) factor = 1;
			}

			const [width, height] = [dimension.width * factor, dimension.height * factor];
			const canvas = createCanvas(width, height);
			const context = canvas.getContext("2d");

			context.imageSmoothingEnabled = false;
			const imageToDraw = await loadImage(options.url as string);

			context.drawImage(imageToDraw, 0, 0, width, height);
			return [new MessageAttachment(canvas.toBuffer("image/png"), `${options.name ? options.name : "magnified.png"}`), options.embed];
		});
}
