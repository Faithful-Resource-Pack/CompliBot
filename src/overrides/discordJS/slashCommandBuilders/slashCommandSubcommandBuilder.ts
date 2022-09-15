import { Mixin } from 'ts-mixer';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { ExtendedSharedNameAndDescription } from './SharedNameAndDescription';
import { ExtendedSharedSlashCommandOptions } from './SharedSlashCommandOptions';

export class LocalizedSlashCommandSubcommandBuilder extends Mixin(SlashCommandSubcommandBuilder, ExtendedSharedNameAndDescription, ExtendedSharedSlashCommandOptions) {}
