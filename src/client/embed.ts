import { EmbedBuilder, EmbedData, APIEmbed } from "discord.js";
import { colors } from "@utility/colors";

/**
 * Automatically sets embed color to blurple
 * @author Nick
 */
export class ExtendedEmbedBuilder extends EmbedBuilder {
	constructor(data?: EmbedData | APIEmbed) {
		super(data);
		if (data) return; // do not override existing data

		this.setColor(colors.blue);
	}
}
