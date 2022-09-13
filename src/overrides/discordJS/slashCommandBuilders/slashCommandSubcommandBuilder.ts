import { Mixin } from 'ts-mixer';
import { SlashCommandSubcommandBuilder } from 'discord.js';
import { SlashCommon } from '.';

export class LocalizedSlashCommandSubcommandBuilder extends Mixin(SlashCommandSubcommandBuilder, SlashCommon(new SlashCommandSubcommandBuilder())) {}
