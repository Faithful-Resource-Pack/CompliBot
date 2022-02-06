import { Client } from "@src/Extended Discord";
import { Guild } from "discord.js";
import { Event } from "@src/Interfaces";

export const event: Event = {
	name: "guildMemberAdd",
	run: async (client: Client, guild: Guild) => {
		client.updateMembers(guild.id, client.config.discords.filter((s) => s.id === guild.id)[0].updateMember);
	},
};
