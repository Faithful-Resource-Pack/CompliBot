const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'unmute',
	description: 'Remove Muted roles to someone',
	execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				var role = message.guild.roles.cache.find(role => role.name === 'Muted');
				var member = message.mentions.members.first();
        if (!member.roles.cache.find(r => r.name === "Muted")) return message.reply('this user was never muted!');
				else {
          member.roles.remove(role);
				  const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} is now unmuted`)
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