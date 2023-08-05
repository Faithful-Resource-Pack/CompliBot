import { Canvas, SKRSContext2D, createCanvas, loadImage } from "@napi-rs/canvas";
import { MessageAttachment } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import { Client, MessageEmbed } from "@client";
import { formatName, addPathsToEmbed } from "@helpers/sorter";
import TokenJson from "@json/tokens.json";
import axios from "axios";
import { Texture } from "@helpers/interfaces/firestorm";
import { magnify } from "@functions/canvas/magnify";

interface Options {
	url: string;
	mcmeta?: Object;
	framerate?: 4 | 2 | 1 | 0.5 | 0.25;
	pack?: "faithful" | "cfjappa" | "cfpa";
}

/**
 * mini version of magnify specifically built to magnify images one by one in an array
 * @author Superboxer47
 * @param imageURLs array of image urls to magnify
 * @param count number of images to magnify
 * @returns array of canvas images that have been magnified
 */
export async function miniMagnify(
	imageURLs: string[][],
	count: number,
): Promise<Canvas[]> {
	let factor: number[] = [0];
	let canvas: Canvas[] = [createCanvas(1,1)];
	let context: SKRSContext2D[] = [canvas[0].getContext("2d")];
	for (let i = 0; i < count; i++) {
		const dimension = await getDimensions(imageURLs[0][i]);
		const width = dimension.width;
		const height = dimension.height;
		const surface = width * height;
		
		if (surface <= 256) {
			factor[i] = 32; // 16²px or below
		}
		if (surface > 256) {
			factor[i] = 16; // 16²px
		}	
		if (surface > 1024) {
			factor[i] = 8; // 32²px
		}
		if (surface > 4096) {
			factor[i] = 4; // 64²px
		}
		if (surface > 65536) {
			factor[i] = 2; // 128²px
		}
		else if (surface > 262144) {
			factor[i] = 1; // 256²px
		}

		const [newWidth, newHeight] = [width * factor[i], height * factor[i]];
		const imageToDraw = await loadImage(imageURLs[0][i]);
		canvas[i] = createCanvas(newWidth,newHeight);
		context[i] = canvas[i].getContext("2d");
		context[i].imageSmoothingEnabled = false;
		context[i].drawImage(
			imageToDraw,
			0,
			0,
			newWidth,
			newHeight,
		);
	}

	return canvas;
}

/**
 * Turns a 2d array of canvas images into a gif
 * @author Superboxer47
 * @param canvas 2d array of canvas images
 * @param framerate framerate of the gif
 * @returns gif as a message attachment
 */
export async function imagesToGIF(
	canvas: Canvas[],
	framerate: number,
): Promise<MessageAttachment> {
	const encoder = new GIFEncoder(512, 512);
	encoder.start();
	encoder.setTransparent(true);
	encoder.setFrameRate(framerate);
	for (let i = 0; i < canvas.length; i++)
		{
			const context = canvas[i].getContext("2d");
			encoder.addFrame(context);
		}
	encoder.finish();
	return new MessageAttachment(
		encoder.out.getData(),
		"animation.gif",
	);
}

/**
 * Cycles through textures of a specific id
 * @author Evorp & Superboxer47
 * @param client Client used for getting config stuff
 * @param id texture id to look up
 * @param display which texture packs to display
 * @param options options for the embed
 * @returns pre-formatted message embed and the attachment needed in an array, in that order
 */
export async function cycleComparison(
	client: Client,
	id: number | string,
	display: string,
    framerate: number = 1,
): Promise<[MessageEmbed, MessageAttachment]> {
	const tokens = TokenJson;
	const result: Texture = (await axios.get(`${tokens.apiUrl}textures/${id}/all`)).data;

	const PACKS = [
		["default", "faithful_32x", "faithful_64x"],
		["default", "classic_faithful_32x", "classic_faithful_64x"],
		["progart", "classic_faithful_32x_progart"],
	];

	let packText: string;
	let displayed: string[][];
	let displayedCount: number; // This is the number of textures that will be displayed in the embed
	switch (display) {
		case "faithful":
			displayed = [PACKS[0]];
			displayedCount = 3;
			packText = "Faithful";
			break;
		case "cfjappa":
			displayed = [PACKS[1]];
			displayedCount = 3;
			packText = "Classic Faithful Jappa";
			break;
		case "cfpa":
			displayed = [PACKS[2]];
			displayedCount = 2;
			packText = "Classic Faithful Programmer Art";
			break;
	}

	// get texture urls
	let urls = [];
	let i = 0;
	for (let packSet of displayed) {
		urls.push([]);
		for (let pack of packSet) {
			urls[i].push(
				`${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`,
			);
		}
		++i; // can't use forEach because of scope problems (blame js)
	}

	const magnifiedImages = await miniMagnify(urls, displayedCount);
	// for (i = 0; i < displayedCount; i++) {
	// 	const magnifiedImages = (await magnify({ image: await loadImage(urls[i]), name: "magnified.png" }))[0];
	// }
	// const magnified = (await magnify({ image: await loadImage(stitched), name: "magnified.png" }))[0];
	const giffed = await imagesToGIF(magnifiedImages, framerate);
	const embed = new MessageEmbed().setImage("attachment://animation.gif");

	embed
		.setTitle(`[#${result.id}] ${result.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.addFields({ name: 'Pack', value: `${packText}`});
	return [embed, giffed];
}
