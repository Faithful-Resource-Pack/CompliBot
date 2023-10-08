import commands from "@/lang/en-US/commands.json";
import errors from "@/lang/en-US/errors.json";

export const JSONFiles = ["commands", "errors"];
export const baseTranslations = { ...commands, ...errors };
export type AllStrings = typeof baseTranslations;

/**
 * Load strings based on interaction language
 * @author Evorp
 * @returns string output in correct language
 */
export function strings(): AllStrings {
	const countryCode = this.locale;
	let lang: AllStrings;
	// load all english strings into one lang object
	for (const json of JSONFiles)
		lang = {
			...lang,
			...require(`@/lang/en-US/${json}.json`), // fallback
		};

	if (countryCode == "en-GB" || countryCode == "en-US") return lang;

	// because the fallback is already IN ENGLISH
	for (const json of JSONFiles)
		try {
			//* We try the import before spreading the object to avoid issues, we only want to check if the file exists
			const lang2 = require(`@/lang/${countryCode}/${json}.json`);
			lang = { ...lang, ...lang2 };
		} catch {} // file not found

	return lang;
}

/**
 * @important
 * If Discord adds a language, what should I do?
 * - [Add it to workflow file on crowdin](https://faithful.crowdin.com/u/projects/4/workflow)
 * - [Update the language list below using](https://discord.com/developers/docs/reference#locales)
 * - [Update mapping on crowdin](https://faithful.crowdin.com/u/projects/4/apps/system/github) (select the branch > edit branch configuration > edit file filter > language mapping)
 */
