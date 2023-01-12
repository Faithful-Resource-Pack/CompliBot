import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  let { rules } = guilds.guilds[guildId];

  if (rules === undefined) rules = { footer: undefined };
  else rules.footer = undefined;

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('del_subcommand_rule_footer_success', interaction.guildLocale), ephemeral: true });
};
