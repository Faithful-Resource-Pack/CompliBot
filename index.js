require('module-alias/register');
require("dotenv").config();
const { readdirSync } = require("fs");
const walkSync = require("@helpers/walkSync");
const fetchSettings = require("@functions/fetchSettings");
const unhandledRejection = require("@events/unhandledRejection");
const { Client, Intents, Constants, Collection } = require("discord.js");

/**
 * COMPLIBOT SUBMISSIONS INDEX FILE:
 * - Developed by and for the Faithful Community.
 * - Please read our license first.
 * - If you find any bugs, please use our GitHub issue tracker
 */
function startBot() {
	const client = new Client({
		allowedMentions: { parse: ["users", "roles"], repliedUser: false }, // remove this line to die instantly ~JackDotJS 2021
		restTimeOffset: 0,
		partials: Object.values(Constants.PartialTypes),
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MEMBERS,
			Intents.FLAGS.GUILD_BANS,
			Intents.FLAGS.GUILD_INTEGRATIONS,
			Intents.FLAGS.GUILD_PRESENCES,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
			Intents.FLAGS.GUILD_MESSAGE_TYPING,
			Intents.FLAGS.DIRECT_MESSAGES,
			Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
			Intents.FLAGS.DIRECT_MESSAGE_TYPING,
		],
	});

	exports.Client = client;

	/**
	 * COMMAND HANDLER
	 * - see the ./commands folder
	 */
	const commandFiles = walkSync("./commands").filter((f) => f.endsWith(".js"));
	client.commands = new Collection();
	for (const file of commandFiles) {
		const command = require(file);
		if ("name" in command && typeof command.name === "string")
			client.commands.set(command.name, command);
	}

	/**
	 * EVENT HANDLER
	 * - see the ./events folder
	 */
	const eventsFiles = readdirSync("./events").filter((f) => f.endsWith(".js"));
	for (const file of eventsFiles) {
		const event = require(`./events/${file}`);
		if (event.once) client.once(event.name, (...args) => event.execute(...args));
		else client.on(event.name, (...args) => event.execute(...args));
	}

	/**
	 * ERROR HANDLER
	 */
	process.on("unhandledRejection", (reason, promise) =>
		unhandledRejection(client, reason, promise),
	);

	client.login(process.env.CLIENT_TOKEN).catch(console.error);
}

// IMPORTANT: you always need to fetch settings BEFORE you start the bot
fetchSettings()
	.then(() => startBot())
	.catch((err) => {
		console.error("An error occured while fetching settings.json!");
		console.error(err.response?.data ?? err);
	});

exports.startBot = startBot;
