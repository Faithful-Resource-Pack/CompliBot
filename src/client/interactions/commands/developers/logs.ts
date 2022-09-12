import { Client } from '@client';
import { ICommand } from '@interfaces';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';
import { Logger } from '@utils';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('logs_command_name'))
    .setDescriptions(String.getAll('logs_command_description'))
    .setDMPermission(false),
  handler: async (interaction: ChatInputCommandInteraction, client: Client) => {
    await interaction.replyDeletable({ files: [Logger.buildLogFile(client)] })
      .catch((error) => Logger.log('error', 'An error occurred while sending the logs file.', error));
  },
} as ICommand;
