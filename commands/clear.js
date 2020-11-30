const speech = require('../messages');

module.exports = {
	name: 'clear',
	description: 'Clear messages in a channel',
	execute(message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				if (isNaN(args)) return message.reply("The amount parameter isn't a number!");

				if (args > 200) return message.reply("You can't delete more than 200 messages at once!"); 
				if (args < 1) return message.reply('You have to delete at least 1 message!'); 

				var amount = parseInt(args, 10) + 1
				message.channel.messages.fetch({ limit: amount }).then(messages => {
					message.channel.bulkDelete(messages)
				});

			} else {
				message.reply('Please provide a number');
			}
		} else {
			return message.reply(speech.BOT_NO_PERMISSION).then(msg => {
        msg.delete({timeout: 30000});
        message.react('❌');
      });
		}
	}
};