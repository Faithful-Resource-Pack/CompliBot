import { Client } from "@client";
import { GuildMember } from "discord.js";
import { Event } from "@helpers/interfaces";

export const event: Event = {
	name: "guildMemberAdd",
	run: async (client: Client, member: GuildMember) => {
		const updateChannel: string = client.config.discords.filter((s) => s.id === member.guild.id).pop()
			.channels.updateMember;
		if (updateChannel) client.updateMembers(member.guild.id, updateChannel);
	},
};
