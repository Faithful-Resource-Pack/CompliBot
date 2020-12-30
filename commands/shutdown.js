const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'shutdown',
  aliases: ['logout'],
	description: 'stops the bot',
	uses: 'Bot Developers',
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			await message.channel.send('Shutting down...');
      await process.exit();
		} 
    else warnUser(message,speech.COMMAND_NO_PERMISSION);
	}
};