import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, ChatInputCommandInteraction } from "@client";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("restart")
		.setDescription("Restarts the bot.")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: async (interaction: ChatInputCommandInteraction, client: Client) => {
		if (!interaction.hasPermission("dev")) return;

		await interaction.reply({ content: "restarting...", ephemeral: true });
		await client.restart(interaction);
	},
};
