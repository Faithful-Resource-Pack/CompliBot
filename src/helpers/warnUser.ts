import { Message, EmbedBuilder } from "@client";
import type { AnyInteraction } from "@interfaces/interactions";
import { colors } from "@utility/colors";

export async function warnUser(
	interaction: AnyInteraction | Message,
	title: string,
	description: string,
) {
	const args: any = {
		embeds: [new EmbedBuilder().setTitle(title).setDescription(description).setColor(colors.red)],
	};

	// make ephemeral if possible
	if (interaction instanceof Message)
		return interaction.reply(args).then((message: Message) => message.deleteButton());

	// no need for delete button because it's guaranteed ephemeral

	args.ephemeral = true;
	try {
		await interaction.reply(args);
	} catch {
		// deferred
		await interaction.ephemeralReply(args);
	}
}

/**
 * Warn a user that a provided image is too large to perform an action
 * @author Evorp
 * @param interaction interaction to reply to
 */
export async function imageTooBig(interaction: AnyInteraction | Message) {
	// force english if it's a message
	const imageStrings = interaction.strings(interaction instanceof Message).error.image;
	return warnUser(interaction, imageStrings.too_big, imageStrings.max_size);
}
