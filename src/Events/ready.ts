import { Event } from "@src/Interfaces";
import { sucsess } from "@src/Helpers/logger";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${sucsess}${client.user.tag} is online.`);
		client.user.setActivity(`${client.tokens.prefix}help`, { type: "LISTENING" });
	},
};
