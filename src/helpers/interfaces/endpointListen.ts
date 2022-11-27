import { MessageEmbed } from 'discord.js';

export interface EndpointMessage {
  type: string,
  content: {
    message: string | null,
    code: number,
    err: any,
    req: any,
    stack: string,
  }
}

export interface PostMessage {
  destinator: string,
  embed: MessageEmbed
}
