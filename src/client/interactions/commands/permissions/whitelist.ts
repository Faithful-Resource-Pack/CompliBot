import { IHandler } from '@interfaces';
import {
  CacheType,
  channelMention,
  ChatInputCommandInteraction,
  Collection,
  PermissionFlagsBits,
  roleMention,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  User,
  userMention,
} from 'discord.js';

import {
  Logger,
  getConfigurableCommands,
} from '@utils';

/**
 * Edit the whitelist/blacklist of a command.
 * @param {String} option what category is edited
 * @param {String} type if it's the whitelist or the blacklist
 * @param {ChatInputCommandInteraction<CacheType>} interaction the interaction to use
 */
export const setCommand = (
  option: 'roles' | 'users' | 'channels',
  type: 'blacklist' | 'whitelist',
  interaction: ChatInputCommandInteraction<CacheType>,
) => {
  const command = interaction.options.getString(String.get(`${type}_subcommand_command_argument_name`), true);
  const guildId = interaction.guild?.id || '0';
  const typed = type === 'blacklist' ? 'blacklisted' : 'whitelisted';

  let obj;
  let mentions: string;

  switch (option) {
    case 'roles':
      obj = interaction.options.getRole(String.get(`${type}_subcommand_role_argument_name`), true);
      mentions = roleMention(obj.id);
      break;
    case 'users':
      obj = interaction.options.getUser(String.get(`${type}_subcommand_user_argument_name`), true);
      mentions = userMention(obj.id);
      break;
    case 'channels':
    default:
      obj = interaction.options.getChannel(String.get(`${type}_subcommand_channel_argument_name`), true);
      mentions = channelMention(obj.id);
      break;
  }

  const config = JSON.configLoad(`/commands/${command}.json`);
  if (!config[typed]) config[typed] = {};
  if (!config[typed]![guildId]) config[typed]![guildId] = {};
  if (!config[typed]![guildId][option]) config[typed]![guildId][option] = [];

  if (config[typed]![guildId][option]?.includes(obj.id)) {
    config[typed]![guildId][option]!.removeAll(obj.id);
    interaction.reply({
      content: String.get(`${type}_command_remove_success`, interaction.locale, { keys: { OBJECT: mentions, COMMAND: command } }),
      ephemeral: true,
    });
  } else {
    config[typed]![guildId][option]!.push(obj.id);
    interaction.reply({
      content: String.get(`${type}_command_grant_success`, interaction.locale, { keys: { OBJECT: mentions, COMMAND: command } }),
      ephemeral: true,
    });
  }

  JSON.configSave(`/commands/${command}.json`, config);
  Logger.log('debug', `Authorizing role ${option === 'users' ? (obj as User).username : (obj as Exclude<typeof obj, User>).name} to use command ${command}`);
};

/**
 * List the current whitelist/blacklist of a command.
 * @param {String} type if it's the whitelist or the blacklist
 * @param {ChatInputCommandInteraction<CacheType>} interaction the interaction to use
 */
export const listCommand = (type: 'whitelist' | 'blacklist', interaction: ChatInputCommandInteraction<CacheType>) => {
  const command = interaction.options.getString('command', true);
  const config = JSON.configLoad(`/commands/${command}.json`);
  const typed = type === 'blacklist' ? 'blacklisted' : 'whitelisted';

  if (!config[typed] || !config[typed]![interaction.guild?.id || '0']) {
    interaction.reply({
      content: String.get('whitelist_subcommand_list_empty', interaction.locale, { keys: { COMMAND: command } }),
      ephemeral: true,
    });
  } else if (config[typed]![interaction.guild?.id || '0']) {
    interaction.reply({
      content: String.get('whitelist_subcommand_list_success', interaction.locale, {
        keys: {
          COMMAND: command,
          ROLES: config[typed]![interaction.guild?.id || '0'].roles?.map((roleId: string) => roleMention(roleId)).join(', ') || '`N/A`',
          CHANNELS: config[typed]![interaction.guild?.id || '0'].channels?.map((channelId: string) => channelMention(channelId)).join(', ') || '`N/A`',
          USERS: config[typed]![interaction.guild?.id || '0'].users?.map((userId: string) => userMention(userId)).join(', ') || '`N/A`',
          CODEBLOCK: JSON.toCodeBlock(config[typed]![interaction.guild?.id || '0']),
        },
      }),
      ephemeral: true,
    });
  }
};

