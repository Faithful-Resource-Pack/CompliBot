import { EmbedBuilder, EmbedData, APIEmbed } from "discord.js";
import { colors } from "@utility/colors";

declare module "discord.js" {
	interface EmbedBuilder {
		setColor(color: ColorResolvable | string | null): this;
	}
}

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
