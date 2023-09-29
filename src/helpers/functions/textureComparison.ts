import stitch from "@images/stitch";
import { magnify } from "@images/magnify";
import { loadImage } from "@napi-rs/canvas";
import { Client, EmbedBuilder } from "@client";
import { addPathsToEmbed } from "@helpers/sorter";
import getDimensions from "@images/getDimensions";
import { Texture } from "@interfaces";
import axios from "axios";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { template } from "@helpers/buttons";

/**
 * Get the corresponding pack IDs for a given display choice
 * @author Evorp
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
	id: number | string,
	display: string = "all",
): Promise<any> {
	const result: Texture = (await axios.get(`${client.tokens.apiUrl}textures/${id}/all`)).data;
	const displayed = parseDisplay(display);

	const defaultURL: string = `${client.tokens.apiUrl}textures/${id}/url/default/latest`;

	const dimension = await getDimensions(defaultURL);
	if (dimension.width * dimension.height * displayed.flat().length > 262144) {
		return {
			embeds: [
				new EmbedBuilder()
					.setTitle("Output will be too big!")
					.setDescription(
						"Try specifying which set of packs you want to view to reduce the total image size.",
					),
			],
			components: [],
		};
	}

	// get texture urls
	const loadedImages = [];
	let i = 0;
	for (const packSet of displayed) {
		loadedImages.push([]);
		for (const pack of packSet) {
			const imgUrl = `${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`;
			try {
				loadedImages[i].push(await loadImage(imgUrl));
			} catch {
				// image doesn't exist yet
			}
		}
		++i; // can't use forEach because of scope problems (blame js)
	}

	const longestRow = loadedImages.reduce((acc, item) => Math.max(acc, item.length), 0);
	const stitched = await stitch(loadedImages, longestRow == 3 ? 4 : 2);

	const magnified = (await magnify({ image: await loadImage(stitched), name: "magnified.png" }))[0];

	const embed = new EmbedBuilder()
		.setImage("attachment://magnified.png")
		.setTitle(`[#${result.id}] ${result.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	// empty array overwrites select menu choices if needed
	return {
		embeds: [embed],
		files: [magnified],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}
