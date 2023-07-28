const prefix = process.env.PREFIX;

const fs = require("fs");

const settings = require("../../resources/settings.json");
const allCollection = require("../../helpers/firestorm/all");
const retrieveSubmission = require("../../functions/submission/retrieveSubmission");
const downloadResults = require("../../functions/submission/downloadResults");
const pushTextures = require("../../functions/submission/pushTextures");
const saveDB = require("../../functions/saveDB");

const strings = require("../../resources/strings.json");

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
