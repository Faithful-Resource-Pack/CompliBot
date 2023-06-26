import config from "@json/config.json";
import { APIEmbed } from "discord-api-types/v10.mjs";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
		super(data);
		if (data) return; // do not override existing data

		this.setColor("BLURPLE");
	}
}

export { ExtendedEmbed };
