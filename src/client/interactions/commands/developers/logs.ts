import { Client } from '@client';
import { ICommand } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';
import { Logger } from '@utils';
import { SlashCommandBuilder } from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('logs_command_name'))
    .setDescription(String.get('logs_command_description'))
    .setDMPermission(false),
  handler: async (interaction: ChatInputCommandInteraction, client: Client) => {
    await interaction.replyDeletable({ files: [Logger.buildLogFile(client)] })
      .catch((error) => Logger.log('error', 'An error occurred while sending the logs file.', error));
  },
} as ICommand;
