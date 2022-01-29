import { MessageEmbed } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	constructor() {
		super();
		this.setColor("BLURPLE");
	}
}

export default ExtendedEmbed;
