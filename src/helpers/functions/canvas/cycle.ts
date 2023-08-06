import { Image, createCanvas, loadImage } from "@napi-rs/canvas";
import { MessageAttachment } from "discord.js";
import GIFEncoder from "./GIFEncoder";
import { Client, MessageEmbed } from "@client";
import { addPathsToEmbed } from "@helpers/sorter";
import axios from "axios";
import { Texture } from "@helpers/interfaces/firestorm";

/**
 * Turns a 2d array of canvas images into a gif
 * @author Superboxer47, EwanHowell, Evorp
 * @param images canvas images to stitch together
 * @param framerate framerate of the gif
 * @returns gif as a message attachment
 */
export async function imagesToGIF(images: Image[], framerate: number): Promise<MessageAttachment> {
	const biggestImage = images.reduce((a, e) => (a.width > e.width ? a : e), {
		width: 0,
		height: 0,
	});

	// magnify all images to an equal size
	let finalWidth: number;
	let finalHeight: number;
	const maxWidth = 512;
	const maxHeight = 512;
	const maxAspect = maxWidth / maxHeight;
	const aspect = biggestImage.width / biggestImage.height;
	if (maxAspect < aspect) {
		finalWidth = maxWidth;
		finalHeight = maxWidth / aspect;
	} else {
		finalHeight = maxHeight;
		finalWidth = maxWidth * aspect;
	}

	const encoder = new GIFEncoder(finalWidth, finalHeight);
	encoder.start();
	encoder.setTransparent(true);
	for (let image of images) {
		// converting the Image() object to a Canvas() object
		const canvas = createCanvas(finalWidth, finalHeight);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(image, 0, 0, finalWidth, finalHeight);
		// interface takes ms but our framerate is in seconds
		encoder.setDelay(1000 * framerate);
		encoder.addFrame(ctx);
	}
	encoder.finish();
	return new MessageAttachment(encoder.out.getData(), "cycled.gif");
}

/**
 * Cycles through textures of a specific id
 * @author Evorp, Superboxer47
 * @param client Client used for getting config stuff
 * @param id texture id to look up
 * @param display which texture packs to display
 * @param framerate speed
 * @returns pre-formatted message embed and the attachment needed in an array, in that order
 */
export async function cycleComparison(
	client: Client,
	id: number | string,
	display: string,
	framerate: number = 1,
): Promise<[MessageEmbed, MessageAttachment]> {
	const result: Texture = (await axios.get(`${client.tokens.apiUrl}textures/${id}/all`)).data;

	let packText: string;
	let displayed: string[];
	switch (display) {
		case "faithful":
			displayed = ["default", "faithful_32x", "faithful_64x"];
			packText = "Faithful";
			break;
		case "cfjappa":
			displayed = ["default", "classic_faithful_32x", "classic_faithful_64x"];
			packText = "Classic Faithful Jappa";
			break;
		case "cfpa":
			displayed = ["progart", "classic_faithful_32x_progart"];
			packText = "Classic Faithful Programmer Art";
			break;
	}

	const embed = new MessageEmbed()
		.setTitle(`[#${result.id}] ${result.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields({ name: "Packs", value: packText }, ...addPathsToEmbed(result));

	let images = [];
	for (let pack of displayed) {
		const url = `${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`;
		try {
			images.push(await loadImage(url));
		} catch {
			/* texture doesn't exist yet */
		}
	}

	const cycled = await imagesToGIF(images, framerate);
	embed.setImage("attachment://cycled.gif");
	return [embed, cycled];
}
