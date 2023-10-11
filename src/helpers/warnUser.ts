import {
	Message,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction,
	EmbedBuilder,
} from "@client";
import { colors } from "@utility/colors";

export default async function warnUser(
	interaction:
		| ButtonInteraction
		| ChatInputCommandInteraction
		| StringSelectMenuInteraction
		| Message,
	title: string,
	description: string,
) {
	const args: any = {
		embeds: [new EmbedBuilder().setTitle(title).setDescription(description).setColor(colors.red)],
	};

	// make ephemeral if possible
	if (!(interaction instanceof Message)) {
		args.ephemeral = true;
		args.fetchReply = true;
	}

	let reply: Message;
	try {
		reply = await (interaction as ChatInputCommandInteraction).reply(args);
	} catch {
		try {
			// check if deferred
			reply = await (interaction as ChatInputCommandInteraction).editReply(args);
		} catch {
			// follow up if original message not found
			reply = await (interaction as ChatInputCommandInteraction).followUp(args);
		}
	}
	if (interaction instanceof Message) reply.deleteButton();
}
