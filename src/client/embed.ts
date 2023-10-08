import { Colors, EmbedBuilder, EmbedData, APIEmbed } from "discord.js";

/**
 * Automatically sets embed color to blurple
 * @author Nick
 */
export class ExtendedEmbedBuilder extends EmbedBuilder {
	constructor(data?: EmbedData | APIEmbed) {
		super(data);
		if (data) return; // do not override existing data

		this.setColor(Colors.Blurple);
	}
}
