import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import Client from "@src/Client";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	execute: (interaction: CommandInteraction) => {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		/**
		 * Value is rounded to *really* being able of landing edge (instead of having 1 in 18,446,744,073,709,551,616 of landing edge)
		 */
		interaction.reply({ content: `${res > 0.5 ? "Heads!" : res < 0.5 ? "Tails!" : "Edge???!!!"}` });
	},
};
