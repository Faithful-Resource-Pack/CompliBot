import { Client } from "@client";
import { CommandInteraction, Constants, Intents } from "discord.js";

import config from "@json/config.json";
import tokens from "@json/tokens.json";

export function StartClient(firstStart: boolean = true, interaction?: CommandInteraction) {
	new Client(
		{
			config: config,
			tokens: tokens,
			verbose: tokens.verbose,
			allowedMentions: { parse: ["users", "roles"], repliedUser: false }, // remove this line to die instantly ~JackDotJS 2021
			restTimeOffset: 0,
			partials: Object.values(Constants.PartialTypes),
			intents: [
				Intents.FLAGS.GUILDS,
				Intents.FLAGS.GUILD_MEMBERS,
				Intents.FLAGS.GUILD_BANS,
				Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
				Intents.FLAGS.GUILD_INTEGRATIONS,
				Intents.FLAGS.GUILD_WEBHOOKS,
				Intents.FLAGS.GUILD_INVITES,
				Intents.FLAGS.GUILD_VOICE_STATES,
				Intents.FLAGS.GUILD_PRESENCES,
				Intents.FLAGS.GUILD_MESSAGES,
				Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
				Intents.FLAGS.GUILD_MESSAGE_TYPING,
				Intents.FLAGS.DIRECT_MESSAGES,
				Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
				Intents.FLAGS.DIRECT_MESSAGE_TYPING,
				Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
			],
		},
		firstStart,
	).init(interaction);
}

StartClient();
