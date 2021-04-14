const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

module.exports = {
	name: 'say',
	description: strings.HELP_DESC_SAY,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}say [message] [attach a file]`,
	example: `${prefix}say hello there`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			if (!args.length) return await message.reply(strings.SAY_NOT_SPECIFIED);

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
