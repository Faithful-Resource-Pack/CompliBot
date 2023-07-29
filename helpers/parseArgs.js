const warnUser = require("./warnUser");
const strings = require("../resources/strings.json");

/**
 * @author Juknum
 * @param {import("discord.js").Message} message Discord Message
 * @param {Array} args Array of String
 * @returns {String[]} parsed args
 */
module.exports = function parseArgs(message, args) {
	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith("-")) {
			for (let j = i + 1; j < args.length; j++) {
				if (args[j].startsWith("-")) break;
				else {
					args[i] += ` ${args[j]}`;
					args[j] = "";
				}
			}
		} else if (args[i] != "") warnUser(message, strings.command.args.parse);
	}

	return args.filter((a) => a !== "");
};
