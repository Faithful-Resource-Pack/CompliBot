import { ThreadChannel } from "discord.js";
import { Client } from "@client";
import { Event } from "@interfaces/events";

export default {
	name: "threadCreate",
	async execute(client: Client, thread: ThreadChannel) {
		if (thread.joinable) await thread.join().catch(console.error);
	},
} as Event;
