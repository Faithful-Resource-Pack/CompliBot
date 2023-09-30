import commands from "@/lang/en-US/commands.json";
import messages from "@/lang/en-US/messages.json";

export const JSONFiles = ["commands", "messages"];
export const en_US = { ...commands, ...messages };

export type StringOutput = typeof en_US;

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
