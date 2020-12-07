const speech = require('../messages');

module.exports = {
	name: 'mute',
	description: 'Mute someone for life',
	execute(message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
        var role = message.guild.roles.cache.find(r => r.name === 'Muted');
				var member = message.mentions.members.first();

				if (args == '<@' + message.author.id  + '>') return message.reply('You can\'t mute yourself!')
        if (member.roles.cache.find(r => r.name === "Muted")) return message.reply('this user is already muted!');
				else {
					member.roles.add(role);
					message.reply(args + ' is now muted.');
				}
			} else message.reply('Please provide a user tag!');
		} else {
			return message.reply(speech.BOT_NO_PERMISSION).then(msg => {
        msg.delete({timeout: 30000});
        message.react('❌');
      });
		}
	}
};