const prefix = process.env.PREFIX;

const { Permissions } = require("discord.js");
const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");

const date = require("../../helpers/date");
const pushTextures = require("../../functions/submission/pushTextures");
const downloadResults = require("../../functions/submission/downloadResults");
const warnUser = require("../../helpers/warnUser");

module.exports = {
	name: "autopush",
	description: strings.command.description.autopush,
	category: "Developer",
	guildOnly: false,
	uses: strings.command.use.admins,
	syntax: `${prefix}autopush [all/name_of_pack]`,
	example: `${prefix}autopush faithful_32x`,
	async execute(client, message, args) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return warnUser(message, strings.command.no_permission);
		if (!args.length) return warnUser(message, strings.command.args.none_given);

		let packs = [settings.submission.packs[args[0]]];
		if (args[0] == "all") packs = Object.values(settings.submission.packs);
		if (!packs[0]) return warnUser(message, strings.command.args.invalid);

		for (let pack of packs) await downloadResults(client, pack.channels.results);

		await pushTextures(`Manual push executed by ${message.author.username} on ${date()}`); // Push them through GitHub

		return await message.react(settings.emojis.upvote);
	},
};
