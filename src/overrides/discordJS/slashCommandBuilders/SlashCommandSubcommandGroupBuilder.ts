import { Mixin } from 'ts-mixer';
import { SlashCommandSubcommandGroupBuilder } from 'discord.js';
import { ExtendedSharedNameAndDescription } from './SharedNameAndDescription';
import { ExtendedSharedSlashCommandOptions } from './SharedSlashCommandOptions';

export class LocalizedSlashCommandSubcommandGroupBuilder extends Mixin(SlashCommandSubcommandGroupBuilder, ExtendedSharedNameAndDescription, ExtendedSharedSlashCommandOptions) {}
