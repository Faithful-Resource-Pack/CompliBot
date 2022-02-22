import { Client } from "@src/Extended Discord";
import { GuildMember } from "discord.js";
import { Event } from "@src/Interfaces";

export const event: Event = {
	name: "guildMemberAdd",
	run: async (client: Client, member: GuildMember) => {
		const updateChannel: string = client.config.discords.filter((s) => s.id === member.guild.id).pop().channels.updateMember;
		if (updateChannel) client.updateMembers(member.guild.id, updateChannel);
	},
};
