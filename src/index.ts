import { Client } from "@client";
import { Constants, Intents } from "discord.js";

import config from "@json/config.json";
import tokens from "@json/tokens.json";
import { readFileSync } from "fs";
import path from "path";
import exp from "constants";

//this is my 13th reason why
export let changelogOptions = () => {
	const changelogStr = readFileSync(path.join(__dirname, "../", "CHANGELOG.md"), "utf-8").replaceAll("\r", "");
	const allVersions = changelogStr.match(/(?<=## )([^]*?)(?=(\n## )|($))/g);

	let versions = [
		[`${allVersions[0].substring(1, 7)} next`, allVersions[0].substring(1, 7)],
		[`${allVersions[1].substring(1, 7)} current`, allVersions[1].substring(1, 7)],
	];

	for (let i = 1; i < allVersions.length; i++) {
		versions.push([allVersions[i].substring(1, 7), allVersions[i].substring(1, 7)]);
	}

	return versions as [name: string, value: string][];
};

new Client({
	config: config,
	tokens: tokens,
	verbose: tokens.dev,
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
}).init();
