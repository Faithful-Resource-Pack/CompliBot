const Discord = require('discord.js');
const speech  = require('../messages');

module.exports = {
	name: 'unmute',
	aliases: ['pardon'],
	description: 'Remove Muted roles to someone',
	uses: 'Moderators',
	syntax: `${prefix}unmute <@user>`,
	async execute(client, message, args) {

		if(message.member.roles.cache.find(r => r.name === "God") || message.member.roles.cache.find(r => r.name === "Moderator") || message.member.roles.cache.find(r => r.name === "Moderators") ||message.member.roles.cache.find(r => r.name === "Mods")) {
			if (args != '') {
				var role = message.guild.roles.cache.find(role => role.name === 'Muted');
				var member = message.mentions.members.first();
        if (!member.roles.cache.find(r => r.name === "Muted")) return await message.reply('this user was never muted!');
				else {
          await member.roles.remove(role);
				  const embed = new Discord.MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL())
				    .setDescription(`${args} is now unmuted`)
				    .setTimestamp();
			    await message.channel.send(embed);
        }
			} else await message.reply('Please provide a user tag!');
		} else {
			const msg = await message.reply(speech.COMMAND_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};