import { ICommand, IGuilds } from '@interfaces';
import { PermissionFlagsBits } from 'discord.js';
import { ChatInputCommandInteraction, SlashCommandBuilder } from '@overrides';

export default {
  config: () => ({}),
  data: new SlashCommandBuilder()
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setNames(String.getAll('set_license_command_name'))
    .setDescriptions(String.getAll('set_license_command_description'))
    .addLocalizedStringOption((option) => option.setRequired(true), {
      names: String.getAll('set_license_command_option_name'),
      descriptions: String.getAll('set_license_command_option_description'),
    }),
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
