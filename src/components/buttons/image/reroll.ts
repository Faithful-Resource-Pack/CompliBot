import { Component } from "@interfaces/components";
import { Client, ButtonInteraction, EmbedBuilder } from "@client";

export default {
	id: "reroll",
	async execute(_client: Client, interaction: ButtonInteraction) {
		const res = Math.round(Math.random() * 100) / 100; // round to 2 decimal places

		const message = interaction.message;
		const embed = EmbedBuilder.from(message.embeds[0])
			.setTitle(res > 0.5 ? "Heads" : res < 0.5 ? "Tails" : "Edge?!")
			.setThumbnail(
				`https://database.faithfulpack.net/images/bot/${
					res > 0.5 ? "coin_heads" : res < 0.5 ? "coin_tails" : "coin_edge"
				}.png?w=240&enlarge=1`,
			);

		await message.edit({ embeds: [embed] });
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(interaction.strings().command.coin.reroll.title)
					.setDescription(interaction.strings().command.coin.reroll.description),
			],
			ephemeral: true,
		});
	},
} as Component;
