import { ICommandsUses } from '@interfaces';
import { Snowflake } from 'discord.js';
import path from 'path';
import { getFileNames } from './files';

/**
 * Gets the name of all commands (even the private ones)
 * @returns  {Array<{ name: string, value: string }>} The names of all commands available.
 */
export function getCommandsNames(): Array<{ name: string; value: string; }> {
  const files = getFileNames(path.join(__dirname, '..', 'client', 'interactions', 'commands'), true);
  return files
    .filter((file) => file.endsWith('.ts' || '.js'))
    .map((file) => file.split(path.sep).pop()!.split('.')[0])
    .map((key) => ({ name: key, value: key }));
}

/**
 * Gets the names of all commands that can be configured.
 * @returns {Array<{ name: string, value: string }>} The names of all commands that can be configured.
 */
export function getConfigurableCommands(): Array<{ name: string; value: string; }> {
  const blacklistedCommands = [
    'whitelist.ts',
    'blacklist.ts',
    'botban.ts',
    'changelog.ts',
    'debug-channel.ts',
    'eval.ts',
    'logs.ts',
  ];

  return getCommandsNames()
    .filter(({ name }) => !blacklistedCommands.includes(name));
}

/**
 * Get uses of the specified command name.
 * @param {String} name - The name of the command.
 * @param {Snowflake} guildId - The id of the guild.
 * @returns {{global: number, guilds: number}} The uses of the specified command.
 */
export function getCommandUses(name: string, guildId?: Snowflake): { global: number; guild?: number; } {
  const config: ICommandsUses = JSON.configLoad('commands/__usage.json');

  if (!config[name]) return { global: 0, guild: 0 };
  if (guildId) return { global: config[name].global, guild: config[name].guilds[guildId] };
  return { global: config[name].global, guild: 0 };
}

/**
 * Add a use to the specified command name.
 * @param {String} name - The name of the command.
 * @param {Snowflake} guildId - The id of the guild.
 */
export function addCommandUse(name: string, guildId: Snowflake): void {
  const config: ICommandsUses = JSON.configLoad('commands/__usage.json');

  if (!Object.hasOwnProperty.call(config, name)) config[name] = { global: 0, guilds: {} };

  config[name].global += 1;

  if (!Object.hasOwnProperty.call(config[name].guilds, guildId)) config[name].guilds[guildId] = 1;
  else config[name].guilds[guildId] += 1;

  JSON.configSave('commands/__usage.json', config);
}

/**
 * Get uses of all commands.
 * @param {Snowflake} guildId - Optional, add the uses of the commands in the specified guild.
 * @returns {{global: number, guild?: number}} The uses of all commands.
 */
export function getCommandsUses(guildId?: Snowflake): { global: number, guild?: number } {
  return getCommandsNames()
    .map((name) => getCommandUses(name.name, guildId))
    .reduce((a, b) => ({ global: a.global + b.global, guild: (a.guild ?? 0) + (b.guild ?? 0) }), { global: 0, guild: 0 });
}

/**
 * Get uses of commands but ordered by the most used (globally)
 * @param {Snowflake} guildId - Optional, add the uses of the commands in the specified guild.
 * @returns {Array<{ name: string, uses: { global: number, guild?: number } }>} The uses of all commands ordered by the most used.
 */
export function getCommandsUsesOrdered(guildId?: Snowflake): Array<{ name: string; uses: { global: number, guild?: number }; }> {
  const commands = getCommandsNames();

  return commands.map((command) => ({
    name: command.name,
    uses: getCommandUses(command.name, guildId),
  })).sort((a, b) => b.uses.global - a.uses.global);
}
