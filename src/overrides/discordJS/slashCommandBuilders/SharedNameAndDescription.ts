import { SharedNameAndDescription, LocalizationMap, LocaleString } from 'discord.js';

export class ExtendedSharedNameAndDescription extends SharedNameAndDescription {
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
}
