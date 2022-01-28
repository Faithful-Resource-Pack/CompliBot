import { CommandInteraction } from "discord.js";
import { string, stringKey } from "@functions/string";

declare module "discord.js" {
	interface CommandInteraction {
		/**
		 * @author Nick-1666
		 * @description a useful function for translating string keys into the users language.
		 *
		 * USAGE:
		 * -    `%EMOJI.<emoji name>%` gets parsed as an emoji from "ids"
		 * -    `%{KEY}%` gets parsed as its value pair as defined in the placeholders object (if given).
		 * -    Arrays get parsed as strings with "$," as their seperator. A `.split("$,")` can be appended to convert back
		 * -    Should the key `%IGNORE_MISSING%` be equal to "True" (case insensitive), missing keys wont default to en-US.
		 * -    if a language is not yet implemented, en_US will be used as a default but "(untranslated) " will prefix it.
		 *
		 * NOTE:
		 * -    if placeholders are only partialy provided, the rest of the keys will not get parsed.
		 */
		text(key: stringKey, placeholders?: { [key: Capitalize<string>]: string }): Promise<string>;
	}
}

//todo: document all replacements, emojis and DONT_REPORT_MISSING: "True" key

CommandInteraction.prototype.text = async function (
	key: stringKey,
	placeholders?: { [key: Capitalize<string>]: string },
): Promise<string> {
	return await string(this.locale, key, placeholders);
};

export default CommandInteraction;
