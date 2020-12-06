const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'shutdown',
	description: 'stops the bot',
	execute(message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			message.channel.send('Shutting down...')
      .then(() => process.exit());
		} 
    else { 
			return message.reply(speech.BOT_NO_PERMISSION)
			.then(msg => {
				msg.delete({timeout: 30000});
				message.react('❌');
			});
		}
	}
};