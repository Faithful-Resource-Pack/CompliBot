import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("shutdown")
		.setDescription("Shuts down the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;
		await interaction.reply({
			embeds: [new EmbedBuilder().setTitle("Shutting down...")],
		});
		return process.exit();
	},
};
