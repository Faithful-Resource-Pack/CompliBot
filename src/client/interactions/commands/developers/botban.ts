import { ICommand, IHandler } from '@interfaces';
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
  Collection,
  userMention,
} from 'discord.js';

import { Strings } from '@utils';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(Strings.get('botban_command_name'))
    .setDescription(Strings.get('botban_command_description'))
    .addSubcommand((subcommand) => subcommand
      .setName(Strings.get('botban_command_subcommand_view_name'))
      .setDescription(Strings.get('botban_command_subcommand_view_description')))
    .addSubcommand((subcommand) => subcommand
      .setName(Strings.get('botban_command_subcommand_audit_name'))
      .setDescription(Strings.get('botban_command_subcommand_audit_description'))
      .addUserOption((option) => option
        .setName(Strings.get('botban_command_subcommand_audit_option_user_name'))
        .setDescription(Strings.get('botban_command_subcommand_audit_option_user_description'))
        .setRequired(true))),

  handler: new Collection<string, IHandler>()
    .set(Strings.get('botban_command_subcommand_view_name'), (interaction: ChatInputCommandInteraction<CacheType>) => {
      const config = JSON.configLoad('botban.json');

      if (!config.banned || config.banned.length === 0) {
        interaction.reply({
          content: Strings.get('botban_command_subcommand_view_no_banned_users'),
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: JSON.toCodeBlock(config.banned),
          ephemeral: true,
        });
      }
    })
    .set(Strings.get('botban_command_subcommand_audit_name'), (interaction: ChatInputCommandInteraction<CacheType>) => {
      const config: { banned: Array<string> } = JSON.configLoad('botban.json');
      const bannedUser = interaction.options.getUser(Strings.get('botban_command_subcommand_audit_option_user_name'), true).id;
      let added = false;

      if (!config.banned) config.banned = [];

      if (!config.banned.includes(bannedUser)) {
        config.banned.push(bannedUser);
        added = true;
      } else config.banned.remove(bannedUser);

      JSON.configSave('botban.json', config);

      interaction.reply({
        content: Strings.get(added ? 'botban_command_subcommand_audit_user_banned' : 'botban_command_subcommand_audit_user_unbanned', interaction.locale, {
          keys: {
            USER: userMention(bannedUser),
          },
        }),
        ephemeral: true,
      });
    }),
} as ICommand;
