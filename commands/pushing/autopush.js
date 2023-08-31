const { Permissions } = require("discord.js");
const settings = require("@resources/settings.json");
const strings = require("@resources/strings.json");

const formattedDate = require("@helpers/formattedDate");
const pushTextures = require("@submission/pushTextures");
const downloadResults = require("@submission/downloadResults");
const warnUser = require("@helpers/warnUser");

module.exports = {
	name: "autopush",
	guildOnly: false,
	async execute(client, message, args) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return warnUser(message, strings.command.no_permission);
		if (!args.length) return warnUser(message, strings.command.args.none_given);

		let packs = [settings.submission.packs[args[0]]];
		if (args[0] == "all") packs = Object.values(settings.submission.packs);
		if (!packs[0]) return warnUser(message, strings.command.args.invalid);

		for (let pack of packs) await downloadResults(client, pack.channels.results);

		await pushTextures(`Manual push executed by ${message.author.username} on ${formattedDate()}`); // Push them through GitHub

		return await message.react(settings.emojis.upvote);
	},
};
