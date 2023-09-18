import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "@client";
import { logConstructor } from "@functions/errorHandler";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Get logs of the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async (interaction: CommandInteraction, client: Client) => {
		if (!interaction.hasPermission("dev")) return;

		await interaction.reply({ files: [logConstructor(client)] }).catch(console.error);
	},
};
