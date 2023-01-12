import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const index = interaction.options.getInteger(String.get('del_subcommand_rule_number_argument_name'), true);
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  const { rules } = guilds.guilds[guildId];

  if (rules === undefined) return;
  delete rules[index];

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('del_subcommand_rule_success', interaction.guildLocale, { keys: { INDEX: `\`${index}\`` } }), ephemeral: true });
};
