import { string, keys } from "@helpers/string";
import { Command } from "@helpers/interfaces";

export const command: Command = {
	name: "test",
	description: "eee",
	usage: ["t"],
	aliases: ["t"],
	run: async (client, message, args) => {
		message.reply("old commands still works");
	},
};
