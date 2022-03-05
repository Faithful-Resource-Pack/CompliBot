import { ThreadChannel } from "discord.js";
import { Client } from "@src/Extended Discord";
import { Event } from "@src/Interfaces";

export const event: Event = {
	name: "threadCreate",
	run: async (client: Client, thread: ThreadChannel) => {
		if (thread.joinable) await thread.join().catch(console.error);
	},
};
