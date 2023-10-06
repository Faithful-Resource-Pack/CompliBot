import axios from "axios";
import { ChatInputCommandInteraction, Client, EmbedBuilder } from "@client";
import { colors } from "@helpers/colors";
import { Texture } from "@interfaces";

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
	name = name.toLowerCase().trim().replace(".png", "").replace("#", "").replace(/ /g, "_");

	if (name.length < 3 && isNaN(Number(name))) {
		// stupid workaround for already having deferred the message
		await interaction.editReply({ content: "** **" }).then((reply) => reply.delete());

		interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle("Action failed!")
					.setDescription("You need at least three characters to start a texture search!")
					.setColor(colors.red),
			],
			ephemeral: true,
		});
		return;
	}

	let results: any;
	try {
		results = (
			await axios.get(`${(interaction.client as Client).tokens.apiUrl}textures/${name}/all`)
		).data;
	} catch {
		return [];
	}

	// cast to array if it isn't one already (texture id returns single result)
	const out = Array.isArray(results) ? results : [results];

	if (!out.length) {
		await interaction.editReply({ content: "** **" }).then((reply) => reply.delete());

		await interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle("No results found!")
					.setDescription(
						interaction.strings().command.texture.not_found.replace("%TEXTURENAME%", `\`${name}\``),
					)
					.setColor(colors.red),
			],
			ephemeral: true,
		});

		return;
	}

	return out;
}
