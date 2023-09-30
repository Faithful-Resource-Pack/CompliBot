import axios from "axios";
import { ChatInputCommandInteraction, Client, Message, EmbedBuilder } from "@client";
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
		interaction
			.editReply({
				embeds: [
					new EmbedBuilder()
						.setTitle("Action failed!")
						.setDescription("You need at least three characters to start a texture search!")
						.setColor(colors.red),
				],
			})
			.then((message: Message) => message.deleteButton());
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

	// if you search by texture id it returns a single object, so you need to cast to an array
	return !isNaN(Number(name)) ? [results] : results;
}
