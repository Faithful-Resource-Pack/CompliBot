import stitch from "@images/stitch";
import { magnifyToAttachment } from "@images/magnify";
import { Image, loadImage } from "@napi-rs/canvas";
import { Client, EmbedBuilder } from "@client";
import { addPathsToEmbed } from "@functions/getTexture";
import { AnyPack, GalleryTexture } from "@interfaces";
import axios from "axios";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { template } from "@utility/buttons";

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

	const displayed = parseDisplay(display);
	const defaultURL = Object.fromEntries(result.urls).default;

	const dimension = await loadImage(defaultURL);
	if (dimension.width * dimension.height * displayed.flat().length > 262144) return null;

	// get texture urls into 2d array using the parsed display
	const loadedImages: Image[][] = [];
	for (const packSet of displayed) {
		// had problems with nested async mapping so this is easier for everyone
		loadedImages.push([]);
		for (const pack of packSet) {
			const image = Object.fromEntries(result.urls)[pack];
			if (!image) continue;
			try {
				loadedImages.at(-1).push(await loadImage(image));
			} catch {
				// image doesn't exist yet
			}
		}
	}

	const stitched = await stitch(loadedImages);
	const magnified = await magnifyToAttachment(stitched);

	const embed = new EmbedBuilder()
		.setImage("attachment://magnified.png")
		.setTitle(`[#${result.texture.id}] ${result.texture.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	return {
		embeds: [embed],
		files: [magnified],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}
