/* eslint-disable max-classes-per-file */
import { LocaleString, LocalizationMap } from 'discord.js';

export interface LocalizedOption {
  names: LocalizationMap;
  descriptions: LocalizationMap,
  locale?: LocaleString, // default: 'en-US'
}

/**
 * All in one function for localized parameters (pain)
 * @Juknum
 * @param {T} builder - A function that returns an option builder, or an already built
 * @param {LocalizedOption} localized - The localized parameters
 * @param {K} emptyOption - An empty option to build from (for type inference)
 * @returns {*} Something thats acceptable for the add*Option functions
 */
export function addLocalizedOption<T, K>(builder: T | null, localized: LocalizedOption, emptyOption: K): ((builder: K) => K) | K {
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
