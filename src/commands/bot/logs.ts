import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { constructLogFile } from "@functions/errorHandler";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Get logs of the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		if (!interaction.hasPermission("dev")) return;

		await interaction.deferReply();
		await interaction
			.editReply({ files: [constructLogFile(interaction.client)] })
			.catch(console.error);
	},
};
