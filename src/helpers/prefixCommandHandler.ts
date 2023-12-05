import { Message } from "@client";
import { magnifyToAttachment } from "@images/magnify";
import getImage, { imageNotFound } from "@images/getImage";
import { tileToAttachment } from "@images/tile";
import { paletteToAttachment } from "@images/palette";
import { magnifyButtons, tileButtons } from "@utility/buttons";
import { imageTooBig } from "@helpers/warnUser";

export default async function prefixCommandHandler(message: Message) {
	const args = message.content.split(" ");

	const command = args.shift().slice(message.client.tokens.prefix.length);

	// when adding a new prefix command remember to register it here
	const prefixCommands = ["m", "z", "t", "p"];

	if (!prefixCommands.includes(command)) return; // just generally using a slash

	const url = await getImage(message);
	if (!url) return imageNotFound(message);

	// super basic prefix command handler for common utilities
	switch (command) {
		case "m":
		case "z":
			return message
				.reply({
					files: [await magnifyToAttachment(url)],
					components: [magnifyButtons],
				})
				.then((message: Message) => message.deleteButton());
		case "t":
			const file = await tileToAttachment(url);
			if (!file) return imageTooBig(message, "tile");
			return message
				.reply({ files: [file], components: [tileButtons] })
				.then((message: Message) => message.deleteButton());
		case "p":
			const [attachment, embed] = await paletteToAttachment(url);
			if (!attachment || !embed) return imageTooBig(message, "palette");
			return message
				.reply({ files: [attachment], embeds: [embed] })
				.then((message: Message) => message.deleteButton());
	}
}
