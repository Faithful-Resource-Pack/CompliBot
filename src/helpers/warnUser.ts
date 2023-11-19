import {
	Message,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction,
	EmbedBuilder,
} from "@client";
import { colors } from "@utility/colors";
import { AllStrings } from "./strings";

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
	if (interaction instanceof Message) {
		const reply = await interaction.reply(args);
		console.log("message reply");
		reply.deleteButton();
	} else {
		args.ephemeral = true;

		// no need for delete button because we force ephemeral always
		await (interaction as ChatInputCommandInteraction)
			.reply(args)
			.catch(async () => await (interaction as ChatInputCommandInteraction).ephemeralReply(args));
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
