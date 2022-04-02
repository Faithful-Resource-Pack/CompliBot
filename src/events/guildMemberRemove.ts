import { Client } from "@client";
import { GuildMember } from "discord.js";
import { Event } from "@interfaces";

export const event: Event = {
	name: "guildMemberRemove",
	run: async (client: Client, member: GuildMember) => {
		client.storeAction("guildMemberUpdate", member);

		const updateChannel: string = client.config.discords.filter((s) => s.id === member.guild.id).pop()
			.channels.updateMember;
		if (updateChannel) client.updateMembers(member.guild.id, updateChannel);
	},
};
