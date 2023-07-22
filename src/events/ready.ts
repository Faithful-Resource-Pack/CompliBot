import { Event } from "@interfaces";
import { success } from "@helpers/logger";
import { fetchSettings } from "@helpers/fetchSettings";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${success}${client.user.username} is online!`);
		client.user.setActivity(`commands`, { type: "LISTENING" });

		await fetchSettings(client);
	},
};
