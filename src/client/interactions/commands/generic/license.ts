import { ICommand, IGuilds } from '@interfaces';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';

export default {
  config: () => ({
    ...JSON.configLoad('commands/license.json'),
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('license_command_name'))
    .setDescriptions(String.getAll('license_command_description')),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const guilds: IGuilds = JSON.configLoad('guilds.json');
    const guildId = interaction.guildId || '0';

    if (!guilds.guilds[guildId] || !guilds.guilds[guildId].license) {
      interaction.reply({
        content: String.get('license_command_no_license', interaction.guildLocale, {
          keys: {
            SET_LICENSE_COMMAND_NAME: `${String.get('set_command_name', interaction.locale)} ${String.get('set_subcommand_license_name', interaction.locale)}`,
          },
        }),
        ephemeral: true,
      });
      return;
    }

    interaction.replyDeletable({ content: guilds.guilds[guildId].license });
  },
} as ICommand;
