import { Config } from "./interfaces";
import configJson from "@json/config.json";

const config: Config = configJson;

/**
 * Return the guild name from the config file
 * Useful when you want to get the guild team name from the guild id
 * @param {String} guildId - the guild id to be searched
 * @param {Boolean} team - if true, the team name will be returned instead of the guild name
 */
export const getGuildName = (guildId: string, team: boolean = false): string => {
  let output: string = undefined;

  config.discords.forEach(discord => {
    if (discord.id === guildId) output = discord.name;
    if (discord.id === guildId && discord.team && team) output = discord.team;
  })

  return output;
}