import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ChatInputCommandInteraction, Client } from "@client";
import { logConstructor } from "@functions/errorHandler";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("logs")
		.setDescription("Get logs of the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;

		await interaction
			.reply({ files: [logConstructor(interaction.client as Client)] })
			.catch(console.error);
	},
};
