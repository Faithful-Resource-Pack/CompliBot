import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, MessageEmbed, CommandInteraction } from "@src/Extended Discord";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder().setName("ping").setDescription("Gets latency."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let embed = new MessageEmbed().setTitle(await interaction.text({ string: "Command.Ping.Await" }));
		await interaction.reply({ embeds: [embed], ephemeral: true }).then(async () => {
			const d: Date = new Date();
			const quotes = (
				await interaction.text({
					string: "Command.Ping.Quotes",
					placeholders: { YEAR: (new Date().getFullYear() + 2).toString() },
				})
			).split("$,");
			embed.setTitle(await interaction.text({ string: "Command.Ping.Title" })).setDescription(
				await interaction.text({
					string: "Command.Ping.Description",
					placeholders: {
						QUOTE: quotes[Math.floor(Math.random() * quotes.length)],
						LATENCY: (d.getTime() - interaction.createdTimestamp).toString(),
						APILATENCY: Math.round(client.ws.ping).toString(),
					},
				}),
			);

			try {
				interaction.editReply({ embeds: [embed] });
			} catch (err) {
				console.error(err);
			}
		});
	},
};
