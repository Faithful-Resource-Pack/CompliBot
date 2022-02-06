import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "@src/Extended Discord";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	execute: async (interaction: CommandInteraction) => {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		/**
		 * Value is rounded to *really* being able of landing edge (instead of having 1 in 18,446,744,073,709,551,616 of landing edge)
		 */
		interaction
			.reply({
				content: `${
					res > 0.5
						? await interaction.text({ string: "Command.Coin.Heads" })
						: res < 0.5
						? await interaction.text({ string: "Command.Coin.Tails" })
						: await interaction.text({ string: "Command.Coin.Edge" })
				}`,
				fetchReply: true,
			})
			.then((message: Message) => message.deleteButton());
	},
};
