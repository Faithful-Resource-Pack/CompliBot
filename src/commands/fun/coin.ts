import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import { colors } from "@helpers/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	execute: async (interaction: CommandInteraction) => {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		var embed = new MessageEmbed()
			.setTitle(
				res > 0.5
					? await interaction.getEphemeralString({ string: "Command.Coin.Heads" })
					: res < 0.5
					? await interaction.getEphemeralString({ string: "Command.Coin.Tails" })
					: await interaction.getEphemeralString({ string: "Command.Coin.Edge" }),
			)
			.setThumbnail(
				res > 0.5
					? "https://database.faithfulpack.net/images/bot/coin_heads.png"
					: res < 0.5
					? "https://database.faithfulpack.net/images/bot/coin_tails.png"
					: "https://database.faithfulpack.net/images/bot/coin_edge.png",
			)
			.setColor(colors.coin);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
