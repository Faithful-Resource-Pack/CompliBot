import { ICommand, IHandler } from '@interfaces';
import { Collection, PermissionFlagsBits } from 'discord.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';

import setLicense from './set-license.params';
import setRule from './set-rule.params';
import setRuleColor from './set-rule-color.params';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setName(String.get('set_command_name'))
    .setDescription(String.get('set_command_description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // set rule <number> <title> <description>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addIntegerOption((number) => number
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_number_argument_name'))
          .setDescription(String.get('set_subcommand_rule_number_argument_description')))
        .addStringOption((title) => title
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_title_argument_name'))
          .setDescription(String.get('set_subcommand_rule_title_argument_description')))
        .addStringOption((description) => description
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_description_argument_name'))
          .setDescription(String.get('set_subcommand_rule_description_argument_description'))),
      {
        names: String.getAll('set_subcommand_rule_name'),
        descriptions: String.getAll('set_subcommand_rule_description'),
      },
    )

    // set rule-color <color>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addStringOption((color) => color
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_color_color_argument_name'))
          .setDescription(String.get('set_subcommand_rule_color_color_argument_description'))),
      {
        names: String.getAll('set_subcommand_rule_color_name'),
        descriptions: String.getAll('set_subcommand_rule_color_description'),
      },
    )

    // set license <license>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addStringOption((title) => title
          .setRequired(true)
          .setName(String.get('set_subcommand_license_text_argument_name'))
          .setDescription(String.get('set_subcommand_license_text_argument_description'))),
      {
        names: String.getAll('set_subcommand_license_name'),
        descriptions: String.getAll('set_subcommand_license_description'),
      },
    ),
  handler: new Collection<string, IHandler>()
    .set(String.get('set_subcommand_license_name'), (interaction: ChatInputCommandInteraction) => setLicense(interaction))
    .set(String.get('set_subcommand_rule_name'), (interaction: ChatInputCommandInteraction) => setRule(interaction))
    .set(String.get('set_subcommand_rule_color_name'), (interaction: ChatInputCommandInteraction) => setRuleColor(interaction)),
} as ICommand;
