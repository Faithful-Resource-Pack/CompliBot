import { Event } from "@interfaces";
import { success } from "@helpers/logger";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${success}${client.user.username} is online.`);
		client.user.setActivity(`Tom Clancy's Rainbow Six: Siege`, { type: "COMPETING" });

		client.config.discords.forEach((guild) => {
			if (guild.channels.updateMember) client.updateMembers(guild.id, guild.channels.updateMember);
		});
	},
};
