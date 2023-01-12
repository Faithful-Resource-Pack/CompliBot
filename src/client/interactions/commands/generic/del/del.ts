import { ICommand, IHandler } from '@interfaces';
import { Collection, PermissionFlagsBits } from 'discord.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';

import delLicense from './del-license.params';
import delRule from './del-rule.params';
import delRuleHeader from './del-rule-header.params';
import delRuleFooter from './del-rule-footer.params';

export default {
  config: () => ({}),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('del_command_name'))
    .setDescriptions(String.getAll('del_command_description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // del rule-header
    .addLocalizedSubcommand(
      (subcommand) => subcommand,
      {
        names: String.getAll('del_subcommand_rule_header_name'),
        descriptions: String.getAll('del_subcommand_rule_header_description'),
      },
    )

    // del rule-footer
    .addLocalizedSubcommand(
      (subcommand) => subcommand,
      {
        names: String.getAll('del_subcommand_rule_footer_name'),
        descriptions: String.getAll('del_subcommand_rule_footer_description'),
      },
    )

    // del rule <number>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addIntegerOption((number) => number
          .setRequired(true)
          .setMinValue(1)
          .setName(String.get('del_subcommand_rule_number_argument_name'))
          .setDescription(String.get('del_subcommand_rule_number_argument_description'))),
      {
        names: String.getAll('del_subcommand_rule_name'),
        descriptions: String.getAll('del_subcommand_rule_description'),
      },
    )

    // del license
    .addLocalizedSubcommand(
      (subcommand) => subcommand,
      {
        names: String.getAll('del_subcommand_license_name'),
        descriptions: String.getAll('del_subcommand_license_description'),
      },
    ),
  handler: new Collection<string, IHandler>()
    .set(String.get('del_subcommand_license_name'), (interaction: ChatInputCommandInteraction) => delLicense(interaction))
    .set(String.get('del_subcommand_rule_name'), (interaction: ChatInputCommandInteraction) => delRule(interaction))
    .set(String.get('del_subcommand_rule_header_name'), (interaction: ChatInputCommandInteraction) => delRuleHeader(interaction))
    .set(String.get('del_subcommand_rule_footer_name'), (interaction: ChatInputCommandInteraction) => delRuleFooter(interaction)),
} as ICommand;
