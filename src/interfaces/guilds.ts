import { ColorResolvable, Snowflake } from 'discord.js';

export interface IGuilds {
  teams: Array<{
    name: string,
    guilds: Array<Snowflake>,
  }>,
  guilds: {
    [guildId: Snowflake]: {
      name: string,
      license?: string,
      rules?: {
        [ruleIndex: number]: IRule,
        icon?: string,
        color?: ColorResolvable,
        header?: {
          title: string,
          description: string,
          thumbnail?: string,
        },
        footer?: {
          title: string,
          description: string,
        },
      }
    }
  }
}

export interface IRule {
  index: number,
  title: string,
  description: string,
}
