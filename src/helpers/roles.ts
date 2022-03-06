import { Config } from "./interfaces";
import configJson from "@json/config.json";

const config: Config = configJson;

/**
 * Get corresponding ids for the asked role name(s) in the asked discords & teams
 * @param options.name {string|Array<string>} role name (or names) you want ids
 * @param options.discords {"all"|Array<string>} discord servers names you want the role from (if string "all" is provided, all discords servers will be searched)
 * @param options.teams {"all"|Array<string>} discord teams names you want the role from (if string "all" is provided, all discords teams will be searched)
 * @returns {Array<string>} ids you searched
 */
export const getRolesIds = (options: { name: string | Array<string>, discords?: Array<string> | "all", teams?: Array<string> | "all" }): Array<string> => {
  const output: Array<string> = [];

  // for all discords servers
  if (options.discords === "all") 
    // for only 1 role specified
    if (typeof options.name === "string")
      output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[options.name as string] !== undefined).map(d => d.roles[options.name as string]));
    // for multiple specified roles
    else 
      options.name.forEach(name => output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[name] !== undefined).map(d => d.roles[name])));
  
  // for restricted discords servers
  else if (options.discords)
    if (typeof options.name === "string")
      options.discords.forEach(discord => output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[options.name as string] !== undefined && d.name === discord).map(d => d.roles[options.name as string])));
    else
      options.name.forEach(name => (options.discords as Array<string>).forEach(discord => output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[name] !== undefined && d.name === discord).map(d => d.roles[name]))));

  // for all discords teams
  if (options.teams === "all") 
    if (typeof options.name === "string")
      output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[options.name as string] !== undefined).map(t => t.roles[options.name as string]).flat());
    else
      options.name.forEach(name => output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[name] !== undefined).map(t => t.roles[name]).flat()));
  
  // for restricted discords teams
  else if (options.teams)
    if (typeof options.name === "string")
      options.teams.forEach(team => output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[options.name as string] !== undefined && t.name === team).map(t => t.roles[options.name as string]).flat()));
    else 
      options.name.forEach(name => (options.teams as Array<string>).forEach(team => output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[name] !== undefined && t.name === team).map(t => t.roles[name]).flat())));

  return output;
}