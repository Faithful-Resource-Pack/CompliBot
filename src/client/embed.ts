import { APIEmbed } from "discord-api-types/v10.mjs";
import { Colors, EmbedBuilder, EmbedData } from "discord.js";

export class ExtendedEmbedBuilder extends EmbedBuilder {
	constructor(data?: EmbedData | APIEmbed) {
		super(data);
		if (data) return; // do not override existing data

		this.setColor(Colors.Blurple);
	}
}
