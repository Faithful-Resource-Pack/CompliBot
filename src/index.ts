import { Client } from "@client";
import { ChatInputCommandInteraction, GatewayIntentBits, Partials } from "discord.js";

import tokens from "@json/tokens.json";

export default function StartClient(firstStart = true, interaction?: ChatInputCommandInteraction) {
	new Client(
		{
			tokens,
			// remove this line to die instantly ~JackDotJS 2021
			allowedMentions: { parse: ["users", "roles"], repliedUser: false },
			partials: [
				Partials.Channel,
				Partials.GuildMember,
				Partials.GuildScheduledEvent,
				Partials.Message,
				Partials.Reaction,
				Partials.ThreadMember,
				Partials.User,
			],
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMessageTyping,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageReactions,
				GatewayIntentBits.DirectMessageTyping,
			],
		},
		firstStart,
	).init(interaction);
}

StartClient();
