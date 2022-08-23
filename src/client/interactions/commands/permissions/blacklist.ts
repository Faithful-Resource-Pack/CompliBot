import { ICommand, IHandler } from '@interfaces';
import { ChatInputCommandInteraction } from '@overrides';
import { Collection } from 'discord.js';

import {
  buildCommand,
  listCommand,
  setCommand,
} from './whitelist';

export default {
  config: () => ({}),
  data: () => buildCommand('blacklist'),
  handler: new Collection<string, IHandler>()
    .set(String.get('blacklist_subcommand_role_name'), (interaction: ChatInputCommandInteraction) => setCommand('roles', 'blacklist', interaction))
    .set(String.get('blacklist_subcommand_user_name'), (interaction: ChatInputCommandInteraction) => setCommand('users', 'blacklist', interaction))
    .set(String.get('blacklist_subcommand_channel_name'), (interaction: ChatInputCommandInteraction) => setCommand('channels', 'blacklist', interaction))
    .set('list', (interaction: ChatInputCommandInteraction) => listCommand('blacklist', interaction)),
} as ICommand;
