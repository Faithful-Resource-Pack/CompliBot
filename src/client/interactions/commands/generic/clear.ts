import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';
import { PermissionFlagsBits } from 'discord.js';

export default {
  config: () => ({
    devOnly: true,
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('clear_command_name'))
    .setDescriptions(String.getAll('clear_command_description'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addLocalizedIntegerOption(
      (amount) => amount
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
      {
        names: String.getAll('clear_command_amount_argument_name'),
        descriptions: String.getAll('clear_command_amount_argument_description'),
      },
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.channel == null) {
      interaction.reply({ content: String.get('errors_channel_not_found', interaction.locale), ephemeral: true });
      return;
    }

    let amount = interaction.options.getInteger(String.get('clear_command_amount_argument_name'), true);

    const messages = await interaction.channel.messages.fetch({ limit: amount });
    if (!interaction.channel.isDMBased()) {
      await interaction.channel.bulkDelete(messages, true);

      const d = new Date().setDate(new Date().getDate() - 14);
      const deleted = messages.filter((m) => m.createdAt.getTime() > d);
      amount = deleted.size;
    }

    interaction.reply({ content: String.get('clear_command_success', interaction.locale, { keys: { AMOUNT: `\`${amount}\`` } }), ephemeral: true });
  },
};
