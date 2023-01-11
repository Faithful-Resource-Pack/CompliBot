import { ICommand, IRule, IGuilds } from '@interfaces';
import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from '@overrides';

export default {
  config: () => ({
    ...JSON.configLoad('commands/rule.json'),
  }),
  data: new SlashCommandBuilder()
    .setNames(String.getAll('rule_command_name'))
    .setDescriptions(String.getAll('rule_command_description'))
    .addLocalizedIntegerOption((option) => option
      .setRequired(true), {
      names: String.getAll('rule_command_option_rule_name'),
      descriptions: String.getAll('rule_command_option_rule_description'),
    }),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const ruleIndex = interaction.options.getInteger(String.get('rule_command_option_rule_name'), false) || 0;
    const guilds: IGuilds = JSON.configLoad('guilds.json');
    const guildId = interaction.guildId || '0';

    // If no rules are set for this guild
    if (!guilds.guilds[guildId] || !guilds.guilds[guildId].rules) {
      interaction.reply({
        content: String.get('rule_command_no_rules', interaction.guildLocale, {
          keys: {
            SET_RULE_COMMAND_NAME: String.get('set_subcommand_rule_name'),
          },
        }),
        ephemeral: true,
      });
      return;
    }

    // Find rule with its index
    const rule: IRule | undefined = guilds.guilds[guildId].rules?.[ruleIndex];

    if (!rule) {
      interaction.reply({ content: String.get('rule_command_no_rule_found', interaction.guildLocale), ephemeral: true });
      return;
    }

    // Construct the embed
    const embed = new EmbedBuilder()
      .setTitle(rule.title)
      .setDescription(rule.description);

    // Set color if present
    const color = guilds.guilds[guildId].rules?.color;
    if (color !== undefined) embed.setColor(color);

    interaction.replyDeletable({ embeds: [embed] });
  },
} as ICommand;
