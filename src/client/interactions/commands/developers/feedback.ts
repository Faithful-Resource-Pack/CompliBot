import { Strings } from '@utils';
import {
  ActionRowBuilder,
  CacheType,
  ChatInputCommandInteraction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';

export default {
  config: () => ({
    ...JSON.configLoad('commands/feedback.json'),
  }),
  data: new SlashCommandBuilder()
    .setName(Strings.get('feedback_command_name'))
    .setDescription(Strings.get('feedback_command_description'))
    .addStringOption((option) => option
      .setName(Strings.get('feedback_command_option_type_name'))
      .setDescription(Strings.get('feedback_command_option_type_description'))
      .addChoices(
        { name: Strings.get('feedback_command_option_type_bug'), value: 'bug' },
        { name: Strings.get('feedback_command_option_type_feature'), value: 'feature' },
        { name: Strings.get('feedback_command_option_type_generic'), value: 'generic' },
      )
      .setRequired(true)),
  handler: async (interaction: ChatInputCommandInteraction<CacheType>) => {
    const type: 'generic' | 'bug' | 'feature' = interaction.options.getString('type', true) as any;
    const modal = new ModalBuilder()
      .setCustomId(`feedback-${type}`)
      .setTitle(Strings.get(`feedback_modal_title_${type}`, interaction.locale));

    const inputs: Array<TextInputBuilder> = [];
    const rows: Array<ActionRowBuilder<ModalActionRowComponentBuilder>> = [];

    switch (type) {
      case 'feature':
        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feature-title')
          .setLabel(Strings.get('feedback_input_feature_title_label', interaction.locale))
          .setStyle(TextInputStyle.Short)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feature-related')
          .setLabel(Strings.get('feedback_input_feature_related_label', interaction.locale))
          .setStyle(TextInputStyle.Short)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feature-description')
          .setLabel(Strings.get('feedback_input_feature_description_label', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feature-screenshots')
          .setLabel(Strings.get('feedback_input_feature_screenshots_label', interaction.locale))
          .setPlaceholder(Strings.get('feedback_input_feature_screenshots_placeholder', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feature-notes')
          .setLabel(Strings.get('feedback_input_feature_notes_label', interaction.locale))
          .setPlaceholder(Strings.get('feedback_input_feature_notes_placeholder', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false));

        break;

      case 'bug':
        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-bug-title')
          .setLabel(Strings.get('feedback_input_bug_title_label', interaction.locale))
          .setStyle(TextInputStyle.Short)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-bug-what-happened')
          .setLabel(Strings.get('feedback_input_bug_what_happened_label', interaction.locale))
          .setPlaceholder(Strings.get('feedback_input_bug_what_happened_placeholder', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-bug-reproduce')
          .setLabel(Strings.get('feedback_input_bug_reproduce_label', interaction.locale))
          .setPlaceholder(Strings.get('feedback_input_bug_reproduce_placeholder', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-bug-screenshots')
          .setLabel(Strings.get('feedback_input_bug_screenshots_label', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-bug-notes')
          .setLabel(Strings.get('feedback_input_bug_notes_label', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false));

        break;

      case 'generic':
      default:
        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feedback-title')
          .setLabel(Strings.get('feedback_input_generic_title_label', interaction.locale))
          .setStyle(TextInputStyle.Short)
          .setRequired(true));

        inputs.push(new TextInputBuilder()
          .setCustomId('feedback-input-feedback-description')
          .setLabel(Strings.get('feedback_input_generic_description_label', interaction.locale))
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true));

        break;
    }

    inputs.forEach((input) => {
      rows.push(new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(input));
    });

    modal.addComponents(rows);
    await interaction.showModal(modal);
  },
};