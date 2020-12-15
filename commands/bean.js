const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'bean',
	description: 'get B E A N E D',
	async execute(client, message, args) {
		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				if (args == '<@' + message.author.id  + '>') return await message.reply('You can\'t bean yourself!')
				else {
          const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} was beaned!`)
				    .setTimestamp();
			    await message.channel.send(embed);
				}
			} else await message.reply('Please provide a user tag!');
		} else {
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};