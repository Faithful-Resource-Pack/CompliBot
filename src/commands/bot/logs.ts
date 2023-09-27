import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { Client, ChatInputCommandInteraction } from "@client";
import { logConstructor } from "@functions/errorHandler";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Get logs of the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;

		await interaction.reply({ files: [logConstructor(interaction.client)] }).catch(console.error);
	},
};
