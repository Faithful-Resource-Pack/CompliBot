import { Client } from '@client';
import { ICommand } from '@interfaces';
import { EmbedBuilder } from '@overrides';
import { SlashCommandBuilder, ChatInputCommandInteraction, CacheType } from 'discord.js';

export default {
  config: () => ({
    ...JSON.configLoad('commands/ping.json'),
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('ping_command_name'))
    .setDescription(String.get('ping_command_description')),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>, client: Client) => {
    const quotes: Array<string> = String.get('ping_command_quotes', interaction.locale, { keys: { YEAR: (new Date().getFullYear() + 2).toString() } });
    const quote: string = quotes[Math.floor(Math.random() * quotes.length)];

    const embed = new EmbedBuilder()
      .setTitle(String.get('ping_command_awaiting', interaction.locale));

    interaction.reply({ embeds: [embed], ephemeral: true })
      .then(() => {
        embed
          .setTitle(String.get('ping_command_response_title', interaction.locale))
          .setDescription(String.get('ping_command_response_description', interaction.locale, {
            keys: {
              QUOTE: quote,
              LATENCY: `${interaction.createdTimestamp - Date.now()}`,
              API_LATENCY: `${Math.round(client.ws.ping)}`,
            },
          }));

        interaction.editReply({ embeds: [embed] });
      });
  },
} as ICommand;
