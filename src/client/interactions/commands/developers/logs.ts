import { Client } from '@client';
import { Logger, Strings } from '@utils';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(Strings.get('logs_command_name'))
    .setDescription(Strings.get('logs_command_description'))
    .setDMPermission(false),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>, client: Client) => {
    await interaction.reply({ files: [Logger.buildLogFile(client)] })
      .catch((error) => Logger.log('error', 'An error occurred while sending the logs file.', error));
  },
};
