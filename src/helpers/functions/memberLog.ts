import { Client } from "@client";
import axios from "axios";
import { ChannelType } from "discord.js";

export default async function memberLog(client: Client, guildID: string) {
	const settings: Record<string, any> = (await axios.get(`${client.tokens.apiUrl}settings/raw`))
		.data;

	const serverData = Object.entries(settings.guilds as Record<string, string>).find(
		(el) => el[1] == guildID,
	);

	// server doesn't have channel for member logging
	if (!serverData) return;
	const [server, serverID] = serverData;

	const channel = client.channels.cache.get(settings.channels.member_log[server]);
	const count = client.guilds.cache.get(serverID).memberCount;

	// you can add different patterns depending on the channel type
	switch (channel.type) {
		case ChannelType.GuildText:
			channel.setName(`members-${count}`);
			break;
		case ChannelType.GuildVoice:
			channel.setName(`Members: ${count}`);
			break;
	}

	return count;
}
