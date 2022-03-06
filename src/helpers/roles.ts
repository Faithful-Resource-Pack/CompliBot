import { Config } from "./interfaces";
import configJson from "@json/config.json";

const config: Config = configJson;

export const getRolesIds = (options: { name: string, discords?: Array<string> | "all", teams?: Array<string> | "all" }): Array<string> => {
  const output: Array<string> = [];

  if (options.discords === "all") 
    output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[options.name] !== undefined).map(d => d.roles[options.name]));
  else if (options.discords)
    options.discords.forEach(discord => output.push(...config.discords.filter(d => d.roles !== undefined && d.roles[options.name] !== undefined && d.name === discord).map(d => d.roles[options.name])));

  if (options.teams === "all") 
    output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[options.name] !== undefined).map(t => t.roles[options.name]).flat());
  else if (options.teams)
    options.teams.forEach(team => output.push(...config.teams.filter(t => t.roles !== undefined && t.roles[options.name] !== undefined && t.name === team).map(t => t.roles[options.name]).flat()));
  
  console.log(output, options);
  return output;
}