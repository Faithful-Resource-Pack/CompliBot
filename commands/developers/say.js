const prefix  = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const strings = require('../../ressources/strings');

const { warnUser } = require('../../helpers/warnUser.js');

module.exports = {
	name: 'say',
	description: strings.HELP_DESC_SAY,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}say [message] [attach a file]`,
	example: `${prefix}say hello there`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

			else {
				if (message.attachments.size > 0) await message.channel.send(args.join(" "), {files: [message.attachments.first().url]})
				else await message.channel.send(args.join(" "));
				
				await message.delete().catch();
			}
		} else return
	}
};
