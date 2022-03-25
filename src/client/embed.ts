import config from "@json/config.json";
import { APIEmbed } from "discord-api-types";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
		super(data);
		if (data) return; // do not override existing data

		this.setColor("BLURPLE");
		this.setFooter({ text: "CompliBot", iconURL: config.icon });
	}
}

export { ExtendedEmbed };
