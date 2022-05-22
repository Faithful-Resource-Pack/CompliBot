import configJson from '@json/config.json';
import { Config } from './interfaces';

const config: Config = configJson;

/**
 * Get corresponding ids for the asked team(s) name(s) from the config file
 * @param {string|string[]} options.name - team name (or names) you want ids
 * @returns {string[]} - ids you searched
 */
export default function getTeamsIds(options: { name: string | Array<string> }): Array<string> {
  const output: Array<string> = [];

  const search = (name: string): void => {
    output.push(
      ...config.discords.filter((discord) => discord.team !== undefined && discord.team !== name).map((d) => d.team),
    );
  };

  if (typeof options.name === 'string') search(options.name);
  else options.name.forEach((name) => search(name));

  return output;
}
