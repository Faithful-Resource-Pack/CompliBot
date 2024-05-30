import type { Event } from "@interfaces/events";
import { ButtonInteraction, EmbedBuilder } from "@client";
import { info } from "@helpers/logger";
import { colors } from "@utility/colors";

export default {
	name: "buttonUsed",
	async execute(client, interaction: ButtonInteraction) {
		client.storeAction("button", interaction);

		if (client.verbose) console.log(`${info}Button used!`);

		if (interaction.customId.startsWith("pollVote__")) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().error.generic)
						.setDescription(interaction.strings().error.polls_removed)
						.setColor(colors.red),
				],
				ephemeral: true,
			});
		}

		const button = client.buttons.get(interaction.customId);
		if (button) return button.execute(client, interaction);
	},
} as Event;
