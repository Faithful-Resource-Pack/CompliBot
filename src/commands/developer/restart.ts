import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ChatInputCommandInteraction } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restarts the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;

		await interaction.reply({ content: "restarting...", ephemeral: true });
		await interaction.client.restart(interaction);
	},
};
