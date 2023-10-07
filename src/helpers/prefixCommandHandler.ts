import { Message } from "@client";
import { magnifyToAttachment } from "./images/magnify";
import getImage from "./getImage";
import { tileToAttachment } from "./images/tile";
import { paletteToAttachment } from "./images/palette";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { imageButtons, palette } from "./buttons";

export default async function prefixCommandHandler(message: Message) {
	const args = message.content.split(" ");

	const command = args.shift().slice(message.client.tokens.prefix.length);
	const url = await getImage(message);

	// super basic prefix command handler for common utilities
	switch (command) {
		case "m":
		case "z":
			return await message
				.reply({
					files: [await magnifyToAttachment(url)],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(palette)],
				})
				.then((message: Message) => message.deleteButton());
		case "t":
			return await message
				.reply({ files: [await tileToAttachment(url)], components: [imageButtons] })
				.then((message: Message) => message.deleteButton());
		case "p":
			const [attachment, embed] = await paletteToAttachment(url);
			return await message
				.reply({ files: [attachment], embeds: [embed] })
				.then((message: Message) => message.deleteButton());
	}
}
