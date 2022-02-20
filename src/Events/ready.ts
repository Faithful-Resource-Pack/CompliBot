import { Event } from "@src/Interfaces";
import { Success } from "@src/Helpers/logger";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${Success}${client.user.tag} is online.`);
		client.user.setActivity(`with other packs.`, { type: "COMPETING" });
	},
};
