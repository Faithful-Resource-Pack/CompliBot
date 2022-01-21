import { Event } from "@src/Interfaces";
import { sucsess } from "@src/Helpers/logger";

export const event: Event = {
	name: "ready",
	run: async (client) => {
		console.log(`${sucsess}${client.user.tag} is online.`);

		// client.guilds.cache.each((guild: Guild) => client.updateMembers(guild.id, client.config.discords.filter((s) => s.id === guild.id)[0].updateMember));
		client.user.setActivity(`${client.tokens.prefix}help`, { type: "LISTENING" });
	},
};
