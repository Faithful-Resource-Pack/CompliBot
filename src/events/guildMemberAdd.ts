import type { Event } from "@interfaces/events";
import { GuildMember } from "discord.js";
import memberLog from "@functions/memberLog";

export default {
	name: "guildMemberAdd",
	async execute(client, member: GuildMember) {
		memberLog(client, member.guild.id);
	},
} as Event;
