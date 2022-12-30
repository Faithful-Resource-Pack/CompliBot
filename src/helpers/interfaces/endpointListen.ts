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

type Destinator = 'channels' | 'users';
type DestinationsObject = { [d in Destinator]?: string[] };

export interface PostMessage {
  destinations?: DestinationsObject,
  destinator: string,
  embed: MessageEmbed
}
