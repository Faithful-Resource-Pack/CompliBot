import axios from "axios";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { colors } from "@utility/colors";
import { Texture } from "@interfaces/firestorm";

/**
 * Validate and parse a texture name into a series of texture objects
 * @author Evorp, Juknum
 * @param name texture name or id
 * @param interaction what to reply to if not possible
 * @returns texture results
 */
export default async function parseTextureName(
	name: string,
	interaction: ChatInputCommandInteraction,
): Promise<Texture[]> {
	name = name.trim().replace(".png", "").replace("#", "").replace(/ /g, "_");

	if (name.length < 3 && isNaN(Number(name))) {
		await interaction.ephemeralReply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.strings().command.texture.failed_search)
					.setDescription(interaction.strings().command.texture.too_short)
					.setColor(colors.red),
			],
		});
		return;
	}

	let results: any;
	try {
		results = (await axios.get(`${interaction.client.tokens.apiUrl}textures/${name}/all`)).data;
	} catch {
		return [];
	}

	// cast to array if it isn't one already (texture id returns single result)
	const out = Array.isArray(results) ? results : [results];

	if (!out.length) {
		await interaction.ephemeralReply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.strings().command.texture.no_results.title)
					.setDescription(
						interaction
							.strings()
							.command.texture.no_results.description.replace("%TEXTURENAME%", `\`${name}\``),
					)
					.setColor(colors.red),
			],
		});
		return;
	}

	return out;
}
