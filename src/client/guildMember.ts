import { GuildMember } from 'discord.js';

declare module 'discord.js' {
  interface GuildMember {
    createdTimestamp: number;
    reason: string;
  }
}

// eslint-disable-next-line import/prefer-default-export
export { GuildMember };
