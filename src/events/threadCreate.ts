import { ThreadChannel } from "discord.js";
import type { Event } from "@interfaces/events";

export default {
	name: "threadCreate",
	async execute(client, thread: ThreadChannel) {
		if (thread.joinable) await thread.join().catch(console.error);
	},
} as Event;
