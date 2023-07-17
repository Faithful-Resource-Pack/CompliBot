const prefix = process.env.PREFIX;

const saveDB = require("../../functions/saveDB");
const strings = require("../../resources/strings.json");
const settings = require("../../resources/settings.json");

module.exports = {
	name: "backup",
	aliases: ["bdb"],
	guildOnly: false,
	async execute(_client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {
			await saveDB(`Manual backup executed by: ${message.author.username}`);
			await message.react(settings.emojis.upvote);
		}
	},
};
