import type { Event } from "@interfaces/events";
import { Client } from "@client";
import { GuildMember } from "discord.js";
import memberLog from "@functions/memberLog";

export default {
	name: "guildMemberRemove",
	async execute(client: Client, member: GuildMember) {
		memberLog(client, member.guild.id);
	},
} as Event;
