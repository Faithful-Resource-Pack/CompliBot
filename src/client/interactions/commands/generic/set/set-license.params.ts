import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';

export default async (interaction: ChatInputCommandInteraction) => {
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';
  const license = interaction.options.getString(String.get('set_subcommand_license_text_argument_name'), true);

  guilds.guilds[guildId].license = license;

  JSON.configSave('guilds.json', guilds);
  interaction.reply({ content: String.get('set_subcommand_license_success', interaction.guildLocale, { keys: { LICENSE: license } }), ephemeral: true });
};
