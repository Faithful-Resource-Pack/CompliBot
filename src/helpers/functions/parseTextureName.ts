import axios from "axios";
import { CommandInteraction, Client } from "@client";

export default async function parseTextureName(
	name: string,
	interaction: CommandInteraction,
): Promise<any[]> {
	name = name.toLowerCase().trim().replace(".png", "").replace("#", "").replace(/ /g, "_");

	if (name.length < 3) {
		interaction.reply({
			content: "You need at least three characters to start a texture search!",
			ephemeral: true,
		});
		return [];
	}

	/**
	 * TODO: find a fix for this Error: connect ETIMEDOUT 172.67.209.9:443 at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1161:16)
	 */
	const results = (
		await axios.get(`${(interaction.client as Client).tokens.apiUrl}textures/${name}/all`)
	).data;

	// if you search by texture id it returns a single object, so you need to cast to an array
	return !isNaN(Number(name)) ? [results] : results;
}
