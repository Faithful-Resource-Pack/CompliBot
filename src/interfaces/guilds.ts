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
      color?: ColorResolvable,
      rules?: {
        [ruleIndex: number]: IRule,
        icon?: string,
        channel?: Snowflake,
        header?: {
          title: string,
          description: string,
          thumbnail?: string,
        },
        footer?: {
          title: string,
          description: string,
          footer?: {
            text: string,
            icon?: string,
          }
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
