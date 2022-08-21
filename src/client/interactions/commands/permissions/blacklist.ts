import { IHandler } from '@interfaces';
import {
  CacheType,
  ChatInputCommandInteraction,
  Collection,
} from 'discord.js';

import {
  buildCommand,
  listCommand,
  setCommand,
} from './whitelist';

export default {
  config: () => ({}),
  data: () => buildCommand('blacklist'),
  handler: new Collection<string, IHandler>()
    .set(String.get('blacklist_subcommand_role_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('roles', 'blacklist', interaction))
    .set(String.get('blacklist_subcommand_user_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('users', 'blacklist', interaction))
    .set(String.get('blacklist_subcommand_channel_name'), (interaction: ChatInputCommandInteraction<CacheType>) => setCommand('channels', 'blacklist', interaction))
    .set('list', (interaction: ChatInputCommandInteraction) => listCommand('blacklist', interaction)),
};
