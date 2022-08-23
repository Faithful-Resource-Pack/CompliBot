import { ICommand, IGuilds } from '@interfaces';
import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { ChatInputCommandInteraction } from '@overrides';

export default {
  config: () => ({}),
  data: new SlashCommandBuilder()
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setName(String.get('set_license_command_name'))
    .setDescription(String.get('set_license_command_description'))
    .addStringOption((option) => option
      .setName(String.get('set_license_command_option_name'))
      .setDescription(String.get('set_license_command_option_description'))
      .setRequired(true)),

  handler: async (interaction: ChatInputCommandInteraction) => {
    const guilds: IGuilds = JSON.configLoad('guilds.json');
    const guildId = interaction.guildId || '0';
    const guildName = interaction.guild?.name || 'Unknown Guild';
    const license = interaction.options.getString(String.get('set_license_command_option_name'), true);

    if (!guilds.guilds[guildId]) guilds.guilds[guildId] = { name: guildName, license };
    else guilds.guilds[guildId].license = license;

    JSON.configSave('guilds.json', guilds);
    interaction.reply({ content: String.get('set_license_command_success', interaction.guildLocale, { keys: { LICENSE: license } }), ephemeral: true });
  },
} as ICommand;
