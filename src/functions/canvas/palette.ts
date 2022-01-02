function hexToInt(hex: string) {}

import { createCanvas, loadImage } from 'canvas';
import { ColorResolvable, Message, MessageAttachment, MessageEmbed } from 'discord.js';
import getMeta from './getMeta';

const coloursPerPalette = 10;
const coloursPerLine = 2;
export async function paletteEmbed(url: string, color: ColorResolvable): Promise<MessageEmbed> {
	return getMeta(url)
		.then(async (dimension) => {
			const surface = dimension.width * dimension.height;
			if (surface > 262144) return Promise.reject('Output exeeds the maximum of 512 x 512px²!');

			var canvas = createCanvas(dimension.width, dimension.height).getContext('2d');
			const image = await loadImage(url);
			canvas.drawImage(image, 0, 0);
			var imageData = canvas.getImageData(0, 0, dimension.width, dimension.height).data;

			let total = 0;
			let allColors: any = {};
			let index: number, r: number, g: number, b: number, a: number; //this is why i hate ts lol

			//loops over for every pixel pos in the image
			for (let x = 0; x < dimension.width; x++) {
				for (let y = 0; y < dimension.height; y++) {
					index = (y * dimension.width + x) * 4; // x4 since pixels are stored in 4 bytes, multiply y by width since rows follow eachother.

					r = imageData[index];
					g = imageData[index + 1];
					b = imageData[index + 2];
					a = imageData[index + 3] / 255;

					if (a !== 0 && a != undefined) {
						var hex = rgbToHex(r, g, b);
						if (!(hex in allColors)) {
							allColors[hex] = { hex: hex, opacity: [], rgb: [r, g, b], count: 0 };
							total++;
						}
						++allColors[hex].count;
						allColors[hex].opacity.push(a);
					}
				}
			}

			let colors = Object.values(allColors)
				.sort((a: { count: number }, b: { count: number }) => b.count - a.count)
				.slice(0, coloursPerPalette * 6);
			colors = colors.map((el: { hex: string }) => el.hex);

			let embed = new MessageEmbed();
			let hexArray = [];
			colors.forEach((hex) => {
				hexArray.push(hex);
			});

			const chunked = sliceIntoChunks(hexArray, coloursPerPalette);

			for (let i = 0; i < chunked.length; i++) {
				const lineChunk = sliceIntoChunks(chunked[i], coloursPerLine);
				let chunk: string[] = [];

				lineChunk.forEach((line) => {
					chunk.push(line);
				});

				chunk = chunk.join('`\n`').split(',');
				embed.addField(`Palette ${i + 1}: `, '`' + chunk.join('` `') + '` ', true);
			}
			embed.setTitle(`Colors - ${total}`).setColor(color);
			if (total > 60) embed.setFooter({ text: 'Not all colours are being displayed! The total count is over 60' });
			return embed;
		})
		.catch((e) => {
			console.log(e);
			return e;
		});
}

function paletteImage(imageUrl: string) {}

const palette = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

function rgbToHex(r: number, g: number, b: number) {
	return '#' + ((r | (1 << 8)).toString(16).slice(1) + (g | (1 << 8)).toString(16).slice(1) + (b | (1 << 8)).toString(16).slice(1));
}

function sliceIntoChunks(arr, chunkSize) {
	const res = [];
	for (let i = 0; i < arr.length; i += chunkSize) {
		const chunk = arr.slice(i, i + chunkSize);
		res.push(chunk);
	}
	return res;
}
