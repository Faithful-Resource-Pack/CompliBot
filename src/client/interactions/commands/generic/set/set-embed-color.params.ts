import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction, ColorResolvable } from 'discord.js';

export default async (interaction: ChatInputCommandInteraction) => {
  const newColor = interaction.options.getString(String.get('set_subcommand_embed_color_color_argument_name'), true) as ColorResolvable;
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  guilds.guilds[guildId].color = newColor;
  JSON.configSave('guilds.json', guilds);

  interaction.reply({ content: String.get('set_subcommand_embed_color_success', interaction.guildLocale, { keys: { COLOR: `\`${newColor.toString()}\`` } }), ephemeral: true });
};
