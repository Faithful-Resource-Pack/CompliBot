const PREFIX = process.env.PREFIX;

const fs = require("fs");

const settings = require("@resources/settings.json");
const retrieveSubmission = require("@submission/retrieveSubmission");
const downloadResults = require("@submission/downloadResults");
const pushTextures = require("@submission/pushTextures");
const saveDB = require("@functions/saveDB");

const strings = require("@resources/strings.json");

module.exports = {
	name: "hotfix",
	aliases: ["fix"],
	guildOnly: false,
	async execute(client, message, args) {
		if (!process.env.DEVELOPERS.includes(message.author.id)) return;
		// put code here on the vps when editing
		await message.react(settings.emojis.upvote);
	},
};
