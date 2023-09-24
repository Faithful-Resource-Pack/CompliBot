import { Client } from "@client";
import { ChatInputCommandInteraction, GatewayIntentBits, Partials } from "discord.js";

import config from "@json/config.json";
import tokens from "@json/tokens.json";

export function StartClient(firstStart: boolean = true, interaction?: ChatInputCommandInteraction) {
	new Client(
		{
			config: config,
			tokens: tokens,
			allowedMentions: { parse: ["users", "roles"], repliedUser: false }, // remove this line to die instantly ~JackDotJS 2021
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
