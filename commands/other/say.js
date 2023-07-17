const prefix = process.env.PREFIX;

const strings = require("../../resources/strings.json");

const warnUser = require("../../helpers/warnUser.js");

module.exports = {
	name: "say",
	guildOnly: true,
	async execute(client, message, args) {
		if (!process.env.DEVELOPERS.includes(message.author.id)) return;
		if (!args.length) return warnUser(message, strings.command.args.none_given);
		else {
			if (message.attachments.size > 0)
				await message.channel.send({
					content: args.join(" "),
					files: [message.attachments.first().url],
				});
			else await message.channel.send({ content: args.join(" ") });

			await message.delete().catch();
		}
	},
};
