import stitch from "@images/stitch";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { Image, loadImage, createCanvas, Canvas } from "@napi-rs/canvas";
import { Client, EmbedBuilder } from "@client";
import { addMCMetaToEmbed, addPathsToEmbed } from "@functions/getTexture";
import { AnyPack, GalleryTexture } from "@interfaces/firestorm";
import axios from "axios";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder } from "discord.js";
import { template } from "@utility/buttons";
import { animateToAttachment, MCMETA } from "@helpers/images/animate";

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

export async function tileSheetArraySlicer(
	loadedImages: Image[][],
	dimension: Image,
	mcmeta: MCMETA,
) {
	const frameCount: number = !mcmeta.animation?.height
		? dimension.height / dimension.width
		: dimension.height / mcmeta.animation.height; // if height is not specified, assume square image
	let canvasArray: Canvas[][][] = [];
	for (const images of loadedImages) {
		canvasArray.push([]);
		for (const image of images) {
			canvasArray.at(-1).push([]);
			let individualHeight = image.height / frameCount; // height of each frame adjusted for resolution
			for (let i = 0; i < frameCount; ++i) {
				const canvas = createCanvas(image.width, individualHeight); // canvas for each frame adjusted for resolution
				const ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = false;
				ctx.clearRect(0, 0, image.width, individualHeight);
				ctx.globalAlpha = 1;
				ctx.globalCompositeOperation = "copy"; // just canvas stuff

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
				canvasArray.at(-1).at(-1).push(canvas); // putting the new frame into the array
			}
		}
	}
	return { canvasArray, frameCount }; // returns the 3D array with all of the frames and the number of frames
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
	const mcmeta: MCMETA = result.mcmeta ?? ({} as MCMETA);
	const displayMCMETA: MCMETA = structuredClone(mcmeta);

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

	let animatedGif: AttachmentBuilder;
	if (isAnimated) {
		const { canvasArray, frameCount } = await tileSheetArraySlicer(loadedImages, dimension, mcmeta);
		let stitchedFrames: Image[][] = [];
		for (let i = 0; i < frameCount; ++i) {
			// This is to orient the frames vertically so they stitch properly
			stitchedFrames.push([]);
			stitchedFrames
				.at(-1)
				.push(await loadImage(await stitch(canvasArray.map((c) => c.map((c2) => c2[i])))));
		}
		const firstTileSheet = await stitch(stitchedFrames, 0);
		const { magnified, factor, height, width } = await magnify(firstTileSheet, {
			isAnimation: true,
		});
		if (!mcmeta.animation) mcmeta.animation = {};
		mcmeta.animation.height = !mcmeta.animation?.height
			? height / frameCount
			: mcmeta.animation.height * factor; // These scale the mcmeta info for the new resolution
		mcmeta.animation.width = !mcmeta.animation?.width ? width : mcmeta.animation.width * factor;
		animatedGif = await animateToAttachment(magnified, mcmeta);
	}

	let magnified;
	if (!isAnimated) {
		const stitched = await stitch(loadedImages);
		magnified = await magnifyToAttachment(stitched);
	}

	let embed = new EmbedBuilder()
		.setImage(`attachment://${isAnimated ? "animated.gif" : "magnified.png"}`)
		.setTitle(`[#${result.texture.id}] ${result.texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	if (Object.keys(displayMCMETA?.animation ?? {}).length) addMCMetaToEmbed(embed, displayMCMETA);

	return {
		embeds: [embed],
		files: [isAnimated ? animatedGif : magnified],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}
