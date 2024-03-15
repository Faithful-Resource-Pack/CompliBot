import stitch from "@images/stitch";
import { magnify, magnifyToAttachment } from "@images/magnify";
import { Image, loadImage, createCanvas, Canvas } from "@napi-rs/canvas";
import { Client, EmbedBuilder } from "@client";
import { addPathsToEmbed } from "@functions/getTexture";
import type { GalleryTexture } from "@interfaces/database";
import axios from "axios";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder } from "discord.js";
import { template } from "@utility/buttons";
import { animateToAttachment, MCMETA } from "@helpers/images/animate";

/**
 * Get the corresponding pack IDs for a given display choice
 * @author Evorp
 * @todo move to pack API using pack tags
 * @param display displayed packs
 * @returns selected packs
 */
export function parseDisplay(display: string) {
	const PACKS = [
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
		case "Classic Faithful":
			return [PACKS[1], PACKS[2]];
		default:
			return PACKS;
	}
}

/**
 * Slices tilesheets into individual frames and calculates the number of frames
 * @author Superboxer47
 * @param loadedImages Array of loaded images
 * @param dimension Base image for dimensions
 * @param mcmeta mcmeta for the texture, used for the dimensions of a single frame
 * @returns 3D array with all of the frames and the number of frames
 */
export function sliceTileSheet(loadedImages: Image[][], dimension: Image, mcmeta: MCMETA) {
	const frameCount: number = !mcmeta.animation?.height
		? dimension.height / dimension.width
		: dimension.height / mcmeta.animation.height; // if height is not specified, assume square image

	const canvasArray: Canvas[][][] = [];
	for (const images of loadedImages) {
		canvasArray.push([]);
		for (const image of images) {
			canvasArray.at(-1).push([]);
			const individualHeight = image.height / frameCount; // height of each frame adjusted for resolution
			for (let i = 0; i < frameCount; ++i) {
				const canvas = createCanvas(image.width, individualHeight); // canvas for each frame adjusted for resolution
				const ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = false;

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
 * @param display which texture sets to display
 * @returns reply and edit options
 */
export default async function compareTexture(client: Client, id: string, display = "all") {
	const result: GalleryTexture = (
		await axios.get(`${client.tokens.apiUrl}gallery/modal/${id}/latest`)
	).data;

	const isAnimated = result.paths.some((p) => p.mcmeta === true);
	const mcmeta: MCMETA = result.mcmeta ?? ({} as MCMETA);
	const displayMcmeta = structuredClone(mcmeta);

	const packs = parseDisplay(display);

	const dimension = await loadImage(result.urls.default).catch(() => null);
	if (!dimension || dimension.width * dimension.height * packs.flat().length > 262144) return null;

	// get texture urls into 2d array using the parsed display
	const loadedImages: Image[][] = [];
	for (const packSet of packs) {
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

	let attachment: AttachmentBuilder;
	if (isAnimated) {
		const { canvasArray, frameCount } = sliceTileSheet(loadedImages, dimension, mcmeta);
		const stitchedFrames: Image[][] = [];
		for (let i = 0; i < frameCount; ++i) {
			// orient the frames vertically so they stitch properly
			stitchedFrames.push([]);
			stitchedFrames.at(-1).push(
				await loadImage(
					// image[i] is the frame of the image
					await stitch(canvasArray.map((imageSet) => imageSet.map((image) => image[i]))),
				),
			);
		}
		const firstTileSheet = await stitch(stitchedFrames, 0);
		const { magnified, factor, height, width } = await magnify(firstTileSheet, {
			isAnimation: true,
		});

		if (!mcmeta.animation) mcmeta.animation = {};

		// scale mcmeta info for new resolution
		mcmeta.animation.height = !mcmeta.animation?.height
			? height / frameCount
			: mcmeta.animation.height * factor;
		mcmeta.animation.width = !mcmeta.animation?.width ? width : mcmeta.animation.width * factor;
		attachment = await animateToAttachment(magnified, mcmeta);
	} else {
		const stitched = await stitch(loadedImages);
		attachment = await magnifyToAttachment(stitched);
	}

	const embed = new EmbedBuilder()
		.setImage(`attachment://${isAnimated ? "animated.gif" : "magnified.png"}`)
		.setTitle(`[#${result.texture.id}] ${result.texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/gallery?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	if (Object.keys(displayMcmeta?.animation ?? {}).length)
		embed.addFields({
			name: "MCMETA",
			value: `\`\`\`json\n${JSON.stringify(displayMcmeta.animation)}\`\`\``,
		});

	return {
		embeds: [embed],
		files: [attachment],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}
