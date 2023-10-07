import { Message } from "@client";
import { magnifyToAttachment } from "./images/magnify";
import getImage from "./getImage";
import { tileToAttachment, tileTooBig } from "./images/tile";
import { paletteToAttachment, paletteTooBig } from "./images/palette";
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
			const file = await tileToAttachment(url);
			if (!file) return tileTooBig(message);
			return await message
				.reply({ files: [file], components: [imageButtons] })
				.then((message: Message) => message.deleteButton());
		case "p":
			const [attachment, embed] = await paletteToAttachment(url);
			if (!attachment || !embed) return paletteTooBig(message);
			return await message
				.reply({ files: [attachment], embeds: [embed] })
				.then((message: Message) => message.deleteButton());
	}
}
