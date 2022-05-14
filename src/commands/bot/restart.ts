import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("restart").setDescription("Restarts the bot."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (
			await interaction.perms({
				type: "dev",
			})
		)
			return;

		await interaction.reply({ content: "restarting...", ephemeral: true });
		await client.restart(interaction);
	},
};
