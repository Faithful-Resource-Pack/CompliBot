import ConfigJson from "@/config.json";
import { APIEmbed } from "discord-api-types";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
		super(data);
		this.setColor("BLURPLE");
		this.setFooter({ text: "CompliBot", iconURL: ConfigJson.images + "monochrome_logo.png" });
	}
}

export default ExtendedEmbed;
