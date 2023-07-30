import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed, CommandInteraction, Message } from "@client";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Gets the Bot and API latency."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let embed = new MessageEmbed().setTitle(
			await interaction.getEphemeralString({ string: "Command.Ping.Await" }),
		);
		await interaction.reply({ embeds: [embed] }).then(async () => {
			const d: Date = new Date();
			const quotes = (
				await interaction.getEphemeralString({
					string: "Command.Ping.Quotes",
					placeholders: { YEAR: (new Date().getFullYear() + 2).toString() },
				})
			).split("$,");
			embed
				.setTitle(await interaction.getEphemeralString({ string: "Command.Ping.Title" }))
				.setDescription(
					await interaction.getEphemeralString({
						string: "Command.Ping.Description",
						placeholders: {
							QUOTE: quotes[Math.floor(Math.random() * quotes.length)],
							LATENCY: (d.getTime() - interaction.createdTimestamp).toString(),
							APILATENCY: Math.round(client.ws.ping).toString(),
						},
					}),
				);

			try {
				interaction.editReply({ embeds: [embed] }).then((message: Message) => message.deleteButton());
			} catch (err) {
				console.error(err);
			}
		});
	},
};
