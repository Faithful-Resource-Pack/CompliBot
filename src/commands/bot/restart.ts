import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("restart").setDescription("Restarts the bot.").setDefaultPermission(false),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (
			await interaction.perms({
				users: ["207471947662098432", "173336582265241601", "601501288978448411", "473860522710794250"],
			})
		)
			return;

		await interaction.reply({ content: "restarting...", ephemeral: true });
		await client.restart(interaction);
	},
};
