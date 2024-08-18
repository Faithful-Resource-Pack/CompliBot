import { Collection } from "discord.js";
import type { Event } from "@interfaces/events";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { handleError } from "@functions/handleError";
import { colors } from "@utility/colors";

export default {
	name: "slashCommandUsed",
	async execute(client, interaction: ChatInputCommandInteraction) {
		client.storeAction("slashCommand", interaction);

		// test if client has this command registered
		if (!client.commands.has(interaction.commandName)) return;
		const command = client.commands.get(interaction.commandName);

		// ! await required for try catch support
		try {
			// try subcommand
			if (command.execute instanceof Collection) {
				const subcommandName = interaction.options.getSubcommand();
				const subcommand = command.execute.get(subcommandName);
				await subcommand(interaction);
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
				? await interaction.followUp({ embeds: [embed], fetchReply: true })
				: await interaction.reply({ embeds: [embed], fetchReply: true });

			return msgEmbed.deleteButton();
		}

		// increment command usage
		const count = (client.commandsProcessed.get(command.data.name) || 0) + 1;
		client.commandsProcessed.set(command.data.name, count);
	},
} as Event;
