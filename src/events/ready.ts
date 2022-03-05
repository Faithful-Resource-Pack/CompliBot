import { Event } from "@helpers/interfaces";
import { success } from "@helpers/logger";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${success}${client.user.tag} is online.`);
		client.user.setActivity(`with other packs.`, { type: "COMPETING" });

		client.config.discords.forEach((guild) => {
			if (guild.channels.updateMember) client.updateMembers(guild.id, guild.channels.updateMember);
		});
	},
};
