const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'shutdown',
	aliases: ['logout'],
	description: strings.HELP_DESC_SHUTDOWN,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			await message.inlineReply('Shutting down...');
			await process.exit();
		}
    else warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
