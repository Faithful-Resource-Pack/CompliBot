import { SlashCommand } from '@interfaces';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, MessageEmbed, CommandInteraction } from '@client';

const command: SlashCommand = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Gets the Bot and API latency.'),
  execute: async (interaction: CommandInteraction, client: Client) => {
    const embed = new MessageEmbed().setTitle(
      await interaction.getEphemeralString({
        string: 'Command.Ping.Await',
      }),
    );
    await interaction
      .reply({
        embeds: [embed],
        ephemeral: true,
      })
      .then(async () => {
        const d: Date = new Date();
        const quotes = (
          await interaction.getEphemeralString({
            string: 'Command.Ping.Quotes',
            placeholders: {
              YEAR: (new Date().getFullYear() + 2).toString(),
            },
          })
        ).split('$,');
        embed
          .setTitle(
            await interaction.getEphemeralString({
              string: 'Command.Ping.Title',
            }),
          )
          .setDescription(
            await interaction.getEphemeralString({
              string: 'Command.Ping.Description',
              placeholders: {
                QUOTE: quotes[Math.floor(Math.random() * quotes.length)],
                LATENCY: (d.getTime() - interaction.createdTimestamp).toString(),
                APILATENCY: Math.round(client.ws.ping).toString(),
              },
            }),
          );

        try {
          interaction.editReply({
            embeds: [embed],
          });
        } catch (err) {
          console.error(err);
        }
      });
  },
};

export default command;
