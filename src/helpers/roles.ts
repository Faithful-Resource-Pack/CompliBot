import configJson from '@json/config.json';
import { Config } from './interfaces';

const config: Config = configJson;

/**
 * Get corresponding ids for the asked role name(s) in the asked discords & teams
 * @param {string|Array<string>} options.name - role name (or names) you want ids
 * @param {"all"|Array<string>} options.discords - discord servers names you want the role from (if string "all" is provided, all discords servers will be searched)
 * @param {"all"|Array<string>} options.teams - discord teams names you want the role from (if string "all" is provided, all discords teams will be searched)
 * @returns {Array<string>} - ids you searched
 */
const getRolesIds = (options: {
  name: string | Array<string>;
  discords?: Array<string> | 'all';
  teams?: Array<string> | 'all';
}): Array<string> => {
  const output: Array<string> = [];

  // for all discords servers
  if (options.discords === 'all') {
    // for only 1 role specified
    if (typeof options.name === 'string') {
      output.push(
        ...config.discords
          .filter((d) => d.roles !== undefined && d.roles[options.name as string] !== undefined)
          .map((d) => d.roles[options.name as string]),
      );
    } else {
    // for multiple specified roles
      options.name.forEach((name) => output.push(
        ...config.discords
          .filter((d) => d.roles !== undefined && d.roles[name] !== undefined)
          .map((d) => d.roles[name]),
      ));
    }
  } else if (options.discords) {
  // for restricted discords servers
    if (typeof options.name === 'string') {
      options.discords.forEach((discord) => output.push(
        ...config.discords
          .filter((d) => d.roles !== undefined && d.roles[options.name as string] !== undefined && d.name === discord)
          .map((d) => d.roles[options.name as string]),
      ));
    } else {
      options.name.forEach((name) => (options.discords as Array<string>).forEach((discord) => output.push(
        ...config.discords
          .filter((d) => d.roles !== undefined && d.roles[name] !== undefined && d.name === discord)
          .map((d) => d.roles[name]),
      )));
    }
  }

  // for all discords teams
  if (options.teams === 'all') {
    if (typeof options.name === 'string') {
      output.push(
        ...config.teams
          .filter((t) => t.roles !== undefined && t.roles[options.name as string] !== undefined)
          .map((t) => t.roles[options.name as string])
          .flat(),
      );
    } else {
      options.name.forEach((name) => output.push(
        ...config.teams
          .filter((t) => t.roles !== undefined && t.roles[name] !== undefined)
          .map((t) => t.roles[name])
          .flat(),
      ));
    }
  } else if (options.teams) {
  // for restricted discords teams
    if (typeof options.name === 'string') {
      options.teams.forEach((team) => output.push(
        ...config.teams
          .filter((t) => t.roles !== undefined && t.roles[options.name as string] !== undefined && t.name === team)
          .map((t) => t.roles[options.name as string])
          .flat(),
      ));
    } else {
      options.name.forEach((name) => (options.teams as Array<string>).forEach((team) => output.push(
        ...config.teams
          .filter((t) => t.roles !== undefined && t.roles[name] !== undefined && t.name === team)
          .map((t) => t.roles[name])
          .flat(),
      )));
    }
  }

  return output;
};

export default getRolesIds;
