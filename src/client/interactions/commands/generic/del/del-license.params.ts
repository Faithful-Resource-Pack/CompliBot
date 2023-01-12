import { IGuilds } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';

export default async (interaction: ChatInputCommandInteraction) => {
  const guilds: IGuilds = JSON.configLoad('guilds.json');
  const guildId = interaction.guildId || '0';

  guilds.guilds[guildId].license = undefined;

  JSON.configSave('guilds.json', guilds);
  interaction.reply({ content: String.get('del_subcommand_license_success', interaction.guildLocale), ephemeral: true });
};
