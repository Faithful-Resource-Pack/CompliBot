import type { Event } from "@interfaces/events";
import { success } from "@helpers/logger";
import { ActivityType } from "discord.js";

export default {
	name: "clientReady",
	async execute(client) {
		console.log(`${success}${client.user.username} is online!`);
		client.user.setActivity(`commands`, { type: ActivityType.Listening });
	},
} as Event;
