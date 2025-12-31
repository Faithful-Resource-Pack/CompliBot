import { Client } from "@client";
import axios from "axios";
import { FaithfulGuild } from "@client";
import { ChannelType } from "discord.js";

export default async function memberLog(client: Client, guildID: string) {
	const guilds = (
		await axios.get<Record<string, FaithfulGuild>>(`${client.tokens.apiUrl}settings/discord.guilds`)
	).data;

	const server = Object.values(guilds).find((el) => el.id === guildID);

	// server doesn't have channel for member logging
	if (!server || !server.member_log) return;

	const channel = client.channels.cache.get(server.member_log);
	const count = client.guilds.cache.get(server.id)?.memberCount;

	// you can add different patterns depending on the channel type
	switch (channel?.type) {
		case ChannelType.GuildText:
			channel.setName(`members-${count}`);
			break;
		case ChannelType.GuildVoice:
			channel.setName(`Members: ${count}`);
			break;
	}

	return count;
}
