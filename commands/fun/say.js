const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

module.exports = {
	name: 'say',
	description: strings.HELP_DESC_SAY,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}say [message] [attach a file]`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			if (!args.length) return await message.reply('You haven\'t specified a message to send!');

			else {
				if (message.attachments.size > 0) {
					await message.channel.send(args.join(" "), {files: [message.attachments.first().url]})
				} else {
					await message.channel.send(args.join(" "));
				}
				await message.delete().catch();
			}
		} else return
	}
};
