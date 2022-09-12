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
  SlashCommandUserOption,
} from 'discord.js';

interface LocalizedOption {
  names: LocalizationMap;
  descriptions: LocalizationMap,
  locale?: LocaleString, // default: 'en-US'
}

class ExtSlashBuilder extends SlashCommandBuilder {
  constructor() {
    super();
    this.setDMPermission(false);
  }

  /**
   * Sets if the command is available in DMs with the application, only for globally-scoped commands.
   * ~~By default, commands are visible.~~
   *
   * **Extended version: By default, commands are not visible.**
   *
   * @param enabled - If the command should be enabled in DMs
   *
   * @see https://discord.com/developers/docs/interactions/application-commands#permissions
   */
  setDMPermission(enabled = false) {
    return super.setDMPermission(enabled);
  }

  /**
   * Sets the name and the name localizations
   * @author @Juknum
   * @param localizedNames - The dictionary of localized names to set
   * @param locale - The locale to set the base name for
   */
  setNames(localizedNames: LocalizationMap, locale: LocaleString = 'en-US') {
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
  setDescriptions(localizedDescriptions: LocalizationMap, locale: LocaleString = 'en-US') {
    if (!localizedDescriptions[locale]) throw new Error(`No description provided for the given locale ${locale}`);

    super.setDescription(localizedDescriptions[locale]!);
    super.setDescriptionLocalizations(localizedDescriptions);

    return this;
  }

  /**
   * Extends the addStringOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addStringOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addStringOptionLocalized(options: null | Parameters<SlashCommandBuilder['addStringOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addStringOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandStringOption()));
  }

  /**
   * Extends the addAttachmentOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addAttachmentOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addAttachmentOptionLocalized(options: null | Parameters<SlashCommandBuilder['addAttachmentOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addAttachmentOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandStringOption()));
  }

  /**
   * Extends the addBooleanOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addBooleanOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addBooleanOptionLocalized(options: null | Parameters<SlashCommandBuilder['addBooleanOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addBooleanOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandBooleanOption()));
  }

  /**
   * Extends the addChannelOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addChannelOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addChannelOptionLocalized(options: null | Parameters<SlashCommandBuilder['addChannelOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addChannelOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandChannelOption()));
  }

  /**
   * Extends the addMentionableOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addIntegerOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addIntegerOptionLocalized(options: null | Parameters<SlashCommandBuilder['addIntegerOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addIntegerOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandIntegerOption()));
  }

  /**
   * Extends the addMentionableOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addMentionableOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addMentionableOptionLocalized(options: null | Parameters<SlashCommandBuilder['addMentionableOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addMentionableOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandMentionableOption()));
  }

  /**
   * Extends the addNumberOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addNumberOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addNumberOptionLocalized(options: null | Parameters<SlashCommandBuilder['addNumberOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addNumberOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandNumberOption()));
  }

  /**
   * Extends the addRoleOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addRoleOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addRoleOptionLocalized(options: null | Parameters<SlashCommandBuilder['addRoleOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addRoleOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandRoleOption()));
  }

  /**
   * Extends the addUserOption function to add localized parameters
   * @param {Parameters<SlashCommandBuilder['addUserOption']>[0]} options - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @returns {Omit<this, "addSubcommand" | "addSubcommandGroup">}
   */
  addUserOptionLocalized(options: null | Parameters<SlashCommandBuilder['addUserOption']>[0], localized: LocalizedOption): Omit<this, 'addSubcommand' | 'addSubcommandGroup'> {
    return super.addUserOption(ExtSlashBuilder.addLocalizedOption(options, localized, new SlashCommandUserOption()));
  }

  /**
   * All in one function for localized parameters (pain)
   * @author @Juknum
   * @param {T} builder - A function that returns an option builder, or an already built
   * @param {LocalizedOption} localized - The localized parameters
   * @param {K} emptyOption - An empty option to build from (for type inference)
   * @returns {} Something thats acceptable for the add*Option functions
   */
  private static addLocalizedOption<T, K>(builder: T | null, localized: LocalizedOption, emptyOption: K) {
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
}

export {
  ExtSlashBuilder as SlashCommandBuilder,
};

// Non-generic version of .addLocalizedOption()
// if (typeof options === 'function') {
//   super.addStringOption(() => {
//     const option = options(new SlashCommandStringOption());
//     option.setName(localized.names[localized.locale || 'en-US']!);
//     option.setNameLocalizations(localized.names);
//     option.setDescription(localized.descriptions[localized.locale || 'en-US']!);
//     option.setDescriptionLocalizations(localized.descriptions);

//     console.log(option);
//     return option;
//   });
// } else {
//   super.addStringOption((option) => option
//     .setName(localized.names[localized.locale || 'en-US']!)
//     .setNameLocalizations(localized.names)
//     .setDescription(localized.descriptions[localized.locale || 'en-US']!))
//     .setDescriptionLocalizations(localized.descriptions);
// }

// return this;
