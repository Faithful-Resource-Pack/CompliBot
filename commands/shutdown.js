const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

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
    else { 
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};