import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  let { rules } = guilds.guilds[guildId];
  const title = interaction.options.getString(String.get('set_subcommand_rule_header_title_argument_name'), true);
  const description = interaction.options.getString(String.get('set_subcommand_rule_header_description_argument_name'), true);
  const thumbnail = interaction.options.getString(String.get('set_subcommand_rule_header_thumbnail_argument_name'), true);

  if (rules === undefined) {
    rules = {
      header: { title, description, thumbnail },
    };
  } else {
    rules.header = { title, description, thumbnail };
  }

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('set_subcommand_rule_header_success', interaction.guildLocale), ephemeral: true });
};
