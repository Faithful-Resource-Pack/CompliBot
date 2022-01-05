import { Canvas, createCanvas, loadImage } from 'canvas';
import { CommandInteractionOptionResolver, Message, MessageAttachment } from 'discord.js';
import { writeFileSync } from 'fs';
import ExtendedClient from '~/Client';

/**
 * @author nick
 * @param hexColor uses funky regex, can be shorthand (fff|#fff) or full (ffffff|#ffffff)
 */
export async function colorAttachment(color: string, client: ExtendedClient): Promise<MessageAttachment> {
	let hexColor = color;

	//allows rgb shorthand to happen, #f0c => #ff00cc
	if (color.length == 3 || color.length == 4) {
		let r = color.substring(0, 1);
		let g = color.substring(1, 2);
		let b = color.substring(2, 3);
		r += r;
		g += g;
		b += g;
		hexColor = r + g + b;
	}
	let canvas = createCanvas(256, 256);
	const context = canvas.getContext('2d');

	let imageToDraw = await loadImage(`${client.config.images}monochrome_logo.png`).catch((err) => {
		console.trace(err);
		return Promise.reject(err);
	});
	context.drawImage(imageToDraw, 0, 0, canvas.width, canvas.height);

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
				console.log(rgb);
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
				const rgb: number[] = hexToRgb(hexColor);
				something(rgb);

				red[i] = rgb[0];
				green[i] = rgb[1];
				blue[i] = rgb[2];

				alpha[i] = 256; //max the alpha since who cares about transparency lets be real
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
	var result = /^(#|0x)?(?:[0-9a-fA-F]{3}){1,2}$/g.exec(hex); // rolf would be proud xd
	if (result) {
		if (hex.startsWith('0x') || hex.startsWith('#')) {
			hex.replace('0x', '');
			hex.replace('#', '');
		}
		var r = parseInt(hex.substring(0, 2), 16);
		var g = parseInt(hex.substring(2, 4), 16);
		var b = parseInt(hex.substring(4, 6), 16);
		var rgb: number[] = [];
		rgb.push(r, g, b);
		return rgb; //return [23,14,45] -> reformat if needed
	}
	return null;
}
