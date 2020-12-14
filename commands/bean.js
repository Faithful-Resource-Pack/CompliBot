const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'bean',
	description: 'get B E A N E D',
	execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				if (args == '<@' + message.author.id  + '>') return message.reply('You can\'t bean yourself!')
				else {
          const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} was beaned!`)
				    .setTimestamp();
			    message.channel.send(embed);
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