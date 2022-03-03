import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@src/Extended Discord";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	execute: async (interaction: CommandInteraction) => {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		var embed = new MessageEmbed()
			.setTitle(
				res > 0.5
					? await interaction.text({ string: "Command.Coin.Heads" })
					: res < 0.5
					? await interaction.text({ string: "Command.Coin.Tails" })
					: await interaction.text({ string: "Command.Coin.Edge" }),
			)
			.setThumbnail(
				res > 0.5
					? "https://database.compliancepack.net/images/bot/coin_heads.png"
					: res < 0.5
					? "https://database.compliancepack.net/images/bot/coin_tails.png"
					: "https://database.compliancepack.net/images/bot/coin_edge.png",
			)
			.setColor((interaction.client as Client).config.colors.coin);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
