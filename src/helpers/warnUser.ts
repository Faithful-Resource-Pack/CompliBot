import {
	Message,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction,
	EmbedBuilder,
} from "@client";
import { colors } from "@utility/colors";
import { AllStrings } from "@helpers/strings";

export async function warnUser(
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
	if (interaction instanceof Message)
		return await interaction.reply(args).then((message: Message) => message.deleteButton());

	// no need for delete button because it's guaranteed ephemeral

	args.ephemeral = true;
	try {
		await (interaction as ChatInputCommandInteraction).reply(args);
	} catch {
		// deferred
		await (interaction as ChatInputCommandInteraction).ephemeralReply(args);
	}
}

/**
 * Warn a user that a provided image is too large to perform an action
 * @author Evorp
 * @param interaction interaction to reply to
 */
export async function imageTooBig(
	interaction:
		| ButtonInteraction
		| ChatInputCommandInteraction
		| StringSelectMenuInteraction
		| Message,
	action: keyof AllStrings["command"]["images"]["actions"],
) {
	// force english if it's a message
	const imageStrings = interaction.strings(interaction instanceof Message).command.images;
	return warnUser(
		interaction,
		imageStrings.too_big.replace("%ACTION%", imageStrings.actions[action]),
		imageStrings.max_size,
	);
}
