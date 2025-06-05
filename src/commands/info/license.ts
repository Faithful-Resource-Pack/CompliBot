import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("license")
		.setDescription("Shows the license for the Faithful Resource Pack."),
	async execute(interaction) {
		interaction
			.reply({ content: "https://faithfulpack.net/license", withResponse: true })
			.then(({ resource }) => resource.message.deleteButton());
	},
};
