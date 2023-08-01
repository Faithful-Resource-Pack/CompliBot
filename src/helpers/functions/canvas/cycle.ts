import { Canvas, SKRSContext2D, createCanvas, loadImage } from "@napi-rs/canvas";
import { MessageAttachment } from "discord.js";
import getDimensions from "./getDimensions";
import GIFEncoder from "./GIFEncoder";
import { Client, MessageEmbed } from "@client";
import { formatName, addPathsToEmbed } from "@helpers/sorter";
import axios from "axios";
import { Texture } from "@helpers/interfaces/firestorm";

interface Options {
	url: string;
	mcmeta?: Object;
	framerate?: 4 | 3 | 2 | 1 | 0.5;
}

/**
 * loads 2d array of texture urls as canvas images
 * @author Evorp
 * @param urls 2d array of urls to load
 * @returns
 */
export async function loadImages(urls: string[][]): Promise<Canvas[][]> {
	let loadedImages = [];
	let i = 0; // forEach() causes a lot of issues with variable scope
	for (let row of urls) {
		loadedImages[i] = [];
		for (let url of row) {
			try {
				let tmp = await loadImage(url);
				loadedImages[i].push(tmp);
			} catch {
				/* texture hasn't been made yet or is invalid */
			}
		}
		++i;
	}
	return loadedImages;
}

/**
 * mini version of magnify specifically built to magnify images one by one in an array
 * @author Superboxer47
 * @param imageURLs array of image urls to magnify
 * @param count number of images to magnify
 * @returns array of canvas images that have been magnified
 */
export async function miniMagnify(
	imageURLs: string[],
	count: number,
): Promise<Canvas[]> {
	let factor: number[];
	let canvas: Canvas[];
	let context: SKRSContext2D[];
	for (let i = 0; i <= (count-1); i++) {
		const dimension = await getDimensions(imageURLs[i]);
		const surface = dimension.width * dimension.height;

		if (surface <= 256) factor[i-1] = 32; // 16²px or below
		if (surface > 256) factor[i] = 16; // 16²px
		if (surface > 1024) factor[i] = 8; // 32²px
		if (surface > 4096) factor[i] = 4; // 64²px
		if (surface > 65536) factor[i] = 2; // 128²px
		else factor[i] = 1; // 256²px

		const [width, height] = [dimension.width * factor[i], dimension.height * factor[i]];
		const imageToDraw = await loadImage(imageURLs[i]);
		canvas[i] = createCanvas(width,height);
		context[i] = canvas[i].getContext("2d");
		context[i].imageSmoothingEnabled = false;
		context[i].drawImage(
			imageToDraw,
			0,
			0,
			width,
			height,
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
	encoder.setDelay(framerate);
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
	display: string = "all",
    framerate: number = 1,
): Promise<[MessageEmbed, MessageAttachment]> {
	const isTemplate: boolean = typeof id == "string" && id.toLowerCase() == "template";
	const result: Texture = (await axios.get(`${client.tokens.apiUrl}textures/${id}/all`)).data;

	const PACKS = [
		["default", "faithful_32x", "faithful_64x"],
		["default", "classic_faithful_32x", "classic_faithful_64x"],
		["progart", "classic_faithful_32x_progart"],
	];

	let displayed: string[][];
	let displayedCount: number; // This is the number of textures that will be displayed in the embed
	switch (display) {
		case "faithful":
		case "f":
			displayed = [PACKS[0]];
			displayedCount = 3;
			break;
		case "cfjappa":
		case "cfj":
			displayed = [PACKS[1]];
			displayedCount = 3;
			break;
		case "cfpa":
		case "pa":
		case "p":
			displayed = [PACKS[2]];
			displayedCount = 2;
			break;
		case "jappa":
		case "j":
			displayed = [PACKS[0], PACKS[1]];
			displayedCount = 6;
			break;
		default:
			displayed = PACKS;
			displayedCount = 8;
			break;
	}

	if (!isTemplate) {
		const defaultURL: string = `${client.tokens.apiUrl}textures/${id}/url/default/latest`;

		const dimension = await getDimensions(defaultURL);
		if (dimension.width * dimension.height > 262144) {
			return [
				new MessageEmbed()
					.setTitle("Output will be too big!")
					.setDescription(
						"Try specifying which set of packs you want to view to reduce the total image size.",
					)
					.setFooter({ text: "Use [#template] for more information!" }),
				null,
			];
		}
	}

	// get texture urls
	let urls = [];
	let i = 0;
	for (let packSet of displayed) {
		urls.push([]);
		for (let pack of packSet) {
			urls[i].push(
				isTemplate
					? formatName(pack, "64")[1]
					: `${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`,
			);
		}
		++i; // can't use forEach because of scope problems (blame js)
	}

	const magnifiedImages = await miniMagnify(urls, displayedCount);
	const giffed = await imagesToGIF(magnifiedImages, framerate);
	const embed = new MessageEmbed().setImage("attachment://animation.gif");

	if (isTemplate)
		embed.setTitle(`Comparison Template`).addFields([
			{
				name: "Add these suffixes to display only a specific group of textures!",
				value:
					"\
					\n- F: Show only Faithful textures \
					\n- CFJ: Show only Classic Faithful Jappa textures \
					\n- CFPA: Show only Classic Faithful Programmer Art textures \
					\n- J: Show only Jappa textures \
					\n- P: Show only Programmer Art textures (currently the same as CFPA)",
			},
		]);
	else
		embed
			.setTitle(`[#${result.id}] ${result.name}`)
			.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
			.addFields(addPathsToEmbed(result))
			.setFooter({ text: "Use [#template] for more information!" });

	return [embed, giffed];
}
