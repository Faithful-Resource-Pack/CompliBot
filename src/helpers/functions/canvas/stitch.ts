import { createCanvas, loadImage } from "canvas";

/**
 * literally all this code is ripped from the js bot
 * and I genuinely have no idea how it works but it seems to be holding up
 * @param {string[]} urls array of urls
 * @param {number} gap the gap between each texture
 */
export class HorizontalStitcher {
	urls = new Array();
	gap = 0;

	async loadImages() {
		let loadedImages = [];
		for (let url of this.urls) {
			try {
				let tmp = await loadImage(url);
				loadedImages.push(tmp);
			} catch {/* image doesn't exist yet */}
		}
		return loadedImages;
	}

	async draw() {
		const images = await this.loadImages();
		const biggestImage = images.map((can) => {
			return { w: can.naturalWidth, h: can.naturalHeight };
		}).sort((a, b) => b.h * b.w - a.h * a.w)[0];

		const mappedImages = images.map((img) => {
			const ctx = createCanvas(img.naturalWidth, img.naturalHeight).getContext('2d')
            ctx.drawImage(img, 0, 0)

			return {
				image: img,
				data: ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data
			}
		})

		if (!biggestImage) return; // if the image isn't loaded properly return early

		const referenceWidth = biggestImage.w;

		const canvasWidth = biggestImage.w * images.length;
		const canvasHeight = biggestImage.h;

		const canvas = createCanvas(canvasWidth + (this.gap * (mappedImages.length - 1)), canvasHeight);
		const ctx = canvas.getContext("2d");

		let textureImage: any, textureImageData: any, scale: any, xOffset: any, pixelIndex: any, r: any, g: any, b: any, a: any;

		for (let texIndex = 0; texIndex < mappedImages.length; ++texIndex) {
			textureImage = mappedImages[texIndex].image;
			textureImageData = mappedImages[texIndex].data;

			scale = Math.floor(referenceWidth / textureImage.naturalWidth);
			xOffset = referenceWidth * texIndex;
			if (texIndex != 0) xOffset += this.gap * texIndex;
			for (let x = 0; x < textureImage.naturalWidth; ++x) {
				for (let y = 0; y < textureImage.naturalHeight; ++y) {
					pixelIndex = (y * textureImage.naturalWidth + x) * 4;
					r = textureImageData[pixelIndex];
					g = textureImageData[pixelIndex + 1];
					b = textureImageData[pixelIndex + 2];
					a = textureImageData[pixelIndex + 3] / 255;

					ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
					ctx.fillRect(xOffset + x * scale, y * scale, scale, scale);
				}
			}
		}

		return canvas.toBuffer();
	}
}

/**
 * basically just extends HorizontalStitcher to work with multiple rows rather than appending everything sideways
 * this was actual pain to make
 * @author Evorp
 * @param {string[][]} urls two-dimensional array of valid urls
 * @param {number} gap the gap between each texture
*/
export class FullStitcher { // not using inheritance since this is a completely different implementation and doesn't need to load images
	urls = new Array(); // two dimensional array for adding rows and columns
	gap = 0;

	async draw() {
		let resultArray = [];
		for (let images of this.urls) {
			let drawer = new HorizontalStitcher();
			drawer.gap = this.gap;
			drawer.urls = images;
			const result = await drawer.draw();
			resultArray.push(result);
		} // array of horizontally stitched images

		if (!resultArray[1]) return resultArray[0]; // breaks early if CF isn't available or vice versa

		let images = [];
		for (let image of resultArray) {
			let tmp = await loadImage(image);
			images.push(tmp);
		}

		// most of the code from here on out is pretty similar to HorizontalStitcher() but just going the other direction
		const biggestImage = images.map((can) => {
			return { w: can.naturalWidth, h: can.naturalHeight };
		}).sort((a, b) => b.h * b.w - a.h * a.w)[0];

		const mappedImages = images.map((img) => {
			const ctx = createCanvas(img.naturalWidth, img.naturalHeight).getContext('2d')
            ctx.drawImage(img, 0, 0)

			return {
				image: img,
				data: ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data
			}
		})

		const referenceHeight = biggestImage.h;

		const canvasHeight = biggestImage.h * images.length;
		const canvasWidth = biggestImage.w;

		const canvas = createCanvas(canvasWidth + this.gap, canvasHeight + (this.gap * (mappedImages.length - 1)));
		const ctx = canvas.getContext('2d');

		let textureImage: any, textureImageData: any, scale: any, yOffset: any, pixelIndex: any, r: any, g: any, b: any, a: any;

		for (let texIndex = 0; texIndex < mappedImages.length; ++texIndex) {
			textureImage = mappedImages[texIndex].image;
			textureImageData = mappedImages[texIndex].data;

			scale = Math.floor(referenceHeight / textureImage.naturalHeight);
			yOffset = referenceHeight * texIndex;
			if (texIndex != 0) yOffset += this.gap * texIndex;
			for (let y = 0; y < textureImage.naturalHeight; ++y) {
				for (let x = 0; x < textureImage.naturalWidth; ++x) {
					pixelIndex = (y * textureImage.naturalWidth + x) * 4;
					r = textureImageData[pixelIndex];
					g = textureImageData[pixelIndex + 1];
					b = textureImageData[pixelIndex + 2];
					a = textureImageData[pixelIndex + 3] / 255;

					ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a + ")";
					ctx.fillRect(x * scale, yOffset + y * scale, scale, scale);
				}
			}
		}
		return canvas.toBuffer();
	}
}

import { magnify } from "@functions/canvas/magnify";
import { Client, MessageEmbed } from "@client";
import { MessageAttachment } from "discord.js";
import { AddPathsToEmbed } from "@helpers/sorter";
import axios from "axios";

/**
 * More convenient way of getting all compared textures in a nice grid without copy pasting the same code everywhere
 * @author Evorp
 * @param client Client used for getting config stuff
 * @param id texture id to look up
 * @returns pre-formatted message embed and the attachment needed in an array, in that order
 */
export async function textureComparison(client: Client, id: string | number): Promise<[MessageEmbed, MessageAttachment]> {
	const results = (await axios.get(`${client.config.apiUrl}textures/${id}/all`)).data;
	const PACKS = [
		[
			'default',
			'faithful_32x',
			'faithful_64x'
		],
		[
			'classic_faithful_32x',
			'classic_faithful_32x_progart',
			'classic_faithful_64x'
		]
	]
	let stitcher = new FullStitcher();
	let j = 0;
	for (let packSet of PACKS) {
		stitcher.urls.push(new Array());
		for (let pack of packSet) {
			try {
				const textureURL = (await axios.get(`${client.config.apiUrl}textures/${id}/url/${pack}/latest`)).request.res.responseUrl;
				stitcher.urls[j].push(textureURL);
			} catch {/* texture hasn't been made yet */};
		}
		++j; // can't use forEach because of scope problems (blame js)
	}

	stitcher.gap = 4;
	const stitched = await stitcher.draw();
	const magnified = (await magnify({ image: await loadImage(stitched), name: 'magnified.png' }))[0];
	const embed = new MessageEmbed()
		.setTitle(`[#${id}] ${results.name}`)
		.setDescription(`[View texture online](https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id})`)
		.addFields(AddPathsToEmbed(results))
		.setImage('attachment://magnified.png')

	return [embed, magnified]
}