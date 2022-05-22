import configJson from '@json/config.json';
import { Config } from './interfaces';

const config: Config = configJson;

/**
 * Return the guild name from the config file
 * Useful when you want to get the guild team name from the guild id
 * @param {String} guildId - the guild id to be searched
 * @param {Boolean} team - if true, the team name will be returned instead of the guild name
 */
const getGuildName = (guildId: string, team: boolean = false): string => {
  let output: string;

  config.discords.forEach((discord) => {
    if (discord.id === guildId) output = discord.name;
    if (discord.id === guildId && discord.team && team) output = discord.team;
  });

  return output;
};

export default getGuildName;
