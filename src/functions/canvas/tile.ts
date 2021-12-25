import { createCanvas, loadImage } from 'canvas';
import { Message, MessageAttachment } from 'discord.js';
import getMeta from './getMeta';

export async function tileAttachment(url: string): Promise<MessageAttachment> {
	return getMeta(url)
		.then(async (dimension) => {
			if (dimension.width * dimension.height * 3 > 262144) return Promise.reject('Output exeeds the maximum of 512 x 512px²!');

			let canvas = createCanvas(dimension.height * 3, dimension.width * 3);
			const context = canvas.getContext('2d');

			context.imageSmoothingEnabled = false;

			let imageToDraw = await loadImage(url).catch((err) => {
				console.trace(err);
				return Promise.reject(err);
			});

			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					context.drawImage(imageToDraw, x * dimension.width, y * dimension.width);
				}
			}

			return new MessageAttachment(await canvas.toBuffer('image/png'), 'tiled.png');
		})
		.catch((e) => {
			return e;
		});
}