/**
 * Construct the whitelist/blacklist subcommand.
 * @param {String} type if it's the whitelist or the blacklist
 * @returns {SlashCommandSubcommandsOnlyBuilder} the subcommand builder
 */
export const buildCommand = (type: 'whitelist' | 'blacklist'): SlashCommandSubcommandsOnlyBuilder => {
  const commands = getConfigurableCommands();

  return new SlashCommandBuilder()
    .setName(String.get(`${type}_command_name`))
    .setDescription(String.get(`${type}_command_description`))

    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // whitelist role <role> <command>
    .addSubcommand((subcommand) => subcommand
      .setName(String.get(`${type}_subcommand_role_name`))
      .setDescription(String.get(`${type}_subcommand_role_description`))
      .addRoleOption((role) => role
        .setName(String.get(`${type}_subcommand_role_argument_name`))
        .setDescription(String.get(`${type}_subcommand_role_argument_description`))
        .setRequired(true))
      .addStringOption((string) => string
        .setName(String.get(`${type}_subcommand_command_argument_name`))
        .setDescription(String.get(`${type}_subcommand_command_argument_description`))
        .addChoices(...commands)
        .setRequired(true)))

    // whitelist user <user> <command>
    .addSubcommand((subcommand) => subcommand
      .setName(String.get(`${type}_subcommand_user_name`))
      .setDescription(String.get(`${type}_subcommand_user_description`))
      .addUserOption((user) => user
        .setName(String.get(`${type}_subcommand_user_argument_name`))
        .setDescription(String.get(`${type}_subcommand_user_argument_description`))
        .setRequired(true))
      .addStringOption((string) => string
        .setName(String.get(`${type}_subcommand_command_argument_name`))
        .setDescription(String.get(`${type}_subcommand_command_argument_description`))
        .addChoices(...commands)
        .setRequired(true)))

    // whitelist channel <channel> <command>
    .addSubcommand((subcommand) => subcommand
      .setName(String.get(`${type}_subcommand_channel_name`))
      .setDescription(String.get(`${type}_subcommand_channel_description`))
      .addChannelOption((user) => user
        .setName(String.get(`${type}_subcommand_channel_argument_name`))
        .setDescription(String.get(`${type}_subcommand_channel_argument_description`))
        .setRequired(true))
      .addStringOption((string) => string
        .setName(String.get(`${type}_subcommand_command_argument_name`))
        .setDescription(String.get(`${type}_subcommand_command_argument_description`))
        .addChoices(...commands)
        .setRequired(true)))

    // whitelist list <command>
    .addSubcommand((subcommand) => subcommand
      .setName(String.get('whitelist_subcommand_list_name'))
      .setDescription(String.get('whitelist_subcommand_list_description'))
      .addStringOption((string) => string
        .setName(String.get('whitelist_subcommand_command_argument_name'))
        .setDescription(String.get('whitelist_subcommand_command_argument_description'))
        .addChoices(...commands)
        .setRequired(true)));
};

export default {
  config: () => ({}),
  data: () => buildCommand('whitelist'),
  handler: new Collection<string, IHandler>()
    .set(String.get('whitelist_subcommand_role_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('roles', 'whitelist', interaction))
    .set(String.get('whitelist_subcommand_user_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('users', 'whitelist', interaction))
    .set(String.get('whitelist_subcommand_channel_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('channels', 'whitelist', interaction))
    .set('list', (interaction: ChatInputCommandInteraction) => listCommand('whitelist', interaction)),
};
