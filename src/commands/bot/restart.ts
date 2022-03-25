import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed, CommandInteraction } from "@client";

export const command: SlashCommand = {
	permissions: {
		users: [
			"207471947662098432", // Juknum
			"173336582265241601", // TheRolf
			"473860522710794250", // RobertR11
			"601501288978448411", // Nick
		],
	},
	data: new SlashCommandBuilder().setName("restart").setDescription("Restarts the bot.").setDefaultPermission(false),
	execute: async (interaction: CommandInteraction, client: Client) => {
		await interaction.reply({ content: "restarting...", ephemeral: true });
		client.restart(interaction);
	},
};
