import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction, ColorResolvable } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const color = interaction.options.getString(String.get('set_subcommand_rule_color_color_argument_name'), true) as ColorResolvable;
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  let { rules } = guilds.guilds[guildId];

  if (rules === undefined) rules = { color };
  else rules.color = color;

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('set_subcommand_rule_color_success', interaction.guildLocale, { keys: { COLOR: color.toString() } }), ephemeral: true });
};
