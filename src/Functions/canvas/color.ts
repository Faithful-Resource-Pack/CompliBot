import { Canvas, createCanvas, loadImage } from 'canvas';
import { CommandInteractionOptionResolver, Message, MessageAttachment } from 'discord.js';
import { writeFileSync } from 'fs';
import ExtendedClient from '@src/Client';
import { parseColor } from '../parseColor';

/**
 * @author nick
 * @param hexColor uses funky regex, can be shorthand (fff|#fff) or full (ffffff|#ffffff)
 */
export async function colorAttachment(args: string[], client: ExtendedClient): Promise<MessageAttachment> {
	let hexColor = parseColor(args);

	let canvas = createCanvas(256, 256);
	const context = canvas.getContext('2d');

	let imageToDraw = await loadImage(`${client.config.images}monochrome_logo.png`).catch((err) => {
		console.trace(err);
		return Promise.reject(err);
	});
	context.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);
	context.fillStyle = '#ffe';
	context.fillRect(0, 0, canvas.width, canvas.height);
	var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
	var data = imgData.data;

	var red: number[] = [];
	var green: number[] = [];
	var blue: number[] = [];
	var alpha: number[] = [];
	var something = (function (rgb) {
		var executed = false;
		return function (rgb) {
			if (!executed) {
				executed = true;
			}
		};
	})();
	//get current data and modify it
	for (let i = 0; i < data.length; i += 4) {
		red[i] = imgData.data[i];
		green[i] = imgData.data[i + 1];
		blue[i] = imgData.data[i + 2];
		alpha[i] = imgData.data[i + 3];

		// only met when its a fully opaque white pixel
		if (red[i] + green[i] + blue[i] + alpha[i] == 1020) {
			if (hexToRgb(hexColor) != null) {
				const rgba: number[] = hexToRgb(hexColor);
				something(rgba);

				red[i] = rgba[0];
				green[i] = rgba[1];
				blue[i] = rgba[2];

				alpha[i] = rgba[3]; //max the alpha since who cares about transparency lets be real
			} else {
				return Promise.reject('Invalid hex color!');
			}
		} else {
			red[i] = 0;
			blue[i] = 0;
			green[i] = 0;
			alpha[i] = 0;
		}
	}

	for (
		let i = 0;
		i < data.length;
		i += 4 //set data to new pixel values
	) {
		imgData.data[i] = red[i];
		imgData.data[i + 1] = green[i];
		imgData.data[i + 2] = blue[i];
		imgData.data[i + 3] = alpha[i];
	}

	context.putImageData(imgData, 0, 0);
	return new MessageAttachment(canvas.toBuffer('image/png'), 'color.png');
}
function hexToRgb(hex: string) {
	if (hex.startsWith('0x') || hex.startsWith('#')) {
		hex.replace('0x', '');
		hex.replace('#', '');
	}
	var r = parseInt(hex.substring(0, 2), 16);
	var g = parseInt(hex.substring(2, 4), 16);
	var b = parseInt(hex.substring(4, 6), 16);
	var a = parseInt(hex.substring(6, 8), 16);
	var rgba: number[] = [];
	rgba.push(r, g, b, a);
	return rgba; //return [23,14,45] -> reformat if needed
}
