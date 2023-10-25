import commands from "@/lang/en-US/commands.json";
import errors from "@/lang/en-US/errors.json";
import { mergeDeep } from "@utility/objects";

export const JSONFiles = ["commands", "errors"];
export const baseTranslations = { ...commands, ...errors };
export type AllStrings = typeof baseTranslations;

/**
 * Load strings based on interaction language
 * @author Evorp
 * @returns string output in correct language
 */
export function strings(forceEnglish = false): AllStrings {
	const countryCode = this.locale;
	let baseLang: AllStrings;
	// load all english strings into one lang object
	for (const json of JSONFiles)
		baseLang = {
			...baseLang,
			...require(`@/lang/en-US/${json}.json`),
		};

	if (forceEnglish || ["en-GB", "en-US"].includes(countryCode)) return baseLang;

	// not in english
	for (const json of JSONFiles)
		try {
			// try importing before adding to prevent errors if language isn't done
			const translatedLang = require(`@/lang/${countryCode}/${json}.json`);

			// merge all properties of object (if translation not done/updated yet on crowdin it falls back to english)
			baseLang = mergeDeep({}, baseLang, translatedLang);
		} catch {} // file not found

	return baseLang;
}
