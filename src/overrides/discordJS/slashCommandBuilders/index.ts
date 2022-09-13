/* eslint-disable max-classes-per-file */
import {
  LocaleString,
  LocalizationMap,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from 'discord.js';

export { LocalizedSlashCommandBuilder } from './slashCommandBuilder';
export { LocalizedSlashCommandSubcommandBuilder } from './slashCommandSubcommandBuilder';

interface LocalizedOption {
  names: LocalizationMap;
  descriptions: LocalizationMap,
  locale?: LocaleString, // default: 'en-US'
}

/**
 * All in one function for localized parameters (pain)
 * @author @Juknum
 * @param {T} builder - A function that returns an option builder, or an already built
 * @param {LocalizedOption} localized - The localized parameters
 * @param {K} emptyOption - An empty option to build from (for type inference)
 * @returns {*} Something thats acceptable for the add*Option functions
 */
function addLocalizedOption<T, K>(builder: T | null, localized: LocalizedOption, emptyOption: K): any {
  localized.locale = localized.locale ?? 'en-US';

  return (() => {
    const option = typeof builder === 'function' ? builder(emptyOption) : (builder ?? emptyOption);
    option.setName(localized.names[localized.locale!]);
    option.setNameLocalizations(localized.names);

    option.setDescription(localized.descriptions[localized.locale!]);
    option.setDescriptionLocalizations(localized.descriptions);

    return option;
  });
}

/**
 * Create an anonymous class that extends the given builder
 * @param {SlashCommandBuilder|SlashCommandSubcommandBuilder} T - The builder to extend
 * @returns {} An anonymous class that extends the given builder
 */
export function SlashCommon<T extends SlashCommandBuilder | SlashCommandSubcommandBuilder>(Base: T) {
  return class extends (Base instanceof SlashCommandBuilder ? SlashCommandBuilder : SlashCommandSubcommandBuilder) {
    /**
   * Sets the name and the name localizations
   * @author @Juknum
   * @param localizedNames - The dictionary of localized names to set
   * @param locale - The locale to set the base name for
   */
    setNames(localizedNames: LocalizationMap, locale: LocaleString = 'en-US'): this {
      if (!localizedNames[locale]) { throw new Error(`No name provided for the given locale ${locale}`); }

      super.setName(localizedNames[locale]!);
      super.setNameLocalizations(localizedNames);

      return this;
    }

    /**
   * Sets the description and the description localizations
   * @author @Juknum
   * @param localizedDescriptions - The dictionary of localized descriptions to set
   * @param locale - The locale to set the base name for
   */
    setDescriptions(localizedDescriptions: LocalizationMap, locale: LocaleString = 'en-US'): this {
      if (!localizedDescriptions[locale]) throw new Error(`No description provided for the given locale ${locale}`);

      super.setDescription(localizedDescriptions[locale]!);
      super.setDescriptionLocalizations(localizedDescriptions);

      return this;
    }

    /**
   * Extends the addStringOption function to add localized parameters
   * @param {Parameters<T['addStringOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedStringOption(options: null | Parameters<T['addStringOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addStringOption(addLocalizedOption(options, localized, new SlashCommandStringOption()));
    }

    /**
   * Extends the addAttachmentOption function to add localized parameters
   * @param {Parameters<T['addAttachmentOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedAttachmentOption(options: null | Parameters<T['addAttachmentOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addAttachmentOption(addLocalizedOption(options, localized, new SlashCommandStringOption()));
    }

    /**
   * Extends the addBooleanOption function to add localized parameters
   * @param {Parameters<T['addBooleanOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedBooleanOption(options: null | Parameters<T['addBooleanOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addBooleanOption(addLocalizedOption(options, localized, new SlashCommandBooleanOption()));
    }

    /**
   * Extends the addChannelOption function to add localized parameters
   * @param {Parameters<T['addChannelOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedChannelOption(options: null | Parameters<T['addChannelOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addChannelOption(addLocalizedOption(options, localized, new SlashCommandChannelOption()));
    }

    /**
   * Extends the addMentionableOption function to add localized parameters
   * @param {Parameters<T['addIntegerOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedIntegerOption(options: null | Parameters<T['addIntegerOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addIntegerOption(addLocalizedOption(options, localized, new SlashCommandIntegerOption()));
    }

    /**
   * Extends the addMentionableOption function to add localized parameters
   * @param {Parameters<T['addMentionableOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedMentionableOption(options: null | Parameters<T['addMentionableOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addMentionableOption(addLocalizedOption(options, localized, new SlashCommandMentionableOption()));
    }

    /**
   * Extends the addNumberOption function to add localized parameters
   * @param {Parameters<T['addNumberOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedNumberOption(options: null | Parameters<T['addNumberOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addNumberOption(addLocalizedOption(options, localized, new SlashCommandNumberOption()));
    }

    /**
   * Extends the addRoleOption function to add localized parameters
   * @param {Parameters<T['addRoleOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedRoleOption(options: null | Parameters<T['addRoleOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addRoleOption(addLocalizedOption(options, localized, new SlashCommandRoleOption()));
    }

    /**
   * Extends the addUserOption function to add localized parameters
   * @param {Parameters<T['addUserOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
    addLocalizedUserOption(options: null | Parameters<T['addUserOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
      return super.addUserOption(addLocalizedOption(options, localized, new SlashCommandUserOption()));
    }
  };
}
