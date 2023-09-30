import commands from "@/lang/en-US/commands.json";
import messages from "@/lang/en-US/messages.json";

export const JSONFiles = ["commands", "messages"];
export const en_US = { ...commands, ...messages };

export type StringOutput = typeof en_US;

/**
 * @important
 * If Discord adds a language, what should I do?
 * - [Add it to workflow file on crowdin](https://faithful.crowdin.com/u/projects/4/workflow)
 * - [Update the language list below using](https://discord.com/developers/docs/reference#locales)
 * - [Update mapping on crowdin](https://faithful.crowdin.com/u/projects/4/apps/system/github) (select the branch > edit branch configuration > edit file filter > language mapping)
 */
export type langs =
	| "bg" // Bulgarian
	| "cs" // Czech
	| "da" // Danish
	| "de" // German
	| "el" // Greek
	| "en-GB" // English (UK)
	| "en-US" // English (US)
	| "es-ES" // Spanish
	| "fi" // Finnish
	| "fr" // French
	| "hi" // Hindi
	| "hr" // Croatian
	| "hu" // Hungarian
	| "it" // Italian
	| "ja" // Japanese
	| "ko" // Korean
	| "lt" // Lithuanian
	| "nl" // Dutch
	| "no" // Norwegian
	| "pl" // Polish
	| "pt-BR" // Portuguese (Brazil)
	| "ro" // Romanian
	| "ru" // Russian
	| "sv-SE" // Swedish
	| "th" // Thai
	| "tr" // Turkish
	| "uk" // Ukrainian
	| "vi" // Vietnamese
	| "zh-CN" // Chinese (Simplified)
	| "zh-TW"; // Chinese (Traditional)
