import { ICommand, IHandler } from '@interfaces';
import { Collection, PermissionFlagsBits } from 'discord.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';

import setLicense from './set-license.params';
import setRule from './set-rule.params';
import setEmbedColor from './set-embed-color.params';
import setRuleHeader from './set-rule-header.params';
import setRuleChannel from './set-rule-channel.params';
import setRuleFooter from './set-rule-footer.params';

export default {
  config: () => ({}),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('set_command_name'))
    .setDescriptions(String.getAll('set_command_description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // set rule-header <title> <description> <thumbnail>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addStringOption((title) => title
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_header_title_argument_name'))
          .setDescription(String.get('set_subcommand_rule_header_title_argument_description')))
        .addStringOption((description) => description
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_header_description_argument_name'))
          .setDescription(String.get('set_subcommand_rule_header_description_argument_description')))
        .addStringOption((thumbnail) => thumbnail
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_header_thumbnail_argument_name'))
          .setDescription(String.get('set_subcommand_rule_header_thumbnail_argument_description'))),
      {
        names: String.getAll('set_subcommand_rule_header_name'),
        descriptions: String.getAll('set_subcommand_rule_header_description'),
      },
    )

    // set rule-footer <title> <description> <text> [icon]
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addStringOption((title) => title
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_footer_title_argument_name'))
          .setDescription(String.get('set_subcommand_rule_footer_title_argument_description')))
        .addStringOption((description) => description
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_footer_description_argument_name'))
          .setDescription(String.get('set_subcommand_rule_footer_description_argument_description')))
        .addStringOption((text) => text
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_footer_text_argument_name'))
          .setDescription(String.get('set_subcommand_rule_footer_text_argument_description')))
        .addStringOption((icon) => icon
          .setName(String.get('set_subcommand_rule_footer_icon_argument_name'))
          .setDescription(String.get('set_subcommand_rule_footer_icon_argument_description'))),
      {
        names: String.getAll('set_subcommand_rule_footer_name'),
        descriptions: String.getAll('set_subcommand_rule_footer_description'),
      },
    )

    // set rule-channel <channel> [changelog]
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addChannelOption((channel) => channel
          .setRequired(true)
          .setName(String.get('set_subcommand_rule_channel_channel_argument_name'))
          .setDescription(String.get('set_subcommand_rule_channel_channel_argument_description')))
        .addStringOption((changelog) => changelog
          .setName(String.get('set_subcommand_rule_channel_changelog_argument_name'))
          .setDescription(String.get('set_subcommand_rule_channel_changelog_argument_description'))),
      {
        names: String.getAll('set_subcommand_rule_channel_name'),
        descriptions: String.getAll('set_subcommand_rule_channel_description'),
      },
    )

    // set rule <number> <title> <description>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addIntegerOption((number) => number
          .setRequired(true)
          .setMinValue(1)
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

    // set embed-color <color>
    .addLocalizedSubcommand(
      (subcommand) => subcommand
        .addStringOption((color) => color
          .setRequired(true)
          .setName(String.get('set_subcommand_embed_color_color_argument_name'))
          .setDescription(String.get('set_subcommand_embed_color_color_argument_description'))),
      {
        names: String.getAll('set_subcommand_embed_color_name'),
        descriptions: String.getAll('set_subcommand_embed_color_description'),
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
    .set(String.get('set_subcommand_embed_color_name'), (interaction: ChatInputCommandInteraction) => setEmbedColor(interaction))
    .set(String.get('set_subcommand_rule_header_name'), (interaction: ChatInputCommandInteraction) => setRuleHeader(interaction))
    .set(String.get('set_subcommand_rule_footer_name'), (interaction: ChatInputCommandInteraction) => setRuleFooter(interaction))
    .set(String.get('set_subcommand_rule_channel_name'), (interaction: ChatInputCommandInteraction) => setRuleChannel(interaction)),
} as ICommand;
