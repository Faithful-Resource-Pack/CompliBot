import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { EmbedBuilder, ChatInputCommandInteraction, Message } from "@client";
import { ping } from "@json/quotes.json";
import * as Random from "@utility/random";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot and API latency."),
	async execute(interaction: ChatInputCommandInteraction) {
		const quote = Random.choice(ping);

		// NEVER USE AWAIT ASYNC
		// only send response to maximize response time
		interaction
			.reply({ content: "** **", fetchReply: true })
			.then((msg) => {
				const apiPing = interaction.client.ws.ping;
				const botPing = msg.createdTimestamp - interaction.createdTimestamp;

				const embed = new EmbedBuilder()
					.setTitle("Pong!")
					.setDescription(`_${quote.replace("%YEAR%", String(new Date().getFullYear() + 2))}_`)
					.addFields(
						{ name: "Bot Latency", value: `${botPing}ms`, inline: true },
						{ name: "API Latency", value: `${Math.round(apiPing)}ms`, inline: true },
					);

				return interaction.editReply({ embeds: [embed] });
			})
			.then((message: Message) => message.deleteButton());
	},
};
