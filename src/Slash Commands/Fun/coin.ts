import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import ExtendedCmdInteraction from "@src/Client/commandInteraction";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	execute: async (interaction: ExtendedCmdInteraction) => {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		/**
		 * Value is rounded to *really* being able of landing edge (instead of having 1 in 18,446,744,073,709,551,616 of landing edge)
		 */
		interaction.reply({
			content: `${
				res > 0.5
					? await interaction.text("Command.Coin.Heads")
					: res < 0.5
					? await interaction.text("Command.Coin.Tails")
					: await interaction.text("Command.Coin.Edge")
			}`,
		});
	},
};
