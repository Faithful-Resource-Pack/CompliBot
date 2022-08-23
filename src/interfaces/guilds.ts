import { Snowflake } from 'discord.js';

export interface IGuilds {
  teams: Array<{
    name: string,
    guilds: Array<Snowflake>,
  }>,
  guilds: {
    [guildId: Snowflake]: {
      name: string,
      license?: string,
    }
  }
}
