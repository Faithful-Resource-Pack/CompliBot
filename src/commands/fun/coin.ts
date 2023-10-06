import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message, EmbedBuilder } from "@client";
import { colors } from "@helpers/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("coin")
		.setDescription("Flip a coin. Will it be heads? Will it be tails? Who knows?"),
	async execute(interaction: ChatInputCommandInteraction) {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places;

		const embed = new EmbedBuilder()
			.setTitle(res > 0.5 ? "Heads" : res < 0.5 ? "Tails" : "Edge?!")
			.setThumbnail(
				res > 0.5
					? "https://database.faithfulpack.net/images/bot/coin_heads.png?w=240&enlarge=1"
					: res < 0.5
					? "https://database.faithfulpack.net/images/bot/coin_tails.png?w=240&enlarge=1"
					: "https://database.faithfulpack.net/images/bot/coin_edge.png?w=240&enlarge=1",
			)
			.setColor(colors.coin);

		interaction
			.reply({ embeds: [embed], fetchReply: true })
			.then((message: Message) => message.deleteButton());
	},
};
