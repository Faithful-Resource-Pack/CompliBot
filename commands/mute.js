const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'mute',
	description: 'Mute someone for life',
	async execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
        var role = message.guild.roles.cache.find(r => r.name === 'Muted');
				var member = message.mentions.members.first();

				if (args == '<@' + message.author.id  + '>') return await message.reply('you can\'t mute yourself!')
        if (member.roles.cache.find(r => r.name === "Muted")) return await message.reply('this user is already muted!');
				else {
					await member.roles.add(role);
          const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} is now muted`)
				    .setTimestamp();
			    await message.channel.send(embed);
				}
			} else await message.reply('please provide a user tag!');
		} else {
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};