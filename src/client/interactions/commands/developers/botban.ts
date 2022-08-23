import { ICommand, IHandler } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';
import {
  SlashCommandBuilder,
  Collection,
  userMention,
} from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('botban_command_name'))
    .setDescription(String.get('botban_command_description'))
    .addSubcommand((subcommand) => subcommand
      .setName(String.get('botban_command_subcommand_view_name'))
      .setDescription(String.get('botban_command_subcommand_view_description')))
    .addSubcommand((subcommand) => subcommand
      .setName(String.get('botban_command_subcommand_audit_name'))
      .setDescription(String.get('botban_command_subcommand_audit_description'))
      .addUserOption((option) => option
        .setName(String.get('botban_command_subcommand_audit_option_user_name'))
        .setDescription(String.get('botban_command_subcommand_audit_option_user_description'))
        .setRequired(true))),

  handler: new Collection<string, IHandler>()
    .set(String.get('botban_command_subcommand_view_name'), (interaction: ChatInputCommandInteraction) => {
      const config = JSON.configLoad('botban.json');

      if (!config.banned || config.banned.length === 0) {
        interaction.replyDeletable({
          content: String.get('botban_command_subcommand_view_no_banned_users', interaction.locale),
          ephemeral: true,
        });
      } else {
        interaction.replyDeletable({
          content: JSON.toCodeBlock(config.banned),
          ephemeral: true,
        });
      }
    })
    .set(String.get('botban_command_subcommand_audit_name'), (interaction: ChatInputCommandInteraction) => {
      const config: { banned: Array<string> } = JSON.configLoad('botban.json');
      const bannedUser = interaction.options.getUser(String.get('botban_command_subcommand_audit_option_user_name', interaction.locale), true).id;
      let added = false;

      if (!config.banned) config.banned = [];

      if (!config.banned.includes(bannedUser)) {
        config.banned.push(bannedUser);
        added = true;
      } else config.banned.remove(bannedUser);

      JSON.configSave('botban.json', config);

      interaction.replyDeletable({
        content: String.get(added ? 'botban_command_subcommand_audit_user_banned' : 'botban_command_subcommand_audit_user_unbanned', interaction.locale, {
          keys: {
            USER: userMention(bannedUser),
          },
        }),
        ephemeral: true,
      });
    }),
} as ICommand;
