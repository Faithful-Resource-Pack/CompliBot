import { Mixin } from 'ts-mixer';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

import { ExtendedSharedNameAndDescription } from './SharedNameAndDescription';
import { ExtendedSharedSlashCommandOptions } from './SharedSlashCommandOptions';
import { LocalizedSlashCommandSubcommandBuilder } from './slashCommandSubcommandBuilder';
import { addLocalizedOption, LocalizedOption } from '.';
import { LocalizedSlashCommandSubcommandGroupBuilder } from './SlashCommandSubcommandGroupBuilder';

export class LocalizedSlashCommandBuilder extends Mixin(SlashCommandBuilder, ExtendedSharedNameAndDescription, ExtendedSharedSlashCommandOptions) {
  constructor() {
    super();
    this.setDMPermission(false); // Default to guild only
  }

  /**
   * Sets if the command is available in DMs with the application, only for globally-scoped commands.
   * ~~By default, commands are visible.~~
   *
   * **Extended version: By default, commands are not visible.**
   *
   * @param enabled - If the command should be enabled in DMs
   * @see https://discord.com/developers/docs/interactions/application-commands#permissions
   */
  setDMPermission(enabled: boolean | null | undefined): this {
    return super.setDMPermission(enabled);
  }

  /**
   * Adds a new **localized** subcommand group to this command
   * @param {Input<LocalizedSlashCommandSubcommandGroupBuilder>} input A function that returns a subcommand group builder, or an already built builder
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {ExtendedSlashCommandSubcommandsOnlyBuilder|this}
   */
  addLocalizedSubcommandGroup(input: Input<LocalizedSlashCommandSubcommandGroupBuilder>, localized: LocalizedOption): ExtendedSlashCommandSubcommandsOnlyBuilder {
    return super.addSubcommandGroup(addLocalizedOption(input, localized, new SlashCommandSubcommandGroupBuilder())) as this;
  }

  /**
   * Adds a new **localized** subcommand group to this command
   * @param {Input<LocalizedSlashCommandSubcommandBuilder>} input A function that returns a subcommand builder, or an already built builder
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {ExtendedSlashCommandSubcommandsOnlyBuilder|this}
   */
  addLocalizedSubcommand(input: Input<LocalizedSlashCommandSubcommandBuilder>, localized: LocalizedOption): ExtendedSlashCommandSubcommandsOnlyBuilder {
    return super.addSubcommand(addLocalizedOption(input, localized, new SlashCommandSubcommandBuilder())) as this;
  }
}

/** Small shortcut to avoid having lines of 2000 characters */
type Input<T> = T | ((subcommandGroup: T) => T);

/** 'Extended' interface of @see SlashCommandSubcommandsOnlyBuilder */
export interface ExtendedSlashCommandSubcommandsOnlyBuilder extends ExtendedSharedNameAndDescription, Pick<LocalizedSlashCommandBuilder, 'toJSON' | 'addSubcommand' | 'addSubcommandGroup' | 'addLocalizedSubcommand' | 'addLocalizedSubcommandGroup'> {}
