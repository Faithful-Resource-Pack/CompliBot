import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, ChatInputCommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot and API latency."),
	async execute(interaction: ChatInputCommandInteraction) {
		let embed = new EmbedBuilder().setTitle(interaction.strings().Command.Ping.Await);
		await interaction.reply({ embeds: [embed] }).then(async () => {
			const d = new Date();
			const quotes = interaction.strings().Command.Ping.Quotes;
			const quote = quotes[Math.floor(Math.random() * quotes.length)];
			embed.setTitle(interaction.strings().Command.Ping.Title).setDescription(
				interaction
					.strings()
					.Command.Ping.Description.replace(
						"QUOTE",
						quote.replace("%YEAR%", (d.getFullYear() + 2).toString()),
					)
					.replace("%LATENCY%", (d.getTime() - interaction.createdTimestamp).toString())
					.replace("%APILATENCY%", Math.round(interaction.client.ws.ping).toString()),
			);

			try {
				interaction
					.editReply({ embeds: [embed] })
					.then((message: Message) => message.deleteButton());
			} catch (err) {
				console.error(err);
			}
		});
	},
};
