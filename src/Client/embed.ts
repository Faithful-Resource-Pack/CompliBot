import { MessageEmbed } from "discord.js";

class ExtendedEmbed extends MessageEmbed {
	private data: any;

	constructor() {
		super();
		this.setColor("BLURPLE");
	}

	public getData(): any {
		return this.data;
	}

	public setData(data: any) {
		this.data = data;
	}
}

export default ExtendedEmbed;
