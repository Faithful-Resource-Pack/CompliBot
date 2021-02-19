const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'shutdown',
	aliases: ['logout'],
	description: 'stops the bot',
	guildOnly: false,
	uses: 'Bot Developers',
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			await message.channel.send('Shutting down...');
			await process.exit();
		}
    else warnUser(message,strings.COMMAND_NO_PERMISSION);
	}
};
