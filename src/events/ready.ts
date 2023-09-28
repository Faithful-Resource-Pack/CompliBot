import { Event } from "@interfaces";
import { success } from "@helpers/logger";
import { fetchSettings } from "@helpers/fetchSettings";
import { ActivityType } from "discord.js";

export default {
	name: "ready",
	async execute(client) {
		console.log(`${success}${client.user.username} is online!`);
		client.user.setActivity(`commands`, { type: ActivityType.Listening });

		await fetchSettings(client);
	},
} as Event;
