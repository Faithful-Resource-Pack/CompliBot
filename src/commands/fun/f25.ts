import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder } from "discord.js";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("f25").setDescription("Transcendent reality."),
	async execute(interaction) {
		interaction
			.reply({
				content: "https://youtu.be/rGmiPTmj8eM",
				withResponse: true,
			});
	},
};
