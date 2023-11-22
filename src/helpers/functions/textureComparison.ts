import stitch from "@images/stitch";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { Image, loadImage, createCanvas, Canvas } from "@napi-rs/canvas";
import { Client, EmbedBuilder } from "@client";
import { addPathsToEmbed } from "@functions/getTexture";
import { AnyPack, GalleryTexture, MCMeta } from "@interfaces/firestorm";
import axios from "axios";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder } from "discord.js";
import { template } from "@utility/buttons";
import { animateToAttachment } from "@helpers/images/animate";

/**
 * Get the corresponding pack IDs for a given display choice
 * @author Evorp
 * @param display displayed packs
 * @returns selected packs
 */
export function parseDisplay(display: string) {
	const PACKS: AnyPack[][] = [
		["default", "faithful_32x", "faithful_64x"],
		["default", "classic_faithful_32x", "classic_faithful_64x"],
		["progart", "classic_faithful_32x_progart"],
	];
	switch (display) {
		case "Faithful":
			return [PACKS[0]];
		case "Classic Faithful Jappa":
			return [PACKS[1]];
		case "Classic Faithful PA":
			return [PACKS[2]];
		case "Jappa":
			return [PACKS[0], PACKS[1]];
		default:
			return PACKS;
	}
}

/**
 * Generate a texture comparison by ID
 * @author Evorp
 * @param client Client used for getting config stuff
 * @param id texture id to look up
 * @returns reply and edit options
 */
export default async function textureComparison(
	client: Client,
	id: string,
	display: string = "all",
) {
	const result: GalleryTexture = (
		await axios.get(`${client.tokens.apiUrl}gallery/modal/${id}/latest`)
	).data;

	const isAnimated = result.paths.filter((p) => p.mcmeta === true).length !== 0;

	let mcmeta: MCMeta;
	if (isAnimated) {
		mcmeta = (await axios.get(`${client.tokens.apiUrl}gallery/modal/${id}/latest`)).data.mcmeta;
	}
	
	const displayed = parseDisplay(display);
	const defaultURL = result.urls.default;

	const dimension = await loadImage(defaultURL);
	if (dimension.width * dimension.height * displayed.flat().length > 262144) return null;

	// get texture urls into 2d array using the parsed display
	const loadedImages: Image[][] = [];
	for (const packSet of displayed) {
		// had problems with nested async mapping so this is easier for everyone
		loadedImages.push([]);
		for (const pack of packSet) {
			const image = result.urls[pack];
			if (!image) continue;
			try {
				loadedImages.at(-1).push(await loadImage(image));
			} catch {
				// image doesn't exist yet
			}
		}
	}

	let canvasArray: Canvas[][][] = [];
	let animatedGif: AttachmentBuilder;

	if (isAnimated) {

		let frameCount: number;
		if (!mcmeta.animation?.height) frameCount = dimension.height / dimension.width;
		else frameCount = dimension.height / mcmeta.animation.height;

		for (const images of loadedImages) {
			canvasArray.push([]);
			for (const image of images) {
				canvasArray.at(-1).push([]);
				let individualHeight = image.height / frameCount;
				for (let i = 0; i < frameCount; ++i) {
					const canvas = createCanvas(image.width, individualHeight);
					const ctx = canvas.getContext("2d");
					ctx.imageSmoothingEnabled = false;
					ctx.clearRect(0, 0, image.width, individualHeight);
					ctx.globalAlpha = 1;
					ctx.globalCompositeOperation = "copy";
		
					ctx.drawImage(
						image, // image
						0,
						individualHeight * i, // sx, sy
						image.width,
						individualHeight, // sWidth, sHeight
						0,
						0, // dx, dy
						image.width,
						individualHeight, // dWidth, dHeight
					);
					canvasArray.at(-1).at(-1).push(canvas);
				}
			}
		}
		let stitchedFrames: Image [][] = [];
		for (let i = 0; i < frameCount; ++i) {
			stitchedFrames.push([]);
			stitchedFrames.at(-1).push(await loadImage(await stitch(canvasArray.map((c) => c.map((c2) => c2[i])))));
		}
		const firstTileSheet = await loadImage(await stitch(stitchedFrames, 0));
		const { magnified } = await magnify(firstTileSheet, { isAnimation: true, factor: 4 }); // 4 was chosen as a middle ground to prevent too much lag
		const imageMagnified = await loadImage(magnified);
		if (!mcmeta.animation) mcmeta.animation = {};
		if (!mcmeta.animation?.height) mcmeta.animation.height = imageMagnified.height / frameCount;
		else mcmeta.animation.height *= 4;
		if (!mcmeta.animation?.width) mcmeta.animation.width = imageMagnified.width;
		else mcmeta.animation.width *= 4;
		animatedGif = await animateToAttachment(magnified, mcmeta);
	}

	let magnified;
	if (!isAnimated) {
		const stitched = await stitch(loadedImages);
		magnified = await magnifyToAttachment(stitched);
	}

	const embed = new EmbedBuilder()
		.setImage(`attachment://${isAnimated ? "animated.gif" : "magnified.png"}`)
		.setTitle(`[#${result.texture.id}] ${result.texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	return {
		embeds: [embed],
		files: [isAnimated ? animatedGif : magnified],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}
