import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ChatInputCommandInteraction } from "@client";
import { logConstructor } from "@functions/errorHandler";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Get logs of the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;

		await interaction.deferReply();
		await interaction.editReply({ files: [logConstructor(interaction.client)] }).catch(console.error);
	},
};
