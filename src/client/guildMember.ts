import { GuildMember } from "discord.js";

declare module "discord.js" {
  interface GuildMember {
    createdTimestamp: number;
    reason: string;
  }
}

export { GuildMember };