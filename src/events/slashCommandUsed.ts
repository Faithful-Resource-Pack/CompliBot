import { Collection } from "discord.js";
import type { Event } from "@interfaces/events";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { handleError } from "@functions/handleError";
import { colors } from "@utility/colors";

export default {
	name: "slashCommandUsed",
	async execute(client, interaction: ChatInputCommandInteraction) {
		client.storeAction("slashCommand", interaction);

		const command = client.commands.get(interaction.commandName);
		// command doesn't exist
		if (!command) return;

		// ! await required for try catch support
		try {
			// try subcommand
			if (command.execute instanceof Collection) {
				const subcommandName = interaction.options.getSubcommand();
				const subcommand = command.execute.get(subcommandName);
				await subcommand?.(interaction);
			}
			// regular command
			else await command.execute(interaction);
		} catch (err) {
			handleError(client, err, "Slash Command Error");

			const embed = new EmbedBuilder()
				.setTitle(interaction.strings().error.generic)
				.setDescription(
					`${interaction.strings().error.command}\nError for the developers:\n\`\`\`${err}\`\`\``,
				)
				.setColor(colors.red);

			const msgEmbed = interaction.deferred
				? await interaction.followUp({ embeds: [embed], withResponse: true })
				: await interaction
						.reply({ embeds: [embed], withResponse: true })
						.then(({ resource }) => resource.message);

			return msgEmbed.deleteButton();
		}

		// increment command usage
		const count = (client.commandsProcessed.get(interaction.commandName) || 0) + 1;
		client.commandsProcessed.set(interaction.commandName, count);
	},
} as Event;
