import {
  SharedSlashCommandOptions,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandUserOption,
  SlashCommandAttachmentOption,
} from 'discord.js';
import { addLocalizedOption, LocalizedOption } from '.';

export class ExtendedSharedSlashCommandOptions extends SharedSlashCommandOptions {
  /**
     * Extends the addStringOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addStringOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedStringOption(options: null | Parameters<SharedSlashCommandOptions['addStringOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addStringOption(addLocalizedOption(options, localized, new SlashCommandStringOption()));
  }

  /**
     * Extends the addAttachmentOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addAttachmentOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedAttachmentOption(options: null | Parameters<SharedSlashCommandOptions['addAttachmentOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addAttachmentOption(addLocalizedOption(options, localized, new SlashCommandAttachmentOption()));
  }

  /**
     * Extends the addBooleanOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addBooleanOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedBooleanOption(options: null | Parameters<SharedSlashCommandOptions['addBooleanOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addBooleanOption(addLocalizedOption(options, localized, new SlashCommandBooleanOption()));
  }

  /**
     * Extends the addChannelOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addChannelOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedChannelOption(options: null | Parameters<SharedSlashCommandOptions['addChannelOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addChannelOption(addLocalizedOption(options, localized, new SlashCommandChannelOption()));
  }

  /**
     * Extends the addMentionableOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addIntegerOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedIntegerOption(options: null | Parameters<SharedSlashCommandOptions['addIntegerOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addIntegerOption(addLocalizedOption(options, localized, new SlashCommandIntegerOption()));
  }

  /**
     * Extends the addMentionableOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addMentionableOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedMentionableOption(options: null | Parameters<SharedSlashCommandOptions['addMentionableOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addMentionableOption(addLocalizedOption(options, localized, new SlashCommandMentionableOption()));
  }

  /**
     * Extends the addNumberOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addNumberOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedNumberOption(options: null | Parameters<SharedSlashCommandOptions['addNumberOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addNumberOption(addLocalizedOption(options, localized, new SlashCommandNumberOption()));
  }

  /**
     * Extends the addRoleOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addRoleOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedRoleOption(options: null | Parameters<SharedSlashCommandOptions['addRoleOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addRoleOption(addLocalizedOption(options, localized, new SlashCommandRoleOption()));
  }

  /**
     * Extends the addUserOption function to add localized parameters
     * @param {Parameters<SharedSlashCommandOptions['addUserOption']>[0]} options - A function that returns an option builder, or an already built
     * @param {LocalizedOption} localized - The localized parameters
     * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
     */
  addLocalizedUserOption(options: null | Parameters<SharedSlashCommandOptions['addUserOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addUserOption(addLocalizedOption(options, localized, new SlashCommandUserOption()));
  }
}
