import type { LocaleString, LocalizationMap } from 'discord-api-types/v10';
import { SharedNameAndDescription } from 'discord.js';

declare module '@discordjs/builders/dist/interactions/slashCommands/mixins/NameAndDescription' {
  interface SharedNameAndDescription {
    /**
     * Sets the names of the command for both the default name & localized names.
     * @param {LocalizationMap} input The localization map
     * @param {LocaleString} locale The locale to use
     */
    setNames(input: LocalizationMap, locale?: LocaleString): this;

    /**
     * Sets the descriptions of the command for both the default description & localized descriptions.
     * @param {LocalizationMap} input The localization map
     * @param {LocaleString} locale The locale to use
     */
    setDescriptions(input: LocalizationMap, locale?: LocaleString): this;
  }
}

if (!SharedNameAndDescription.prototype.setNames) {
  Object.defineProperty(SharedNameAndDescription.prototype, 'setNames', {
    value: function setNames(input: LocalizationMap, locale: LocaleString = 'en-US') {
      if (!input[locale]) throw new Error(`No localization found for locale ${locale}`);

      this.setName(input[locale]!);
      this.setNameLocalizations(input);

      return this;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

if (!SharedNameAndDescription.prototype.setDescriptions) {
  Object.defineProperty(SharedNameAndDescription.prototype, 'setDescriptions', {
    value: function setDescriptions(input: LocalizationMap, locale: LocaleString = 'en-US') {
      if (!input[locale]) throw new Error(`No localization found for locale ${locale}`);

      this.setDescription(input[locale]!);
      this.setDescriptionLocalizations(input);

      return this;
    },
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

export { SharedNameAndDescription };
