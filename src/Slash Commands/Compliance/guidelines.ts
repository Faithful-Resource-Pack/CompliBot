import { SlashCommand } from "~/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("guidelines")
		.setDescription("Shows the guidelines for the Compliance Resource Pack.")
	,
	execute: async (interaction: CommandInteraction) => {
		await interaction.reply({ content: "https://docs.compliancepack.net/pages/textures/texturing-guidelines" })
	}
};
