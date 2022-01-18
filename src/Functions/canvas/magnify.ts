import { Canvas, createCanvas, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import getMeta from './getMeta';

export async function magnifyAttachment(urlOrCanvas: string | Canvas): Promise<MessageAttachment> {
	if (urlOrCanvas instanceof Canvas) {
		let canvas = urlOrCanvas;

		let factor = 64;
		const surface = canvas.width * canvas.height;
		if (surface == 256) factor = 32;
		if (surface > 256) factor = 16;
		if (surface > 1024) factor = 8;
		if (surface > 4096) factor = 4;
		if (surface > 65636) factor = 2;
		if (surface > 262144) factor = 1;

		const context = canvas.getContext('2d');

		context.imageSmoothingEnabled = false;
		let newCanvas = new Canvas(canvas.width * factor, canvas.height * factor);
		let newContext = newCanvas.getContext('2d');
		newContext.imageSmoothingEnabled = false;

		newContext.drawImage(canvas, 0, 0, canvas.width * factor, canvas.height * factor);

		return new MessageAttachment(await newCanvas.toBuffer('image/png'), 'magnified.png');
	} else {
		return getMeta(urlOrCanvas).then(async (dimension) => {
			let factor = 64;
			const surface = dimension.width * dimension.height;

			if (surface == 256) factor = 32;
			if (surface > 256) factor = 16;
			if (surface > 1024) factor = 8;
			if (surface > 4096) factor = 4;
			if (surface > 65636) factor = 2;
			if (surface > 262144) factor = 1;

			const width = dimension.width * factor;
			const height = dimension.height * factor;
			let canvas = createCanvas(width, height);
			const context = canvas.getContext('2d');

			context.imageSmoothingEnabled = false;

			let imageToDraw = await loadImage(urlOrCanvas).catch((err) => {
				console.trace(err);
				return Promise.reject(err);
			});

			context.drawImage(imageToDraw, 0, 0, width, height);

			return new MessageAttachment(await canvas.toBuffer('image/png'), 'magnified.png');
		});
	}
}
