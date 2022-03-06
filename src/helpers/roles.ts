import { Config } from "./interfaces";
import configJson from "@json/config.json";

const config: Config = configJson;

export const getRolesIds = (name: string): Array<string> => {
  return [
    ...config.teams.filter(t => t.roles !== undefined && t.roles[name] !== undefined).map(t => t.roles[name]).flat(),
    ...config.discords.filter(d => d.roles !== undefined && d.roles[name] !== undefined).map(d => d.roles[name])
  ];
}