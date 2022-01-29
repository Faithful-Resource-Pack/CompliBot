import { APIEmbed } from "discord-api-types";
import { MessageEmbed, MessageEmbedOptions } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	constructor(data?: MessageEmbed | MessageEmbedOptions | APIEmbed) {
		super(data);
		this.setColor("BLURPLE");
	}
}

export default ExtendedEmbed;
