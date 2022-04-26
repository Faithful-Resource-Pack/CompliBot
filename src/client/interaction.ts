import { ButtonInteraction, CommandInteraction, SelectMenuInteraction } from "discord.js";
import { string, keys, Placeholder } from "@helpers/locales";

declare module "discord.js" {
	interface CommandInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}

	interface ButtonInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}

	interface SelectMenuInteraction {
		getEphemeralString(options: TextOptions): Promise<string>;
		getString(options: TextOptions): Promise<string>;
	}
}
interface TextOptions {
	string: keys;
	placeholders?: Placeholder;
}

/**
 * @author Nick-1666, Juknum
 * @description a function for translating string keys into the users language.
 * @important This function should only be used in ephemeral response as the string depends on the locale of the user.
 * 
 * USAGE:
 * - `%EMOJI.<emoji name>%` gets parsed as an emoji from "ids"
 * - `%{KEY}%` gets parsed as its value pair as defined in the placeholders object (if given).
 * - Arrays get parsed as strings with "$," as their separator. A `.split("$,")` can be appended to convert back
 * - Should the key `%IGNORE_MISSING%` be equal to "True" (case insensitive), missing keys wont default to en-US.
 * - if a language is not yet implemented, en_US will be used as a default but "(untranslated) " will prefix it.
 * - if placeholders are only partially provided, the rest of the keys will not get parsed.
 */
async function getEphemeralString(options: TextOptions): Promise<string> {
	return await string(this.locale, options.string, options.placeholders);
}

/**
 * @author Juknum
 * @description a function for translating string keys into the guild language.
 * @important This function should be used in public response as the string depends on the locale of the guild.
 */
async function getString(options: TextOptions): Promise<string> {
	return await string(this.guildLocale, options.string, options.placeholders);
}

CommandInteraction.prototype.getEphemeralString = getEphemeralString;
ButtonInteraction.prototype.getEphemeralString = getEphemeralString;
SelectMenuInteraction.prototype.getEphemeralString = getEphemeralString;

export { CommandInteraction, ButtonInteraction, SelectMenuInteraction };
