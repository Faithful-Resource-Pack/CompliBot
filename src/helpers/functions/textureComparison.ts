import stitch from "@images/stitch";
import { magnifyToAttachment } from "@images/magnify";
import { loadImage } from "@napi-rs/canvas";
import {
	Client,
	EmbedBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction,
	Message,
} from "@client";
import { addPathsToEmbed } from "@functions/getTexture";
import { Texture } from "@interfaces";
import axios from "axios";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { template } from "@utility/buttons";
import warnUser from "@helpers/warnUser";

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

	const defaultURL = `${client.tokens.apiUrl}textures/${id}/url/default/latest`;

	const baseImage = await loadImage(defaultURL);
	if (baseImage.width * baseImage.height * displayed.flat().length > 262144) return null;

	// get texture urls into 2d array using the parsed display
	const loadedImages = [];
	for (const packSet of displayed) {
		// had problems with nested async mapping so this is easier for everyone
		loadedImages.push([]);
		for (const pack of packSet) {
			const imgUrl = `${client.tokens.apiUrl}textures/${id}/url/${pack}/latest`;
			try {
				loadedImages.at(-1).push(await loadImage(imgUrl));
			} catch {
				// image doesn't exist yet
			}
		}
	}

	const stitched = await stitch(loadedImages);
	const magnified = await magnifyToAttachment(stitched);

	const embed = new EmbedBuilder()
		.setImage("attachment://magnified.png")
		.setTitle(`[#${result.id}] ${result.name}`)
		.setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${id}`)
		.addFields(addPathsToEmbed(result))
		.setFooter({ text: `Displaying: ${display ?? "All"}` });

	return {
		embeds: [embed],
		files: [magnified],
		components: [new ActionRowBuilder<ButtonBuilder>().addComponents(template)],
	};
}

/**
 * Warn the user that the image is too large
 * @author Evorp
 * @param interaction interaction to reply to
 */
export async function comparisonTooBig(
	interaction:
		| ButtonInteraction
		| ChatInputCommandInteraction
		| StringSelectMenuInteraction
		| Message,
) {
	// force english if it's a message
	return warnUser(
		interaction,
		interaction
			.strings(interaction instanceof Message)
			.command.images.too_big.replace("%ACTION%", "compare"),
		interaction.strings(interaction instanceof Message).command.images.max_size,
	);
}
