import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  let { rules } = guilds.guilds[guildId];
  const title = interaction.options.getString(String.get('set_subcommand_rule_footer_title_argument_name'), true);
  const description = interaction.options.getString(String.get('set_subcommand_rule_footer_description_argument_name'), true);
  const text = interaction.options.getString(String.get('set_subcommand_rule_footer_text_argument_name'), true);
  const icon = interaction.options.getString(String.get('set_subcommand_rule_footer_icon_argument_name'), false) ?? undefined;

  if (rules === undefined) {
    rules = {
      footer: { title, description, footer: { text, icon } },
    };
  } else {
    rules.footer = { title, description, footer: { text, icon } };
  }

  guilds.guilds[guildId].rules = rules;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('set_subcommand_rule_footer_success', interaction.guildLocale), ephemeral: true });
};
